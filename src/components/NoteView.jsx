import React from "react";

/**
 * Full note reader modal
 * Props:
 *  - note
 *  - onClose()
 *  - onEdit(id)
 *  - onDelete(id)
 *  - onTogglePin(id)
 *  - colorFromId(id)
 */
export default function NoteView({ note, onClose, onEdit, onDelete, onTogglePin, colorFromId }) {
  if (!note) return null;
  const accent = colorFromId ? colorFromId(note.id) : "#06b6d4";

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label={`Reading ${note.title}`} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
      <div className="absolute inset-0 nk-modal-overlay" onClick={onClose} />

      <div className="relative z-70 w-full max-w-4xl rounded-2xl p-6 sm:p-8 glass overflow-auto max-h-[92vh] shadow-2xl" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{note.title}</h2>
            <div className="text-sm text-white/60 mt-1">Created: {new Date(note.createdAt).toLocaleString()}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => onTogglePin && onTogglePin(note.id)} className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer" title={note.pinned ? "Unpin" : "Pin"}>
              {note.pinned ? "📌 Pinned" : "📌"}
            </button>

            <button onClick={() => onEdit && onEdit(note.id)} className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer" title="Edit">✏ Edit</button>

            <button onClick={() => { if (window.confirm("Delete this note?")) onDelete && onDelete(note.id); }} className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.04)] hover:bg-white/10 cursor-pointer text-rose-400">🗑 Delete</button>

            <button onClick={onClose} className="px-3 py-1 rounded-md bg-white/6 hover:bg-white/10 cursor-pointer">Close</button>
          </div>
        </div>

        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-white/90">
          <div className="mb-6 whitespace-pre-wrap leading-relaxed text-base">
            {note.content || <em className="text-white/60">No content</em>}
          </div>
        </div>

        {(note.tags || []).length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {(note.tags || []).map((t) => <span key={t} className="text-xs px-2 py-1 rounded-md bg-white/6 text-white/90">{t}</span>)}
          </div>
        )}

        {note.attachments?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm text-white/80 mb-2">Attachments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {note.attachments.map((file, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-md border border-white/10 flex items-center gap-3">
                  {file.type?.startsWith("image/") ? (
                    <a href={file.data} target="_blank" rel="noreferrer" className="block w-36 h-24 overflow-hidden rounded-md">
                      <img src={file.data} alt={file.name} className="w-full h-full object-cover" />
                    </a>
                  ) : (
                    <div className="flex-1">
                      <div className="text-sm text-white/90 font-medium">{file.name}</div>
                    </div>
                  )}

                  <div className="flex flex-col items-end gap-2">
                    {file.type?.startsWith("image/") ? (
                      <a href={file.data} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-md bg-white/6 hover:bg-white/10 text-sm cursor-pointer">Open</a>
                    ) : (
                      <a href={file.data} download={file.name} className="px-3 py-1 rounded-md bg-white/6 hover:bg-white/10 text-sm cursor-pointer">Download</a>
                    )}
                    <div className="text-xs text-white/60">{file.type || "file"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-white/60">ID: {note.id}</div>
      </div>
    </div>
  );
}
