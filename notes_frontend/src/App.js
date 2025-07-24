import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

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

// Helper to load the theme from localStorage or system preference (defaults to light)
function getPreferredTheme() {
  try {
    const savedTheme = localStorage.getItem('notes_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    // fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

// PUBLIC_INTERFACE
function App() {
  // Notes state management
  const [notes, setNotes] = useState(loadNotes());
  const [currentId, setCurrentId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 700);
  const [theme, setTheme] = useState(getPreferredTheme());

  // Responsive sidebar
  useEffect(() => {
    function handleResize() {
      setSidebarOpen(window.innerWidth >= 700);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { saveNotes(notes); }, [notes]);

  // Side effect for setting theme class on <html> or body
  useEffect(() => {
    // Apply as attribute for variable-based CSS
    document.documentElement.setAttribute('data-theme', theme);
    // Also save to localStorage so session persists
    localStorage.setItem('notes_theme', theme);
  }, [theme]);

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

  // PUBLIC_INTERFACE
  // Theme toggling control
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  // Utility for monochrome: fetch current CSS variable for style integration
  const getColorVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name);

  // Minimalistic Sidebar Component
  function Sidebar() {
    // Get CSS color variables for current theme
    const sidebarBg = getColorVar('--sidebar-bg') || '#f4f4f4';
    const sidebarBorder = getColorVar('--sidebar-border') || '#e0e0e0';
    const primary = getColorVar('--primary') || '#111';
    const secondary = getColorVar('--secondary') || '#555';

    return (
      <aside
        className="sidebar"
        style={{
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
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
          borderBottom: `1px solid ${sidebarBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "1.3rem",
            fontWeight: 700,
            color: primary
          }}>
            Notes
          </h2>
          <button
            onClick={createNote}
            title="Create new note"
            style={{
              background: primary,
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
            <div style={{ color: '#888', margin: "48px 0", textAlign: "center", fontSize: 16 }}>
              No notes yet.<br />Click <span style={{ color: '#222', fontWeight: 700 }}>&#43;</span> to create.
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notes.map(note => (
                <li
                  key={note.id}
                  style={{
                    borderBottom: `1px solid ${sidebarBorder}`,
                    background: note.id === currentId ? primary + "18" : "transparent",
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
                      color: note.id === currentId ? primary : secondary,
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
    // Get CSS color variables
    const lightBg = getColorVar('--bg-light') || '#fff';
    const accent = getColorVar('--accent') || '#333';
    const primary = getColorVar('--primary') || '#111';
    const secondary = getColorVar('--secondary') || '#555';
    const notePreviewBg = getColorVar('--bg-note') || '#fafafa';

    if (!currentNote && notes.length === 0) {
      return (
        <div
          className="main-empty"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100vh", color: secondary, background: lightBg
          }}>
          <h2 style={{ fontWeight: 500, color: secondary }}>Welcome to Notes</h2>
          <button
            style={{
              background: primary, color: "#fff", border: "none",
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
            height: "100vh", color: "#999", background: "#fafafa"
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
          background: lightBg,
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
              borderBottom: `2px solid ${primary}`,
              fontSize: 26,
              fontWeight: 600,
              width: "100%",
              padding: "7px 4px",
              background: "transparent",
              color: secondary,
              outline: "none"
            }}
            aria-label="Note title"
            maxLength={100}
          />
          <button
            onClick={() => deleteNote(currentNote.id)}
            style={{
              background: accent,
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
            border: `1.5px solid ${secondary}20`,
            borderRadius: 8,
            fontSize: 16,
            padding: "15px 14px",
            fontFamily: "inherit",
            background: notePreviewBg,
            color: secondary,
            outline: "none"
          }}
          aria-label="Note content"
        />
        <div style={{
          fontSize: 12,
          color: "#aaa",
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

  // Header / Topbar with theme toggle
  function TopBar() {
    // Get CSS color variables for background and border
    const lightBg = getColorVar('--bg-light') || '#fff';
    const sidebarBorder = getColorVar('--sidebar-border') || '#e0e0e0';
    const secondary = getColorVar('--secondary') || '#555';
    const primary = getColorVar('--primary') || '#111';

    return (
      <header
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: lightBg, height: 55, minHeight: 55, position: "fixed",
          left: 0, right: 0, top: 0, zIndex: 11, borderBottom: `1px solid ${sidebarBorder}`,
          boxSizing: "border-box", padding: "0 0 0 0"
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            fontSize: 26,
            color: secondary,
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
            color: primary,
            letterSpacing: "-1px",
            paddingLeft: sidebarOpen ? 26 : 0
          }}
        >
          Personal Notes
        </div>
        {/* Theme toggle button (icon toggle) */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: "none",
            border: "none",
            color: secondary,
            fontSize: 24,
            marginRight: 8,
            cursor: "pointer",
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "background 0.18s"
          }}
        >
          {theme === 'dark' ? (
            // Light mode icon (sun, Unicode 2600)
            <span role="img" aria-label="Light mode" style={{fontSize: 22}}>☀️</span>
          ) : (
            // Dark mode icon (moon, Unicode 1F311 or 263E)
            <span role="img" aria-label="Dark mode" style={{fontSize: 22}}>🌙</span>
          )}
        </button>
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
            background: "rgba(0,0,0,0.12)", zIndex: 20
          }}
          onClick={handleSidebarToggle}
        ></div>
      );
    }
    return null;
  }

  // Layout: sidebar left, main right
  // Top-level always gets theme as data attribute
  return (
    <div
      className="notes-app"
      style={{
        minHeight: "100vh",
        background: "var(--bg-light)",
        color: "var(--secondary)",
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
          background: "var(--bg-light)",
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
