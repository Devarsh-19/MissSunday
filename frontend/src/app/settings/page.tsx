"use client";

import { useState } from "react";
import { Save } from "lucide-react";

export default function Settings() {
  const [preferences, setPreferences] = useState("Highly values enterprise software and AI scalability. Prefers bullet points and concise professional tone.");

  return (
    <div className="max-w-3xl mx-auto animate-float" style={{ animationDuration: '15s' }}>
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Preferences</h1>
        <p className="text-neutral-400">Configure how the Ranker and Personalization agents interact with you.</p>
      </header>

      <div className="glass-panel rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Agent Instructions / Preferences</label>
          <textarea
            rows={5}
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
            placeholder="Tell Miss Sunday how you prefer your information..."
          />
          <p className="text-sm text-neutral-500 mt-2">These instructions guide the Ranker and Summarizer agents when generating your Morning Briefing.</p>
        </div>

        <div className="pt-4 border-t border-white/10">
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-medium transition-all">
            <Save size={18} />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
