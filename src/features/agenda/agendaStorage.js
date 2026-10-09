export const AGENDA_STORAGE_KEY = 'lifeboard.agenda.notes.v1'

export function readAgendaNotes() {
  try {
    const storedNotes = window.localStorage.getItem(AGENDA_STORAGE_KEY)
    const parsedNotes = storedNotes ? JSON.parse(storedNotes) : []
    return Array.isArray(parsedNotes) ? parsedNotes : []
  } catch {
    return []
  }
}

export function createAgendaId() {
  return globalThis.crypto?.randomUUID?.() ?? `agenda-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function toCalendarEvent(note) {
  return {
    id: note.id,
    title: note.title,
    start: note.date,
    allDay: true,
    extendedProps: { body: note.body },
  }
}
