import { useEffect, useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import classicThemePlugin from '@fullcalendar/react/themes/classic'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import interactionPlugin from '@fullcalendar/react/interaction'
import ptBrLocale from '@fullcalendar/react/locales/pt-br'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import {
  AGENDA_STORAGE_KEY,
  createAgendaId,
  readAgendaNotes,
  toCalendarEvent,
} from './agendaStorage'
import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/classic/theme.css'
import '@fullcalendar/react/themes/classic/palette.css'

function todayAsDateInput() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createDraft(date = todayAsDateInput()) {
  return { id: null, date, title: '', body: '' }
}

export default function AgendaPage() {
  const [notes, setNotes] = useState(readAgendaNotes)
  const [draft, setDraft] = useState(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(notes))
    } catch {
      // Keep the calendar usable when browser storage is disabled or full.
    }
  }, [notes])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (draft && !dialog.open) dialog.showModal()
    if (!draft && dialog.open) dialog.close()
  }, [draft])

  const events = useMemo(() => notes.map(toCalendarEvent), [notes])

  function openNewNote(date = todayAsDateInput()) {
    setDraft(createDraft(date))
  }

  function openExistingNote(eventInfo) {
    const note = notes.find((item) => item.id === eventInfo.event.id)
    if (note) setDraft({ ...note })
  }

  function closeDialog() {
    setDraft(null)
  }

  function updateDraft(field, value) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }))
  }

  function saveNote(event) {
    event.preventDefault()
    const title = draft?.title.trim()
    const body = draft?.body.trim()
    if (!draft || !title || !body || !draft.date) return

    const now = Date.now()
    if (draft.id) {
      setNotes((currentNotes) => currentNotes.map((note) => (
        note.id === draft.id
          ? { ...note, date: draft.date, title, body, updatedAt: now }
          : note
      )))
    } else {
      setNotes((currentNotes) => [
        ...currentNotes,
        { id: createAgendaId(), date: draft.date, title, body, createdAt: now, updatedAt: now },
      ])
    }
    closeDialog()
  }

  function deleteNote() {
    if (!draft?.id) return
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== draft.id))
    closeDialog()
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-10 pb-14 pt-9 max-[1024px]:px-7 max-[560px]:px-[18px] max-[560px]:pb-9 max-[560px]:pt-[26px]">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 max-[560px]:mb-5">
        <div>
          <span className="block text-[10px] font-semibold leading-5 tracking-[1.15px] text-secondary">LIFEBOARD · MÓDULOS</span>
          <h1 className="mb-1 mt-1.5 text-[30px] font-semibold leading-9 tracking-[-1.1px] text-primary">Agenda</h1>
          <p className="text-sm leading-5 text-secondary">Registre suas anotações por dia e encontre seus planos no calendário.</p>
        </div>
        <Button label="+ Nova anotação" onClick={() => openNewNote()} type="button" variant="primary" />
      </header>

      <Card className="agenda-calendar min-w-0 p-5 max-[560px]:p-3">
        <FullCalendar
          dayMaxEvents={3}
          dateClick={(info) => openNewNote(info.dateStr.slice(0, 10))}
          eventClick={openExistingNote}
          eventColor="var(--color-accent-muted)"
          eventContrastColor="var(--color-text-primary)"
          events={events}
          firstDay={1}
          height="auto"
          initialView="dayGridMonth"
          locale={ptBrLocale}
          plugins={[dayGridPlugin, interactionPlugin, classicThemePlugin]}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
        />
      </Card>

      <p className="mb-0 mt-3 text-xs text-secondary">Clique em um dia para anotar. Suas anotações ficam salvas neste navegador.</p>

      <dialog
        aria-labelledby="agenda-dialog-title"
        className="agenda-dialog m-auto w-[min(560px,calc(100vw-32px))] max-w-none rounded-2xl border border-border bg-surface p-0 text-primary shadow-xl backdrop:bg-black/30"
        onCancel={closeDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog()
        }}
        onClose={() => setDraft(null)}
        ref={dialogRef}
      >
        {draft && (
          <form className="p-6 max-[560px]:p-5" onSubmit={saveNote}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[1px] text-secondary">Anotação da agenda</p>
                <h2 className="m-0 text-lg font-semibold text-primary" id="agenda-dialog-title">
                  {draft.id ? 'Editar anotação' : 'Nova anotação'}
                </h2>
              </div>
              <Button aria-label="Fechar anotação" icon={<span aria-hidden="true">×</span>} isIconOnly label="Fechar anotação" onClick={closeDialog} type="button" variant="ghost" />
            </div>

            <div className="grid gap-4">
              <label className="grid gap-1.5 text-xs font-medium text-secondary" htmlFor="agenda-note-date">
                Data
                <input
                  className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-primary outline-none focus-visible:outline-2 focus-visible:outline-accent"
                  id="agenda-note-date"
                  onChange={(event) => updateDraft('date', event.target.value)}
                  required
                  type="date"
                  value={draft.date}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-secondary" htmlFor="agenda-note-title">
                Título
                <input
                  autoFocus
                  className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-primary outline-none placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-accent"
                  id="agenda-note-title"
                  maxLength={120}
                  onChange={(event) => updateDraft('title', event.target.value)}
                  placeholder="Ex.: Entregar o projeto"
                  required
                  value={draft.title}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-secondary" htmlFor="agenda-note-body">
                Anotação
                <textarea
                  className="min-h-[140px] resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-6 text-primary outline-none placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-accent"
                  id="agenda-note-body"
                  onChange={(event) => updateDraft('body', event.target.value)}
                  placeholder="Escreva os detalhes desta anotação..."
                  required
                  value={draft.body}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              {draft.id ? (
                <Button label="Excluir anotação" onClick={deleteNote} type="button" variant="destructive" />
              ) : <span />}
              <div className="ml-auto flex gap-2">
                <Button label="Cancelar" onClick={closeDialog} type="button" variant="ghost" />
                <Button isDisabled={!draft.title.trim() || !draft.body.trim() || !draft.date} label="Salvar anotação" type="submit" variant="primary" />
              </div>
            </div>
          </form>
        )}
      </dialog>
    </div>
  )
}
