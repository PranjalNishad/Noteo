import React from "react";

export default function NoteCard({ note, togglePin, handleDeleteNote, formatDate, colorFromId }) {
  const accent = colorFromId(note.id);
  return (
    <article
      className="relative rounded-xl p-4 transition shadow-lg hover:-translate-y-1"
      role="article"
      aria-label={note.title || "Note"}
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" style={{ background: `linear-gradient(180deg, ${accent}, rgba(255,255,255,0.06))` }} />
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white truncate">{note.title}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {(note.tags || []).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-white/6 text-white/90">{t}</span>)}
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <button onClick={() => togglePin(note.id)} className="px-2 py-1 rounded-md text-sm bg-white/5 hover:bg-white/10 cursor-pointer" title={note.pinned ? "Unpin" : "Pin"}>📌</button>
          <button onClick={() => handleDeleteNote(note.id)} className="text-white/70 hover:text-rose-400 cursor-pointer" title="Delete">🗑</button>
        </div>
      </div>

      <p className="text-sm text-white/80 whitespace-pre-line max-h-[120px] overflow-auto mb-2">{note.content || <em className="text-white/60">No content</em>}</p>

      {note.attachments?.length > 0 && (
        <div className="mt-2 grid grid-cols-1 gap-2">
          {note.attachments.map((file, i) => (
            <div key={i} className="flex items-center gap-3">
              {file.type?.startsWith("image/") ? (
                <img src={file.data} alt={file.name} className="w-20 h-12 object-cover rounded-md border border-white/10" />
              ) : (
                <a href={file.data} download={file.name} className="text-accent underline text-sm truncate">📎 {file.name}</a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-white/60 mt-3">Created: {formatDate(note.createdAt)}</div>
    </article>
  );
}
