"use client";

import { useState } from "react";

import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { HomeHero } from "@/components/content/HomeHero";
import { ScriptDoctorDashboard } from "@/components/script/ScriptDoctorDashboard";
import { COPY } from "@/lib/copy";

type ToolTab = "packaging" | "script";

export function HomeToolTabs() {
  const [activeTab, setActiveTab] = useState<ToolTab>("packaging");

  const heroTitle =
    activeTab === "script" ? COPY.heroScript.title : COPY.hero.title;
  const heroSubtitle =
    activeTab === "script" ? COPY.heroScript.subtitle : COPY.hero.subtitle;
  const heroSeoIntro =
    activeTab === "script" ? COPY.heroScript.seoIntro : COPY.seoIntro;

  return (
    <div>
      <HomeHero
        title={heroTitle}
        subtitle={heroSubtitle}
        seoIntro={heroSeoIntro}
      />
      <div
        role="tablist"
        aria-label="Creator tools"
        className="mb-8 flex flex-wrap gap-2 rounded-xl border border-orange-500/20 bg-zinc-900/40 p-1.5"
      >
        <button
          type="button"
          role="tab"
          id="tab-packaging"
          aria-selected={activeTab === "packaging"}
          aria-controls="panel-packaging"
          onClick={() => setActiveTab("packaging")}
          className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "packaging"
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {COPY.tabs.packaging}
        </button>
        <button
          type="button"
          role="tab"
          id="tab-script"
          aria-selected={activeTab === "script"}
          aria-controls="panel-script"
          onClick={() => setActiveTab("script")}
          className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "script"
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {COPY.tabs.script}
        </button>
      </div>

      <div
        role="tabpanel"
        id="panel-packaging"
        aria-labelledby="tab-packaging"
        hidden={activeTab !== "packaging"}
      >
        {activeTab === "packaging" && <HomeDashboard />}
      </div>
      <div
        role="tabpanel"
        id="panel-script"
        aria-labelledby="tab-script"
        hidden={activeTab !== "script"}
      >
        {activeTab === "script" && <ScriptDoctorDashboard />}
      </div>
    </div>
  );
}
