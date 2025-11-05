import React from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function CreateModal({
  isCreating,
  setIsCreating,
  newNote,
  setNewNote,
  handleFileChange,
  removeAttachment,
  handleCreateNote,
  modalRef,
}) {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [micActive, setMicActive] = React.useState(false);

  // Sync transcript into content while mic is active
  React.useEffect(() => {
    if (micActive && transcript) {
      setNewNote(prev => ({ ...prev, content: transcript }));
    }
  }, [transcript, micActive, setNewNote]);

  // Stop mic on modal close
  React.useEffect(() => {
    if (!isCreating) {
      SpeechRecognition.stopListening();
      setMicActive(false);
    }
  }, [isCreating]);

  // Permission helper
  const ensureMicrophoneAccess = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      return false;
    }
  };

  const toggleMic = async () => {
    if (!browserSupportsSpeechRecognition) return;
    if (micActive) {
      SpeechRecognition.stopListening();
      setMicActive(false);
    } else {
      const ok = await ensureMicrophoneAccess();
      if (!ok) {
        alert("Microphone access denied or not available. Please allow microphone permission or use a supported device.");
        return;
      }
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
      setMicActive(true);

      // optional auto-stop on mobile: do not aggressively restart
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        setTimeout(() => {
          if (micActive) { // if still active, ensure we stop after 25s (mobile safety)
            SpeechRecognition.stopListening();
            setMicActive(false);
          }
        }, 25000);
      }
    }
  };

  if (!isCreating) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Create new note"
      onMouseDown={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
          setIsCreating(false);
          setNewNote({ title: "", content: "", tags: "", pinned: false, attachments: [] });
        }
      }}
    >
      <div className="absolute inset-0 nk-modal-overlay" />
      <div ref={modalRef} onMouseDown={(e) => e.stopPropagation()} className="relative z-50 w-full max-w-lg rounded-xl p-4 sm:p-6 glass overflow-auto max-h-[90vh]">
        <h2 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--accent)" }}>Create New Note</h2>

        <div className="mt-3 space-y-3 relative">
          <div className="flex gap-2 items-center">
            <input
              value={newNote.title}
              onChange={(e) => setNewNote(s => ({ ...s, title: e.target.value }))}
              placeholder="Note title..."
              className="flex-1 px-3 py-2 rounded-md input-glass border border-white/6 text-sm sm:text-base"
              autoFocus
              aria-label="Note title"
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={newNote.pinned} onChange={(e) => setNewNote(s => ({ ...s, pinned: e.target.checked }))} className="cursor-pointer" aria-label="Pinned" />
              <span className="text-sm text-white/70">Pinned</span>
            </label>
          </div>

          <div className="relative">
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote(s => ({ ...s, content: e.target.value }))}
              placeholder="Write or dictate your note..."
              className="w-full px-3 py-2 rounded-md min-h-[120px] input-glass border border-white/6 text-sm sm:text-base"
              aria-label="Note content"
            />

            <button
              onClick={toggleMic}
              disabled={!browserSupportsSpeechRecognition}
              title={!browserSupportsSpeechRecognition ? "Speech recognition not supported on this device" : micActive ? "Stop voice input" : "Start voice input"}
              style={{
                position: "absolute",
                right: "15px",
                bottom: "15px",
                backgroundColor: micActive ? "rgba(14,165,233,0.85)" : "rgba(255,255,255,0.12)",
                color: browserSupportsSpeechRecognition ? "white" : "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                cursor: browserSupportsSpeechRecognition ? "pointer" : "not-allowed",
                backdropFilter: "blur(8px)",
                boxShadow: micActive ? "0 0 12px rgba(56,189,248,0.9)" : "0 0 6px rgba(255,255,255,0.12)",
                transition: "all 0.25s ease",
              }}
            >
              🎤
            </button>

            {!browserSupportsSpeechRecognition && (
              <p className="text-xs text-rose-400 mt-2">⚠️ Voice input isn’t supported in this browser. Use Chrome/Edge on desktop or Android for voice input.</p>
            )}
          </div>

          <input value={newNote.tags} onChange={(e) => setNewNote(s => ({ ...s, tags: e.target.value }))} placeholder="Tags (comma separated)" className="w-full px-3 py-2 rounded-md input-glass border border-white/6 text-sm sm:text-base" aria-label="Tags" />

          <div>
            <label className="block text-sm mb-2 text-accent font-medium">Attachments</label>
            <div className="rounded-md cursor-pointer border border-white/10 bg-white/5 p-2">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full cursor-pointer rounded-md text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[--accent] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-black hover:file:bg-[--accent-2] transition"
                aria-label="Attach files"
              />

              {newNote.attachments.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {newNote.attachments.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-md text-sm border border-white/10 hover:bg-white/10 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        {file.type?.startsWith("image/") ? (
                          <a href={file.data} target="_blank" rel="noreferrer" className="cursor-pointer">
                            <img src={file.data} alt={file.name} className="w-16 h-10 object-cover rounded-md border border-white/10" />
                          </a>
                        ) : (
                          <a href={file.data} download={file.name} className="text-accent underline text-sm cursor-pointer" target="_blank" rel="noreferrer">📎 {file.name}</a>
                        )}
                        <span className="truncate max-w-[70%]">{file.name}</span>
                      </div>
                      <button onClick={() => removeAttachment(i)} className="text-rose-400 hover:text-rose-500 cursor-pointer">✖</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setIsCreating(false); setNewNote({ title: "", content: "", tags: "", pinned: false, attachments: [] }); }} className="px-3 py-2 rounded-md border border-white/20 cursor-pointer text-sm sm:text-base">Cancel</button>
            <button onClick={handleCreateNote} className="px-4 py-2 rounded-md font-semibold btn-accent cursor-pointer text-sm sm:text-base">Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}
