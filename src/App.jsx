import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const primaryItems = [
  { label: 'Início', icon: 'home' },
  { label: 'Caixa', icon: 'inbox' },
  { label: 'Atividade', icon: 'activity' },
  { label: 'Tags', icon: 'tag' },
]

const moduleItems = [
  { label: 'Pensamentos', icon: 'book', shortcut: '⌘1' },
  { label: 'Tarefas', icon: 'check', shortcut: '⌘2' },
  { label: 'Finanças', icon: 'wallet', shortcut: '⌘3' },
  { label: 'Agenda', icon: 'calendar', shortcut: '⌘4' },
  { label: 'Metas', icon: 'target', shortcut: '⌘5' },
  { label: 'GitHub', icon: 'github', shortcut: '⌘6' },
]

function Icon({ name, className = '' }) {
  const shared = {
    'aria-hidden': true,
    className: `icon ${className}`.trim(),
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
  }

  const shapes = {
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v11h13V9M9.5 20v-6h5v6" /></>,
    inbox: <><path d="M4 7.5 6 4h12l2 3.5v11H4z" /><path d="M4 13h4l1.5 2h5L16 13h4" /></>,
    activity: <path d="M3 12h4l2.5-8 5 16 2.5-8h4" />,
    tag: <><path d="M20 13 12 21l-9-9V4h8z" /><circle cx="7.5" cy="8" r="1" /></>,
    book: <><path d="M12 7c-2-2-5-2-8-1v14c3-1 6-1 8 1 2-2 5-2 8-1V6c-3-1-6-1-8 1Z" /><path d="M12 7v14" /></>,
    check: <><rect x="4" y="4" width="15" height="16" rx="2" /><path d="m8 11 2.5 2.5L20 5" /></>,
    wallet: <><path d="M5 6.5h13a2 2 0 0 1 2 2V19H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12" /><path d="M20 11h-5a2 2 0 0 0 0 4h5" /><circle cx="15" cy="13" r=".4" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7.5 3v4M16.5 3v4M4 9h16" /><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.5" /><circle cx="12" cy="12" r="2" /></>,
    github: <><path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.5a3 3 0 0 0-.8-2.3c2.7-.3 5.6-1.3 5.6-6A4.7 4.7 0 0 0 18.5 7a4.4 4.4 0 0 0-.1-3S17.4 3.7 15 5.3a13 13 0 0 0-6 0C6.6 3.7 5.6 4 5.6 4A4.4 4.4 0 0 0 5.5 7 4.7 4.7 0 0 0 4.2 10.2c0 4.7 2.9 5.7 5.6 6A3 3 0 0 0 9 18.5V22" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.3 4.3" /></>,
  }

  return <svg {...shared}>{shapes[name]}</svg>
}

function App() {
  const [query, setQuery] = useState('')
  const [activeItem, setActiveItem] = useState('')
  const searchRef = useRef(null)
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')

  const filteredPrimaryItems = useMemo(
    () => primaryItems.filter(({ label }) => label.toLocaleLowerCase('pt-BR').includes(normalizedQuery)),
    [normalizedQuery],
  )
  const filteredModuleItems = useMemo(
    () => moduleItems.filter(({ label }) => label.toLocaleLowerCase('pt-BR').includes(normalizedQuery)),
    [normalizedQuery],
  )

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  function renderItem({ label, icon, shortcut }) {
    return (
      <button
        aria-current={activeItem === label ? 'page' : undefined}
        className={`nav-item${activeItem === label ? ' is-active' : ''}`}
        key={label}
        onClick={() => setActiveItem(label)}
        type="button"
      >
        <Icon name={icon} />
        <span className="nav-label">{label}</span>
        {shortcut && <kbd className="shortcut">{shortcut}</kbd>}
      </button>
    )
  }

  return (
    <div className="app-shell">
      <aside aria-label="Menu principal" className="sidebar">
        <header className="sidebar-header">
          <div className="brand-name">LifeBoard</div>
          <div className="brand-version">v0.1 · webOS</div>
        </header>

        <div className="sidebar-scroll-area">
          <label className="search-box">
            <Icon className="search-icon" name="search" />
            <input
              aria-label="Buscar no menu"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar..."
              ref={searchRef}
              type="search"
              value={query}
            />
            <kbd className="shortcut search-shortcut">⌘K</kbd>
          </label>

          <nav aria-label="Navegação" className="navigation">
            {filteredPrimaryItems.length > 0 && (
              <div className="nav-group primary-group">
                {filteredPrimaryItems.map(renderItem)}
              </div>
            )}

            {filteredModuleItems.length > 0 && (
              <div className="nav-group module-group">
                <h2 className="group-heading">MÓDULOS</h2>
                {filteredModuleItems.map(renderItem)}
              </div>
            )}

            {filteredPrimaryItems.length === 0 && filteredModuleItems.length === 0 && (
              <p className="empty-search">Nenhum item encontrado</p>
            )}
          </nav>
        </div>
      </aside>
      <main aria-label="Conteúdo principal" className="main-content" />
    </div>
  )
}

export default App
