import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Color palette
const COLORS = {
  primary: '#1976d2',
  accent: '#ff4081',
  secondary: '#424242',
  lightBg: '#fff',
  sidebarBg: '#f5f6fa',
  sidebarBorder: '#e3e5ea',
  notePreviewBg: '#f9fafe'
};

// Helper to load notes from localStorage
function loadNotes() {
  try {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Helper to save notes to localStorage
function saveNotes(notes) {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// PUBLIC_INTERFACE
function App() {
  // Notes state management
  const [notes, setNotes] = useState(loadNotes());
  const [currentId, setCurrentId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 700);
  const [theme] = useState('light'); // Always light as per requirements

  // Responsive sidebar
  useEffect(() => {
    function handleResize() {
      setSidebarOpen(window.innerWidth >= 700);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { saveNotes(notes); }, [notes]);

  // Current note derived
  const currentNote = notes.find(n => n.id === currentId);

  // PUBLIC_INTERFACE
  const createNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setCurrentId(newNote.id);
  };

  // PUBLIC_INTERFACE
  const updateNote = useCallback((id, updates) => {
    setNotes(notes =>
      notes.map(note =>
        note.id === id
          ? { ...note, ...updates, updated: new Date().toISOString() }
          : note
      )
    );
  }, []);

  // PUBLIC_INTERFACE
  const deleteNote = useCallback(id => {
    setNotes(notes => notes.filter(note => note.id !== id));
    if (currentId === id) setCurrentId(null);
  }, [currentId]);

  // PUBLIC_INTERFACE
  const selectNote = id => setCurrentId(id);

  // PUBLIC_INTERFACE
  const updateCurrentNoteField = (field, val) => {
    if (!currentNote) return;
    updateNote(currentNote.id, { [field]: val });
  };

  // PUBLIC_INTERFACE
  const handleSidebarToggle = () => setSidebarOpen(open => !open);

  // Minimalistic Sidebar Component
  function Sidebar() {
    return (
      <aside
        className="sidebar"
        style={{
          background: COLORS.sidebarBg,
          borderRight: `1px solid ${COLORS.sidebarBorder}`,
          minWidth: 220,
          maxWidth: 275,
          width: sidebarOpen ? 240 : 0,
          transition: "width 0.25s cubic-bezier(.52,.01,.8,1)",
          overflow: "hidden",
          height: "100vh",
          boxSizing: "border-box"
        }}
      >
        <div className="sidebar-header" style={{
          padding: "22px 18px 10px 20px",
          borderBottom: `1px solid ${COLORS.sidebarBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "1.3rem",
            fontWeight: 700,
            color: COLORS.primary
          }}>
            Notes
          </h2>
          <button
            onClick={createNote}
            title="Create new note"
            style={{
              background: COLORS.primary,
              color: "white",
              border: "none",
              borderRadius: 6,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(32,44,56,0.05)"
            }}
            aria-label="New Note"
          >+</button>
        </div>
        <nav className="sidebar-noteslist" style={{ flex: 1, overflowY: "auto", height: "calc(100vh - 62px)" }}>
          {notes.length === 0 ? (
            <div style={{ color: '#b0b3b8', margin: "48px 0", textAlign: "center", fontSize: 16 }}>
              No notes yet.<br />Click <span style={{ color: COLORS.primary, fontWeight: 700 }}>&#43;</span> to create.
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notes.map(note => (
                <li
                  key={note.id}
                  style={{
                    borderBottom: `1px solid ${COLORS.sidebarBorder}`,
                    background: note.id === currentId ? COLORS.primary + "18" : "transparent",
                  }}
                >
                  <button
                    onClick={() => selectNote(note.id)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      padding: "16px 16px 14px 22px",
                      cursor: "pointer",
                      color: note.id === currentId ? COLORS.primary : COLORS.secondary,
                      fontWeight: note.id === currentId ? 700 : 500,
                      fontSize: 17,
                      outline: "none"
                    }}
                    aria-current={note.id === currentId ? "page" : undefined}
                  >
                    <div>{note.title || "Untitled"}</div>
                    <div style={{
                      fontSize: 13,
                      color: "#999",
                      marginTop: "3px",
                      fontWeight: 400,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {(note.content || '').split('\n')[0].slice(0, 32)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
        <div style={{ minHeight: 35 }} />
      </aside>
    );
  }

  // Minimalistic Main Editor Area
  function Main() {
    if (!currentNote && notes.length === 0) {
      return (
        <div
          className="main-empty"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100vh", color: COLORS.secondary, background: COLORS.lightBg
          }}>
          <h2 style={{ fontWeight: 500, color: COLORS.secondary }}>Welcome to Notes</h2>
          <button
            style={{
              background: COLORS.primary, color: "#fff", border: "none",
              borderRadius: 8, fontSize: 18, fontWeight: 600,
              padding: "12px 38px", marginTop: 24, cursor: "pointer"
            }}
            onClick={createNote}
          >Create your first note</button>
        </div>
      );
    }

    if (!currentNote) {
      return (
        <div
          className="main-noselect"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100vh", color: "#b0b3b8", background: "#fff"
          }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 400, marginBottom: 4 }}>Select a note</div>
            <div style={{ fontSize: 15 }}>Choose an item from the sidebar</div>
          </div>
        </div>
      );
    }

    // Editable note fields
    return (
      <div
        className="main-editor"
        style={{
          padding: "36px 22px 18px 28px",
          maxWidth: 700,
          margin: "0 auto",
          background: COLORS.lightBg,
          minHeight: "100vh",
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="text"
            value={currentNote.title}
            placeholder="Title"
            onChange={e => updateCurrentNoteField('title', e.target.value)}
            style={{
              border: "none",
              borderBottom: `2px solid ${COLORS.primary}`,
              fontSize: 26,
              fontWeight: 600,
              width: "100%",
              padding: "7px 4px",
              background: "transparent",
              color: COLORS.secondary,
              outline: "none"
            }}
            aria-label="Note title"
            maxLength={100}
          />
          <button
            onClick={() => deleteNote(currentNote.id)}
            style={{
              background: COLORS.accent,
              border: "none",
              color: "#fff",
              fontWeight: 700,
              fontSize: 17,
              borderRadius: 6,
              padding: "6px 16px",
              cursor: "pointer",
              marginLeft: 6,
              transition: "background 0.18s"
            }}
            aria-label="Delete note"
            title="Delete this note"
          >
            Delete
          </button>
        </div>
        <textarea
          value={currentNote.content}
          onChange={e => updateCurrentNoteField('content', e.target.value)}
          placeholder="Write your note here…"
          style={{
            marginTop: 24,
            width: "100%",
            height: "55vh",
            resize: "vertical",
            border: `1.5px solid ${COLORS.secondary}20`,
            borderRadius: 8,
            fontSize: 16,
            padding: "15px 14px",
            fontFamily: "inherit",
            background: COLORS.notePreviewBg,
            color: COLORS.secondary,
            outline: "none"
          }}
          aria-label="Note content"
        />
        <div style={{
          fontSize: 12,
          color: "#b0b3b7",
          marginTop: 18,
          fontWeight: 400
        }}>
          Created: {new Date(currentNote.created).toLocaleString()}
          {" • "}
          Last edited: {new Date(currentNote.updated).toLocaleString()}
        </div>
      </div>
    );
  }

  // Header / Topbar (minimal)
  function TopBar() {
    return (
      <header
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: COLORS.lightBg, height: 55, minHeight: 55, position: "fixed",
          left: 0, right: 0, top: 0, zIndex: 11, borderBottom: `1px solid ${COLORS.sidebarBorder}`,
          boxSizing: "border-box", padding: "0 0 0 0"
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            fontSize: 26,
            color: COLORS.secondary,
            padding: "0 18px",
            display: sidebarOpen ? "none" : undefined,
            cursor: "pointer",
            outline: "none"
          }}
          aria-label="Open sidebar"
          title="Open sidebar"
          onClick={handleSidebarToggle}
        >
          ☰
        </button>
        <div
          style={{
            fontWeight: 700,
            fontSize: 20,
            color: COLORS.primary,
            letterSpacing: "-1px",
            paddingLeft: sidebarOpen ? 26 : 0
          }}
        >
          Personal Notes
        </div>
        <div style={{ width: 90 }} />
      </header>
    );
  }

  // Overlay for mobile sidebar
  function SidebarOverlay() {
    if (sidebarOpen && window.innerWidth < 700) {
      return (
        <div
          style={{
            position: "fixed",
            left: 0, top: 0, width: "100vw", height: "100vh",
            background: "#0005", zIndex: 20
          }}
          onClick={handleSidebarToggle}
        ></div>
      );
    }
    return null;
  }

  // Layout: sidebar left, main right
  return (
    <div
      className="notes-app"
      style={{
        minHeight: "100vh",
        background: COLORS.lightBg,
        color: COLORS.secondary,
        fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', 'Helvetica Neue', Arial, sans-serif"
      }}
      data-theme={theme}
    >
      <TopBar />
      <div style={{ display: "flex", width: "100%", height: "100vh", paddingTop: 55 }}>
        {/* Sidebar (hide on mobile unless open) */}
        { (sidebarOpen || window.innerWidth >= 700) && (
          <Sidebar />
        )}
        {/* Overlay for mobile sidebar */}
        <SidebarOverlay />
        {/* Main note content area */}
        <main style={{
          flex: 1,
          background: COLORS.lightBg,
          minHeight: "calc(100vh - 55px)",
          maxWidth: "100vw",
          transition: "margin-left 0.23s",
        }}>
          <Main />
        </main>
      </div>
      <style>{`
      @media (max-width: 900px) {
        .sidebar { min-width: 158px !important; width: 18vw !important; }
        .main-editor { padding-left: 6vw !important; }
      }
      @media (max-width: 700px) {
        .sidebar { position: fixed; top: 55px; left: 0; height: 100vh; z-index: 25; }
        .main-editor { padding-left: 5vw !important; }
      }
      @media (max-width: 550px) {
        .sidebar { width: 95vw !important; min-width: 0 !important; }
        .main-editor { padding-left: 0 !important; padding-right: 2vw !important; }
      }
      `}</style>
    </div>
  );
}

export default App;
