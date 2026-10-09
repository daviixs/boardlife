import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'

const STORAGE_KEY = 'lifeboard.notes.v1'

function readNotes() {
  try {
    const storedNotes = window.localStorage.getItem(STORAGE_KEY)
    const parsedNotes = storedNotes ? JSON.parse(storedNotes) : []
    return Array.isArray(parsedNotes) ? parsedNotes : []
  } catch {
    return []
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `note-${Date.now()}`
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

export default function NotesPage() {
  const [notes, setNotes] = useState(readNotes)
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch {
      // Keep editing available when browser storage is disabled or full.
    }
  }, [notes])

  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      setActiveNoteId(notes[0].id)
    }
  }, [activeNoteId, notes])

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')

    return notes
      .filter((note) => `${note.title} ${note.content}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery))
      .sort((first, second) => second.updatedAt - first.updatedAt)
  }, [notes, query])

  const activeNote = notes.find((note) => note.id === activeNoteId)

  function addNote() {
    const now = Date.now()
    const note = {
      id: createId(),
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now,
    }

    setNotes((currentNotes) => [note, ...currentNotes])
    setActiveNoteId(note.id)
  }

  function updateNote(field, value) {
    setNotes((currentNotes) => currentNotes.map((note) => (
      note.id === activeNoteId
        ? { ...note, [field]: value, updatedAt: Date.now() }
        : note
    )))
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-12 pb-16 pt-10 max-[1024px]:px-7 max-[560px]:px-[18px] max-[560px]:pb-9 max-[560px]:pt-[26px]">
      <header className="mb-7 flex items-end justify-between gap-4 max-[560px]:mb-5 max-[560px]:items-start">
        <div>
          <span className="block text-[10px] font-semibold leading-5 tracking-[1.15px] text-secondary">LIFEBOARD · MÓDULOS</span>
          <h1 className="mb-1 mt-1.5 text-[30px] font-semibold leading-9 tracking-[-1.1px] text-primary">Anotações</h1>
          <p className="text-sm leading-5 text-secondary">Guarde ideias e consulte suas notas quando precisar.</p>
        </div>
        <Button label="+ Nova anotação" onClick={addNote} type="button" variant="primary" />
      </header>

      <div className="grid grid-cols-[minmax(240px,0.72fr)_minmax(320px,1.28fr)] gap-[18px] max-[760px]:grid-cols-1">
        <Card aria-label="Lista de anotações" className="flex min-h-[480px] min-w-0 flex-col p-4 max-[760px]:min-h-0">
          <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-secondary focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-accent">
            <span aria-hidden="true" className="text-sm">⌕</span>
            <input
              aria-label="Buscar anotações"
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-primary outline-none placeholder:text-secondary"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar nas anotações"
              type="search"
              value={query}
            />
          </label>

          <div className="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="grid flex-1 place-items-center px-4 py-10 text-center text-xs leading-5 text-secondary">
                {notes.length === 0 ? 'Suas anotações aparecerão aqui.' : 'Nenhuma anotação encontrada.'}
              </div>
            ) : filteredNotes.map((note) => (
              <button
                aria-current={activeNoteId === note.id ? 'true' : undefined}
                className={`flex w-full flex-col items-start gap-1 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-accent ${activeNoteId === note.id ? 'bg-muted' : 'bg-transparent'}`}
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                type="button"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <strong className="truncate text-[13px] font-semibold text-primary">{note.title || 'Sem título'}</strong>
                  <span className="shrink-0 text-[10px] text-secondary">{formatDate(note.updatedAt)}</span>
                </span>
                <span className="line-clamp-2 text-xs leading-5 text-secondary">
                  {note.content || 'Comece a escrever…'}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-[11px] text-secondary">Salvas neste navegador</span>
            <Badge label={`${notes.length}`} variant="neutral" />
          </div>
        </Card>

        <Card aria-label="Editor de anotação" className="flex min-h-[480px] min-w-0 flex-col p-6 max-[560px]:min-h-[380px] max-[560px]:p-4">
          {activeNote ? (
            <>
              <label className="sr-only" htmlFor="note-title">Título da anotação</label>
              <input
                className="w-full border-0 bg-transparent text-[22px] font-semibold tracking-tight text-primary outline-none placeholder:text-secondary"
                id="note-title"
                onChange={(event) => updateNote('title', event.target.value)}
                placeholder="Título da anotação"
                value={activeNote.title}
              />
              <div className="my-4 flex items-center justify-between border-b border-border pb-3">
                <Badge label="Anotação" variant="neutral" />
                <span className="text-[11px] text-secondary">Editada {formatDate(activeNote.updatedAt)}</span>
              </div>
              <label className="sr-only" htmlFor="note-content">Texto da anotação</label>
              <textarea
                className="min-h-[340px] flex-1 resize-y border-0 bg-transparent text-sm leading-6 text-primary outline-none placeholder:text-secondary max-[560px]:min-h-[260px]"
                id="note-content"
                onChange={(event) => updateNote('content', event.target.value)}
                placeholder="Escreva sua anotação..."
                value={activeNote.content}
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
              <span aria-hidden="true" className="mb-3 grid size-11 place-items-center rounded-xl bg-muted text-xl text-secondary">✎</span>
              <h2 className="m-0 text-sm font-semibold text-primary">Nenhuma anotação selecionada</h2>
              <p className="mb-4 mt-1 max-w-[240px] text-xs leading-5 text-secondary">Crie uma nova anotação para registrar suas ideias.</p>
              <Button label="Criar anotação" onClick={addNote} type="button" variant="secondary" />
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
