import React, { useEffect, useMemo, useRef, useState } from "react";

const colorFromId = (id) => {
  const colors = ["#06b6d4", "#60a5fa", "#34d399", "#f59e0b", "#f97316", "#a78bfa", "#fb7185"];
  const idx = String(id).split("").reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
};

const THEMES = {
  blue: { name: "Sky Blue 💙", bg1: "#071027", bg2: "#0f172a", accent: "#38bdf8", accent2: "#60a5fa" },
  purple: { name: "Purple Dream 💜", bg1: "#1a0035", bg2: "#3b0764", accent: "#a855f7", accent2: "#c084fc" },
  green: { name: "Emerald 💚", bg1: "#022c22", bg2: "#064e3b", accent: "#10b981", accent2: "#34d399" },
  orange: { name: "Sunset Orange 🧡", bg1: "#3b0a0a", bg2: "#7c2d12", accent: "#f97316", accent2: "#fbbf24" },
  rose: { name: "Rose ❤️", bg1: "#2e0b16", bg2: "#4a0515", accent: "#e11d48", accent2: "#fb7185" },
  amber: { name: "Amber Gold 💛", bg1: "#291800", bg2: "#422006", accent: "#f59e0b", accent2: "#fbbf24" },
  pink: { name: "Pink Glow 🩷", bg1: "#2d0b26", bg2: "#4b164c", accent: "#ec4899", accent2: "#f472b6" },
  gray: { name: "Steel Gray 🩶", bg1: "#0f172a", bg2: "#1e293b", accent: "#94a3b8", accent2: "#cbd5e1" },
  white: { name: "White ✨", bg1: "#ffffff", bg2: "#f8fafc", accent: "#2563eb", accent2: "#60a5fa" },
};

const THEME_KEY = "nk-theme";

export default function NoteKeeper() {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("notes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "blue");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
    pinned: false,
    attachments: [],
  });

  const modalRef = useRef(null);

  useEffect(() => {
    const t = THEMES[theme] || THEMES.blue;
    const root = document.documentElement;
    root.style.setProperty("--bg-1", t.bg1);
    root.style.setProperty("--bg-2", t.bg2);
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-2", t.accent2);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return [...notes]
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags || []).join(" ").toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [notes, searchTerm]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setNewNote((prev) => ({
          ...prev,
          attachments: [...prev.attachments, { name: file.name, type: file.type, data: ev.target.result }],
        }));
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const removeAttachment = (i) =>
    setNewNote((prev) => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }));

  const handleCreateNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim() && !newNote.attachments.length) return;
    const note = {
      id: Date.now(),
      title: newNote.title.trim() || "Untitled Note",
      content: newNote.content,
      tags: (newNote.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      pinned: newNote.pinned,
      attachments: newNote.attachments,
      createdAt: new Date().toISOString(),
    };
    setNotes((s) => [note, ...s]);
    setNewNote({ title: "", content: "", tags: "", pinned: false, attachments: [] });
    setIsCreating(false);
  };

  const handleDeleteNote = (id) => setNotes((s) => s.filter((n) => n.id !== id));
  const togglePin = (id) => setNotes((s) => s.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));

  const formatDate = (iso) => new Date(iso).toLocaleString();

  function NoteCard({ note }) {
    const accent = colorFromId(note.id);
    return (
      <div
        className="relative rounded-xl p-4 transition shadow-lg hover:-translate-y-1"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
          style={{ background: `linear-gradient(180deg, ${accent}, rgba(255,255,255,0.06))` }}
        />
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white truncate">{note.title}</h3>
          <div className="flex gap-2">
            <button onClick={() => togglePin(note.id)} className="text-white/70 hover:text-accent cursor-pointer">
              📌
            </button>
            <button onClick={() => handleDeleteNote(note.id)} className="text-white/70 hover:text-rose-400 cursor-pointer">
              🗑
            </button>
          </div>
        </div>
        <p className="text-sm text-white/80 whitespace-pre-line max-h-[120px] overflow-auto mb-2">{note.content}</p>
        {note.attachments?.length > 0 && (
          <div className="mt-3 space-y-2">
            {note.attachments.map((file, i) =>
              file.type.startsWith("image/") ? (
                <img key={i} src={file.data} alt={file.name} className="rounded-md max-h-48 object-cover border border-white/10" />
              ) : (
                <a key={i} href={file.data} download={file.name} className="text-accent underline text-sm cursor-pointer">
                  📎 {file.name}
                </a>
              )
            )}
          </div>
        )}
        <div className="text-xs text-white/60 mt-3">Created: {formatDate(note.createdAt)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: `linear-gradient(135deg, var(--bg-1), var(--bg-2))` }}>
      <div className="max-w-[1100px] mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Header */}
        <header className="rounded-2xl p-5 glass">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center icon-shadow text-xl">📝</div>
              <div>
                <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>NoteKeeper</div>
                <div className="text-sm text-white/70">Your local notes</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg min-w-[240px]"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none text-[15px] placeholder-white/60 w-full"
                  placeholder="Search notes..."
                />
                <div className="text-white/70 text-[17px]">🔍</div>
              </div>

              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 rounded-lg text-[15px] font-medium cursor-pointer transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#f1f5f9",
                }}
              >
                Clear
              </button>

              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="text-[15px] rounded-lg px-3 py-2 cursor-pointer transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#f8fafc",
                }}
              >
                {Object.entries(THEMES).map(([key, val]) => (
                  <option key={key} value={key} style={{ color: "#000" }}>
                    {val.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 rounded-md font-semibold text-sm sm:text-base cursor-pointer shadow-md transition-all"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "var(--accent-2)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                ➕ New
              </button>
            </div>
          </div>
        </header>

        {/* Create Note Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onMouseDown={(e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) setIsCreating(false);
          }}>
            <div className="absolute inset-0 bg-black/50" />
            <div ref={modalRef} className="relative z-50 w-full max-w-lg rounded-xl p-6 glass overflow-auto max-h-[90vh]">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--accent)" }}>Create New Note</h2>
              <input
                value={newNote.title}
                onChange={(e) => setNewNote((s) => ({ ...s, title: e.target.value }))}
                placeholder="Note title..."
                className="w-full mb-3 px-3 py-2 rounded-md input-glass border border-white/6"
              />
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote((s) => ({ ...s, content: e.target.value }))}
                placeholder="Write your note..."
                className="w-full mb-3 px-3 py-2 rounded-md min-h-[120px] input-glass border border-white/6"
              />
              <input
                value={newNote.tags}
                onChange={(e) => setNewNote((s) => ({ ...s, tags: e.target.value }))}
                placeholder="Tags (comma separated)"
                className="w-full mb-3 px-3 py-2 rounded-md input-glass border border-white/6"
              />

              <div className="mb-5">
                <label className="block text-sm mb-2 text-accent font-medium">Attachments</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full cursor-pointer rounded-md border border-white/10 bg-white/5 text-sm text-white/80
                             file:cursor-pointer file:mr-4 file:rounded-md file:border-0
                             file:bg-[var(--accent)] file:px-3 file:py-1.5
                             file:text-sm file:font-medium file:text-black
                             hover:file:bg-[var(--accent-2)] hover:file:scale-[1.03]
                             transition-all duration-200"
                />

                {newNote.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {newNote.attachments.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-md text-sm border border-white/10 hover:bg-white/10 transition"
                      >
                        <div className="flex items-center gap-3">
                          {file.type?.startsWith("image/") && (
                            <img src={file.data} alt={file.name} className="w-12 h-8 object-cover rounded-md border border-white/10" />
                          )}
                          <span className="truncate max-w-[60%]">{file.name}</span>
                        </div>
                        <button onClick={() => removeAttachment(i)} className="text-rose-400 hover:text-rose-500 cursor-pointer">✖</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setIsCreating(false)} className="px-3 py-1 rounded-md border border-white/20 cursor-pointer">Cancel</button>
                <button onClick={handleCreateNote} className="px-4 py-1 rounded-md font-semibold btn-accent cursor-pointer">Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="mt-20 text-center text-white/70">
            <div className="text-6xl mb-3">📄</div>
            <p>No notes yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => setIsCreating(true)}
          className="fixed right-5 bottom-6 z-50 w-14 h-14 rounded-xl font-bold btn-accent shadow-lg cursor-pointer"
        >
          ＋
        </button>
      </div>
    </div>
  );
}
