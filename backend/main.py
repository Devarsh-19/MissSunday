from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio
import random

from core.config import settings
from core.database import get_db
from core.websocket import feed_manager
from services.scheduler import setup_scheduler, shutdown_scheduler
from services.news import fetch_news
from contextlib import asynccontextmanager


async def simulate_breaking_news():
    """Background task to simulate breaking news alerts for demonstration."""
    alerts = [
        "BREAKING: AI model breakthrough achieves new SOTA in reasoning.",
        "BREAKING: Major enterprise adopts multi-agent workflows.",
        "BREAKING: Market update: Tech stocks rally on AI advancements.",
        "BREAKING: Security alert: New vulnerability patched in standard library.",
        "BREAKING: Geopolitics: International summit concludes with AI treaty.",
    ]
    while True:
        await asyncio.sleep(random.randint(20, 40))
        news_item = random.choice(alerts)
        await feed_manager.broadcast(
            {"type": "ALERT", "message": news_item, "timestamp": "Just now"}
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start background jobs
    setup_scheduler()
    bg_task = asyncio.create_task(simulate_breaking_news())
    yield
    # Shutdown: Stop background jobs
    bg_task.cancel()
    shutdown_scheduler()


app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.NEXT_PUBLIC_API_URL]
    if hasattr(settings, "NEXT_PUBLIC_API_URL")
    else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to Miss Sunday AI Agent API"}


@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # Simple query to check db connection
        from sqlalchemy import text

        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}",
        )


from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from agents.graph import agent_graph

from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    user_id: str | None = None


# In-memory cache for news
news_cache = {}


@app.get("/api/v1/news")
async def get_news(query: str | None = None, refresh: bool = False):
    """
    Fetches news based on the given query. Uses in-memory caching unless refresh is True.
    """
    cache_key = query or "general"

    try:
        if not refresh and cache_key in news_cache:
            return {
                "news": news_cache[cache_key]["data"],
                "timestamp": news_cache[cache_key]["timestamp"],
                "cached": True,
            }

        news_items = await fetch_news(query)

        # Save to cache
        news_cache[cache_key] = {
            "data": news_items,
            "timestamp": datetime.now().isoformat(),
        }

        return {
            "news": news_items,
            "timestamp": news_cache[cache_key]["timestamp"],
            "cached": False,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch news: {str(e)}",
        )


@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Invokes the multi-agent LangGraph workflow.
    """
    initial_state = {
        "messages": [HumanMessage(content=request.message)],
        "user_id": request.user_id,
    }

    try:
        # We use ainvoke for asynchronous execution of the graph
        result = await agent_graph.ainvoke(initial_state)

        # The final output is produced by the Summarizer node
        return {
            "response": result.get("final_output"),
            "verification_status": result.get("verification_status"),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent workflow failed: {str(e)}",
        )


@app.websocket("/ws/feed")
async def websocket_feed(websocket: WebSocket):
    await feed_manager.connect(websocket)
    try:
        while True:
            # Keep connection open
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        feed_manager.disconnect(websocket)


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            user_message = data.get("message")
            user_id = data.get("user_id")

            initial_state = {
                "messages": [HumanMessage(content=user_message)],
                "user_id": user_id,
            }

            try:
                # Stream events from LangGraph
                async for event in agent_graph.astream_events(
                    initial_state, version="v2"
                ):
                    kind = event["event"]
                    # Stream tokens from the final node (personalization)
                    if kind == "on_chat_model_stream":
                        # We only want to stream tokens from the final output generation
                        if (
                            event.get("metadata", {}).get("langgraph_node")
                            == "personalization"
                        ):
                            chunk = event["data"]["chunk"].content
                            if chunk:
                                await websocket.send_json(
                                    {"type": "chunk", "content": chunk}
                                )

                # After streaming completes, we can send a done message
                await websocket.send_json({"type": "done"})

            except Exception as e:
                await websocket.send_json(
                    {"type": "error", "content": f"Agent workflow failed: {str(e)}"}
                )
    except WebSocketDisconnect:
        pass
