import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import NoteCard from "./components/NoteCard";
import CreateModal from "./components/CreateModal";

/* small helper palette */
const colorFromId = (id) => {
  const palette = ["#06b6d4","#60a5fa","#34d399","#f59e0b","#f97316","#a78bfa","#fb7185"];
  const sum = String(id).split("").reduce((s,c)=>s+c.charCodeAt(0),0);
  return palette[sum % palette.length];
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
};

const THEME_KEY = "nk-theme";

export default function NoteKeeper() {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("notes")) || []; } catch { return []; }
  });

  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "blue");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "", pinned: false, attachments: [] });

  const modalRef = useRef(null);

  useEffect(() => {
    const t = THEMES[theme] || THEMES.blue;
    const r = document.documentElement;
    r.style.setProperty("--bg-1", t.bg1);
    r.style.setProperty("--bg-2", t.bg2);
    r.style.setProperty("--accent", t.accent);
    r.style.setProperty("--accent-2", t.accent2);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem("notes", JSON.stringify(notes)); }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = (searchTerm || "").toLowerCase().trim();
    let list = notes;
    if (q) {
      list = list.filter(n => {
        const tags = (n.tags || []).join(" ");
        return (n.title||"").toLowerCase().includes(q) ||
               (n.content||"").toLowerCase().includes(q) ||
               tags.toLowerCase().includes(q);
      });
    }
    return [...list].sort((a,b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [notes, searchTerm]);

  const formatDate = (iso) => {
    try { const d = new Date(iso); return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  };

  // Files -> base64 storage in newNote.attachments
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewNote(prev => ({ ...prev, attachments: [...prev.attachments, { name: file.name, type: file.type, data: ev.target.result }] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const removeAttachment = (i) => setNewNote(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }));

  const handleCreateNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim() && !newNote.attachments.length) return;
    const note = {
      id: Date.now(),
      title: newNote.title.trim() || "Untitled Note",
      content: newNote.content,
      tags: (newNote.tags || "").split(",").map(t => t.trim()).filter(Boolean),
      pinned: !!newNote.pinned,
      attachments: newNote.attachments,
      createdAt: new Date().toISOString()
    };
    setNotes(s => [note, ...s]);
    setNewNote({ title: "", content: "", tags: "", pinned: false, attachments: [] });
    setIsCreating(false);
  };

  const handleDeleteNote = (id) => { if (window.confirm("Delete this note?")) setNotes(s => s.filter(n => n.id !== id)); };
  const togglePin = (id) => setNotes(s => s.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));

  // Update handler used by NoteCard edit save
  const handleUpdateNote = (id, updatedNote) => {
    setNotes(s => s.map(n => n.id === id ? { ...n, ...updatedNote } : n));
  };

  return (
    <main className="nk-bg min-h-screen text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Header
          theme={theme}
          setTheme={setTheme}
          THEMES={THEMES}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setIsCreating={setIsCreating}
        />

        <CreateModal
          isCreating={isCreating}
          setIsCreating={setIsCreating}
          newNote={newNote}
          setNewNote={setNewNote}
          handleFileChange={handleFileChange}
          removeAttachment={removeAttachment}
          handleCreateNote={handleCreateNote}
          modalRef={modalRef}
        />

        <section className="mt-6">
          {filteredNotes.length === 0 ? (
            <div className="mt-20 text-center text-white/70">
              <div className="text-6xl mb-3">📄</div>
              <p>No notes yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  togglePin={togglePin}
                  handleDeleteNote={handleDeleteNote}
                  formatDate={formatDate}
                  colorFromId={colorFromId}
                  onUpdate={handleUpdateNote}
                />
              ))}
            </div>
          )}
        </section>

        <div className="text-center text-white/70 mt-6">
          {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}{searchTerm ? ` — filtered by "${searchTerm}"` : ""}
        </div>

        <button onClick={() => setIsCreating(true)} aria-label="Create note" className="fixed right-4 bottom-4 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full font-bold btn-accent shadow-lg cursor-pointer flex items-center justify-center text-lg sm:text-2xl">＋</button>
      </div>
    </main>
  );
}
