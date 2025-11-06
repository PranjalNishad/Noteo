import React, { useState } from "react";

/**
 * NoteCard
 * props:
 *  - note
 *  - togglePin(id)
 *  - handleDeleteNote(id)
 *  - formatDate(iso)
 *  - colorFromId(id)
 *  - onUpdate(id, updatedNote)  // called by Save inside the card
 *  - onOpen(note)               // called when user taps the card (for full view)
 */
export default function NoteCard({ note, togglePin, handleDeleteNote, formatDate, colorFromId, onUpdate, onOpen }) {
  const accent = colorFromId(note.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title || "");
  const [editContent, setEditContent] = useState(note.content || "");

  const startEdit = () => { setEditTitle(note.title || ""); setEditContent(note.content || ""); setIsEditing(true); };
  const cancelEdit = () => { setEditTitle(note.title || ""); setEditContent(note.content || ""); setIsEditing(false); };
  const saveEdit = () => {
    const updated = { ...note, title: (editTitle || "").trim() || "Untitled Note", content: editContent };
    if (typeof onUpdate === "function") onUpdate(note.id, updated);
    setIsEditing(false);
  };

  return (
    <article
      className="relative rounded-xl p-4 transition shadow-lg hover:-translate-y-1 cursor-pointer"
      role="article"
      aria-label={note.title || "Note"}
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      onClick={(e) => {
        // avoid opening when clicking interactive controls (buttons, links, inputs)
        const tag = (e.target && e.target.tagName) || "";
        if (["BUTTON","A","INPUT","TEXTAREA","SVG","PATH","LABEL"].includes(tag)) return;
        if (typeof onOpen === "function") onOpen(note);
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" style={{ background: `linear-gradient(180deg, ${accent}, rgba(255,255,255,0.06))` }} />

      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0">
          {isEditing ? (
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-transparent outline-none text-lg font-semibold text-white" placeholder="Note title..." />
          ) : (
            <h3 className="text-base sm:text-lg font-semibold text-white truncate">{note.title}</h3>
          )}

          {(note.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(note.tags || []).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-white/6 text-white/90">{t}</span>)}
            </div>
          )}
        </div>

        <div className="flex gap-2 items-start">
          {isEditing ? (
            <>
              <button onClick={saveEdit} className="px-2 py-1 rounded-md text-sm bg-[rgba(255,255,255,0.06)] hover:bg-white/10 cursor-pointer" title="Save">Save</button>
              <button onClick={cancelEdit} className="px-2 py-1 rounded-md text-sm bg-[rgba(255,255,255,0.04)] hover:bg-white/10 cursor-pointer" title="Cancel">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); startEdit(); }} className="px-2 py-1 rounded-md text-sm bg-white/5 hover:bg-white/10 cursor-pointer" title="Edit">✏</button>
              <button onClick={(e) => { e.stopPropagation(); togglePin(note.id); }} className="px-2 py-1 rounded-md text-sm bg-white/5 hover:bg-white/10 cursor-pointer" title={note.pinned ? "Unpin" : "Pin"}>📌</button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-white/70 hover:text-rose-400 cursor-pointer" title="Delete">🗑</button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full text-sm text-white/80 bg-transparent outline-none min-h-[100px] resize-y" />
      ) : (
        <p className="text-sm text-white/80 whitespace-pre-line max-h-[120px] overflow-auto mb-2">{note.content || <em className="text-white/60">No content</em>}</p>
      )}

      {note.attachments?.length > 0 && (
        <div className="mt-3 space-y-2">
          {note.attachments.map((file, i) => (
            <div key={i} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-md text-sm border border-white/10 hover:bg-white/10 transition">
              <div className="flex items-center gap-3 min-w-0">
                {file.type?.startsWith("image/") ? (
                  <a href={file.data} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} className="cursor-pointer">
                    <img src={file.data} alt={file.name} className="w-16 h-10 object-cover rounded-md border border-white/10" />
                  </a>
                ) : (
                  <a href={file.data} download={file.name} onClick={(e)=>e.stopPropagation()} className="text-accent underline text-sm cursor-pointer" target="_blank" rel="noreferrer">📎 {file.name}</a>
                )}
                <span className="truncate max-w-[60%]">{file.name}</span>
              </div>
              <div className="text-xs text-white/60"> </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-white/60 mt-3">Created: {formatDate(note.createdAt)}</div>
    </article>
  );
}
