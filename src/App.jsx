import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@astryxdesign/core/Badge'
import FocusPage from './features/focus/FocusPage'
import GoalsPage from './features/goals/GoalsPage'
import HomePage from './features/home/HomePage'
import NotesPage from './features/notes/NotesPage'
import RecordsPage from './features/records/RecordsPage'
import TasksPage from './features/tasks/TasksPage'
import ThoughtsPage from './features/thoughts/ThoughtsPage'

const AgendaPage = lazy(() => import('./features/agenda/AgendaPage'))

const primaryItems = [
  { label: 'Início', icon: 'home' },
  { label: 'Atividade', icon: 'activity' },
]

const moduleItems = [
  { label: 'Pensamentos', icon: 'book', shortcut: '⌘1' },
  { label: 'Anotações', icon: 'note' },
  { label: 'Tarefas', icon: 'check', shortcut: '⌘2' },
  { label: 'Foco', icon: 'focus' },
  { label: 'Agenda', icon: 'calendar', shortcut: '⌘4' },
  { label: 'Metas', icon: 'target', shortcut: '⌘5' },
  { label: 'Records', icon: 'chart' },
]

function Icon({ name, className = 'size-[18px] shrink-0' }) {
  const shared = {
    'aria-hidden': true,
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
  }

  const shapes = {
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v11h13V9M9.5 20v-6h5v6" /></>,
    activity: <path d="M3 12h4l2.5-8 5 16 2.5-8h4" />,
    tag: <><path d="M20 13 12 21l-9-9V4h8z" /><circle cx="7.5" cy="8" r="1" /></>,
    book: <><path d="M12 7c-2-2-5-2-8-1v14c3-1 6-1 8 1 2-2 5-2 8-1V6c-3-1-6-1-8 1Z" /><path d="M12 7v14" /></>,
    note: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h8" /></>,
    check: <><rect x="4" y="4" width="15" height="16" rx="2" /><path d="m8 11 2.5 2.5L20 5" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7.5 3v4M16.5 3v4M4 9h16" /><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.5" /><circle cx="12" cy="12" r="2" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    focus: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /><path d="M12 1.5v2M22.5 12h-2M12 22.5v-2M1.5 12h2" /></>,
    github: <><path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.5a3 3 0 0 0-.8-2.3c2.7-.3 5.6-1.3 5.6-6A4.7 4.7 0 0 0 18.5 7a4.4 4.4 0 0 0-.1-3S17.4 3.7 15 5.3a13 13 0 0 0-6 0C6.6 3.7 5.6 4 5.6 4A4.4 4.4 0 0 0 5.5 7 4.7 4.7 0 0 0 4.2 10.2c0 4.7 2.9 5.7 5.6 6A3 3 0 0 0 9 18.5V22" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.3 4.3" /></>,
  }

  return <svg {...shared}>{shapes[name]}</svg>
}

function App() {
  const [query, setQuery] = useState('')
  const [activeItem, setActiveItem] = useState('Início')
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
        className={`group flex h-[50px] w-full shrink-0 items-center gap-3 rounded-md px-2.5 text-left text-[15px] text-secondary transition-colors hover:bg-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${activeItem === label ? 'bg-muted text-primary' : 'bg-transparent'}`}
        key={label}
        onClick={() => setActiveItem(label)}
        type="button"
      >
        <Icon name={icon} />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {shortcut && <Badge className="min-w-[22px] justify-center text-[10px]" label={shortcut} variant="neutral" />}
      </button>
    )
  }

  return (
    <div className="flex min-h-screen bg-body text-primary">
      <aside aria-label="Menu principal" className="flex h-screen w-[252px] shrink-0 flex-col overflow-hidden rounded-[3px] border border-border bg-surface">
        <header className="shrink-0 border-b border-border px-[18px] pb-[15px] pt-[18px]">
          <div className="text-[15px] font-semibold leading-5 tracking-[-0.25px] text-primary">LifeBoard</div>
          <div className="text-[13px] leading-[18px] text-secondary">v0.1 · webOS</div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-2.5">
          <label className="flex h-[37px] items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-secondary focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-accent">
            <Icon className="size-4 shrink-0" name="search" />
            <input
              aria-label="Buscar no menu"
              className="min-w-0 flex-1 appearance-none border-0 bg-transparent text-[13px] text-primary outline-none placeholder:text-secondary"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar..."
              ref={searchRef}
              type="search"
              value={query}
            />
            <Badge className="shrink-0 text-[10px]" label="⌘K" variant="neutral" />
          </label>

          <nav aria-label="Navegação" className="mt-[15px]">
            {filteredPrimaryItems.length > 0 && (
              <div className="flex flex-col">
                {filteredPrimaryItems.map(renderItem)}
              </div>
            )}

            {filteredModuleItems.length > 0 && (
              <div className="mt-px flex flex-col">
                <h2 className="m-0 h-[25px] px-2 pt-0.5 text-[11px] font-medium leading-[17px] tracking-[1px] text-secondary">MÓDULOS</h2>
                {filteredModuleItems.map(renderItem)}
              </div>
            )}

            {filteredPrimaryItems.length === 0 && filteredModuleItems.length === 0 && (
              <p className="px-2 py-3 text-[13px] text-secondary">Nenhum item encontrado</p>
            )}
          </nav>
        </div>
      </aside>
      <main aria-label="Conteúdo principal" className="min-h-screen min-w-0 flex-1 bg-body">
        <div hidden={activeItem !== 'Início'}>
          <HomePage onNavigate={setActiveItem} refreshKey={activeItem} />
        </div>
        <div hidden={activeItem !== 'Foco'}>
          <FocusPage />
        </div>
        <div hidden={activeItem !== 'Anotações'}>
          <NotesPage />
        </div>
        {activeItem === 'Agenda' && (
          <Suspense fallback={<p className="p-8 text-sm text-secondary" role="status">Carregando agenda...</p>}>
            <AgendaPage />
          </Suspense>
        )}
        <div hidden={activeItem !== 'Metas'}>
          <GoalsPage />
        </div>
        <div hidden={activeItem !== 'Pensamentos'}>
          <ThoughtsPage />
        </div>
        <div hidden={activeItem !== 'Tarefas'}>
          <TasksPage />
        </div>
        <div hidden={activeItem !== 'Records'}>
          <RecordsPage />
        </div>
      </main>
    </div>
  )
}

export default App
