import React from "react";

export default function Header({ theme, setTheme, THEMES, searchTerm, setSearchTerm, setIsCreating }) {
  return (
    <header className="rounded-2xl p-4 sm:p-5 glass">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl glass-light flex items-center justify-center icon-shadow text-lg sm:text-xl">📝</div>
          <div>
            <div className="text-lg sm:text-2xl font-bold" style={{ color: "var(--accent)" }}>NoteKeeper</div>
            <div className="text-xs sm:text-sm text-white/70">Your local notes</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 input-glass border border-white/6 rounded-lg w-full sm:min-w-[220px]">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm placeholder-white/50 w-full"
              placeholder="Search notes..."
              aria-label="Search notes"
            />
            <div className="text-white/60">🔍</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setSearchTerm("")} className="px-3 py-2 rounded-md border border-white/10 text-white/70 hover:bg-white/5 transition text-sm sm:text-base cursor-pointer">Clear</button>

            <select value={theme} onChange={e => setTheme(e.target.value)} className="theme-select text-sm rounded-md px-2 py-2 text-white/90">
              {Object.entries(THEMES).map(([key,val]) => <option key={key} value={key}>{val.name}</option>)}
            </select>

            <button onClick={() => setIsCreating(true)} className="px-2 h-[35px] w-[80px] sm:px-2 py-1 rounded-lg font-semibold btn-accent shadow cursor-pointer text-sm sm:text-base">➕ New</button>
          </div>
        </div>
      </div>
    </header>
  );
}
