"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled ensures Three.js 3D Mesh, HTML5 Canvas,
// and localStorage run seamlessly in client context without hydration mismatches.
const PrismCockpit = dynamic(() => import("@/src/App"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-[#08090A] text-slate-400 font-mono text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 animate-pulse" />
        <span>Initializing PRISM Examination Cockpit...</span>
      </div>
    </div>
  ),
});

export default function Page() {
  return <PrismCockpit />;
}
