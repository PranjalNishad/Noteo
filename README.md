# Noteo

A fast, beautiful note-taking app built with React and Vite. Capture notes, organize them with tags and pins, attach files, and even dictate notes with your voice — all stored locally in your browser.

## Features

- **Create, edit, and delete notes** with titles, content, and comma-separated tags
- **Pin notes** to keep important ones at the top
- **Full-text search** across titles, content, and tags
- **Voice dictation** — dictate note content using the Web Speech API
- **File attachments** — attach images and files (preview images inline, download the rest)
- **Note reader view** — open any note in a distraction-free full view
- **9 color themes** — Sky Blue, Purple Dream, Emerald, Sunset Orange, Rose, Amber Gold, Pink Glow, Steel Gray, and Pure Black
- **Local persistence** — notes and theme are saved to `localStorage`; no account or server needed
- **Responsive layout** — adaptive grid that scales from mobile to desktop

## Tech Stack

- [React 19](https://react.dev/) — UI library
- [Vite 7](https://vite.dev/) — build tool and dev server
- [Tailwind CSS 4](https://tailwindcss.com/) — styling
- [react-speech-recognition](https://github.com/JamesBrill/react-speech-recognition) — voice input

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
git clone git@github.com:PranjalNishad/Noteo.git
cd Noteo
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173` with hot module reloading.

## Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the development server       |
| `npm run build`   | Build for production into `dist/`  |
| `npm run preview` | Preview the production build       |
| `npm run lint`    | Run ESLint across the project      |

## Project Structure

```
Noteo/
├── index.html              # App entry point
├── src/
│   ├── main.jsx            # React root
│   ├── App.jsx             # Main app: state, themes, note logic
│   ├── index.css           # Global styles and theme variables
│   └── components/
│       ├── Header.jsx      # Search, theme picker, new-note button
│       ├── NoteCard.jsx    # Grid card with pin/delete/inline edit
│       ├── CreateModal.jsx # Create/edit modal with dictation and attachments
│       └── NoteView.jsx    # Full-screen note reader
└── public/                 # Static assets
```

## Notes and Limitations

- **Voice input** requires a browser with Web Speech API support (Chrome/Edge on desktop, Android). It won't work in Firefox or Safari.
- **Data is stored locally** in your browser via `localStorage`. Clearing site data will erase your notes.
- Attachments are stored as Data URLs inside the note, so very large files can exhaust `localStorage` quota (typically ~5 MB).
- Notes are prefilled in English (India) for speech recognition (`en-IN`).
