import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'

const STORAGE_KEY = 'lifeboard.thoughts.v1'

function readThoughts() {
  try {
    const storedThoughts = window.localStorage.getItem(STORAGE_KEY)
    const parsedThoughts = storedThoughts ? JSON.parse(storedThoughts) : []
    return Array.isArray(parsedThoughts) ? parsedThoughts : []
  } catch {
    return []
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `thought-${Date.now()}`
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export default function ThoughtsPage() {
  const [thoughts, setThoughts] = useState(readThoughts)
  const [draft, setDraft] = useState('')
  const [activeThoughtId, setActiveThoughtId] = useState(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts))
    } catch {
      // Keep writing available when browser storage is disabled or full.
    }
  }, [thoughts])

  const orderedThoughts = useMemo(
    () => [...thoughts].sort((first, second) => second.createdAt - first.createdAt),
    [thoughts],
  )
  const activeThought = thoughts.find((thought) => thought.id === activeThoughtId)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (activeThought && !dialog.open) dialog.showModal()
    if (!activeThought && dialog.open) dialog.close()
  }, [activeThought])

  function addThought(event) {
    event.preventDefault()
    const content = draft.trim()
    if (!content) return

    setThoughts((currentThoughts) => [
      { id: createId(), content, createdAt: Date.now() },
      ...currentThoughts,
    ])
    setDraft('')
  }

  function closeThought() {
    setActiveThoughtId(null)
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-12 pb-16 pt-10 max-[1024px]:px-7 max-[560px]:px-[18px] max-[560px]:pb-9 max-[560px]:pt-[26px]">
      <header className="mb-7 max-[560px]:mb-5">
        <span className="block text-[10px] font-semibold leading-5 tracking-[1.15px] text-secondary">LIFEBOARD · MÓDULOS</span>
        <h1 className="mb-1 mt-1.5 text-[30px] font-semibold leading-9 tracking-[-1.1px] text-primary">Pensamentos</h1>
        <p className="text-sm leading-5 text-secondary">Anote uma ideia rápida. Clique em um cartão para abrir o pensamento.</p>
      </header>

      <Card className="mb-6 p-5 max-[560px]:p-4">
        <form className="flex flex-col items-start gap-3" onSubmit={addThought}>
          <label className="w-full text-xs font-medium text-secondary" htmlFor="thought-draft">Novo pensamento</label>
          <textarea
            className="min-h-[100px] w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-6 text-primary outline-none placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-accent"
            id="thought-draft"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="O que está passando pela sua cabeça?"
            value={draft}
          />
          <div className="flex w-full items-center justify-between gap-3 max-[560px]:items-start">
            <span className="text-[11px] text-secondary">Seus pensamentos ficam salvos neste navegador.</span>
            <Button isDisabled={!draft.trim()} label="Guardar pensamento" type="submit" variant="primary" />
          </div>
        </form>
      </Card>

      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="m-0 text-sm font-semibold text-primary">Seus pensamentos</h2>
        <Badge label={`${thoughts.length}`} variant="neutral" />
      </div>

      {orderedThoughts.length === 0 ? (
        <Card className="grid min-h-[200px] place-items-center px-5 py-10 text-center">
          <div>
            <span aria-hidden="true" className="mb-3 inline-grid size-10 place-items-center rounded-xl bg-muted text-lg text-secondary">✦</span>
            <p className="m-0 text-sm font-medium text-primary">Seu mural está vazio</p>
            <p className="mb-0 mt-1 text-xs leading-5 text-secondary">Escreva um pensamento acima para começar.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-3 items-start gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          {orderedThoughts.map((thought) => (
            <Card className="min-w-0 p-0 transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-md" key={thought.id}>
              <button
                aria-haspopup="dialog"
                className="flex min-h-[150px] w-full flex-col items-start rounded-lg p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                onClick={() => setActiveThoughtId(thought.id)}
                type="button"
              >
                <span className="mb-2 text-[10px] font-medium text-secondary">{formatDate(thought.createdAt)}</span>
                <span className="line-clamp-5 whitespace-pre-wrap text-[13px] leading-5 text-primary">{thought.content}</span>
                <span className="mt-auto pt-3 text-[11px] font-medium text-secondary">Abrir pensamento ↗</span>
              </button>
            </Card>
          ))}
        </div>
      )}

      <dialog
        aria-labelledby="thought-dialog-title"
        className="thought-dialog m-auto w-[min(560px,calc(100vw-32px))] max-w-none rounded-2xl border border-border bg-surface p-0 text-primary shadow-xl backdrop:bg-black/30"
        onCancel={closeThought}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeThought()
        }}
        onClose={() => setActiveThoughtId(null)}
        ref={dialogRef}
      >
        {activeThought && (
          <div className="p-6 max-[560px]:p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[1px] text-secondary">Pensamento</p>
                <h2 className="m-0 text-xs font-medium text-secondary" id="thought-dialog-title">{formatDate(activeThought.createdAt)}</h2>
              </div>
              <Button aria-label="Fechar pensamento" icon={<span aria-hidden="true">×</span>} isIconOnly label="Fechar pensamento" onClick={closeThought} type="button" variant="ghost" />
            </div>
            <p className="m-0 max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-[15px] leading-7 text-primary">{activeThought.content}</p>
          </div>
        )}
      </dialog>
    </div>
  )
}
