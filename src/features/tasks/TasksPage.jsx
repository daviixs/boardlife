import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'

const STORAGE_KEY = 'lifeboard.kanban.organizations.v1'

function createId(prefix) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createOrganization(name, id = createId('organization')) {
  return {
    id,
    name,
    columns: [
      { id: createId('column'), title: 'A fazer', cards: [] },
      { id: createId('column'), title: 'Em andamento', cards: [] },
      { id: createId('column'), title: 'Concluído', cards: [] },
    ],
  }
}

function readOrganizations() {
  try {
    const storedOrganizations = window.localStorage.getItem(STORAGE_KEY)
    const parsedOrganizations = storedOrganizations ? JSON.parse(storedOrganizations) : []
    if (Array.isArray(parsedOrganizations) && parsedOrganizations.length > 0) return parsedOrganizations
  } catch {
    // Start with a fresh board when storage is unavailable or invalid.
  }

  return [createOrganization('Pessoal', 'personal')]
}

function KanbanColumn({ column, organizationId, columns, onAddCard, onDeleteCard, onMoveCard }) {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [cardTitle, setCardTitle] = useState('')

  function submitCard(event) {
    event.preventDefault()
    const title = cardTitle.trim()
    if (!title) return
    onAddCard(column.id, title)
    setCardTitle('')
    setIsAddingCard(false)
  }

  function handleDrop(event) {
    event.preventDefault()
    const cardData = event.dataTransfer.getData('application/x-lifeboard-card')
    if (!cardData) return

    try {
      const { organizationId: sourceOrganizationId, columnId, cardId } = JSON.parse(cardData)
      onMoveCard(sourceOrganizationId, columnId, column.id, cardId)
    } catch {
      // Ignore malformed drag data.
    }
  }

  return (
    <Card
      aria-label={`Lista ${column.title}`}
      className="flex max-h-[calc(100vh-190px)] w-[290px] shrink-0 flex-col rounded-xl bg-muted p-3 text-primary shadow-sm max-[560px]:w-[82vw] max-[560px]:max-w-[310px]"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <header className="mb-2 flex items-center gap-2 px-1 py-1">
        <h2 className="m-0 min-w-0 flex-1 truncate text-[13px] font-semibold tracking-[0.01em]">{column.title}</h2>
        <Badge className="min-w-6 justify-center text-[10px]" label={column.cards.length} variant="neutral" />
      </header>

      <div className="flex min-h-0 flex-col gap-2 overflow-y-auto px-0.5 pb-1">
        {column.cards.map((card) => (
          <Card
            className="group min-w-0 cursor-grab rounded-lg border border-border bg-surface p-3 text-primary shadow-sm transition-[box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-md active:cursor-grabbing"
            draggable
            key={card.id}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('application/x-lifeboard-card', JSON.stringify({ organizationId, columnId: column.id, cardId: card.id }))
            }}
          >
            <div className="flex items-start gap-2">
              <p className="m-0 min-w-0 flex-1 whitespace-pre-wrap break-words text-[13px] leading-[1.45]">{card.title}</p>
              <Button
                aria-label={`Excluir cartão ${card.title}`}
                className="shrink-0 opacity-70 group-hover:opacity-100"
                icon={<span aria-hidden="true">×</span>}
                isIconOnly
                label={`Excluir cartão ${card.title}`}
                onClick={() => onDeleteCard(column.id, card.id)}
                size="sm"
                type="button"
                variant="ghost"
              />
            </div>
            {columns.length > 1 && (
              <label className="mt-2 block">
                <span className="sr-only">Mover {card.title} para outra lista</span>
                <select
                  aria-label={`Mover ${card.title} para outra lista`}
                  className="h-8 max-w-full rounded-md border border-transparent bg-transparent px-1.5 text-[10px] text-secondary outline-none hover:border-border focus-visible:border-border-strong"
                  onChange={(event) => onMoveCard(organizationId, column.id, event.target.value, card.id)}
                  value={column.id}
                >
                  {columns.map((destination) => <option key={destination.id} value={destination.id}>{destination.title}</option>)}
                </select>
              </label>
            )}
          </Card>
        ))}
      </div>

      {isAddingCard ? (
        <form className="mt-2" onSubmit={submitCard}>
          <textarea
            autoFocus
            aria-label={`Título do cartão em ${column.title}`}
            className="min-h-[74px] w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-[13px] leading-5 text-primary outline-none placeholder:text-secondary focus-visible:border-border-strong"
            onChange={(event) => setCardTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setIsAddingCard(false)
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submitCard(event)
              }
            }}
            placeholder="Escreva o título do cartão..."
            value={cardTitle}
          />
          <div className="mt-2 flex items-center gap-2">
            <Button isDisabled={!cardTitle.trim()} label="Adicionar cartão" size="sm" type="submit" variant="primary" />
            <Button label="Cancelar" onClick={() => setIsAddingCard(false)} size="sm" type="button" variant="ghost" />
          </div>
        </form>
      ) : (
        <Button
          className="mt-1 min-h-9 justify-start text-secondary hover:bg-white/60"
          icon={<span aria-hidden="true" className="text-lg leading-none">+</span>}
          label="Adicionar um cartão"
          onClick={() => setIsAddingCard(true)}
          type="button"
          variant="ghost"
        />
      )}
    </Card>
  )
}

export default function TasksPage() {
  const [organizations, setOrganizations] = useState(readOrganizations)
  const [activeOrganizationId, setActiveOrganizationId] = useState(() => readOrganizations()[0]?.id ?? 'personal')
  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false)
  const [organizationDraft, setOrganizationDraft] = useState('')
  const [isCreatingColumn, setIsCreatingColumn] = useState(false)
  const [columnDraft, setColumnDraft] = useState('')

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(organizations))
    } catch {
      // Keep the board usable when browser storage is disabled or full.
    }
  }, [organizations])

  const activeOrganization = organizations.find((organization) => organization.id === activeOrganizationId) ?? organizations[0]
  const totalCards = useMemo(
    () => activeOrganization?.columns.reduce((total, column) => total + column.cards.length, 0) ?? 0,
    [activeOrganization],
  )

  function updateOrganization(organizationId, update) {
    setOrganizations((currentOrganizations) => currentOrganizations.map((organization) => (
      organization.id === organizationId ? update(organization) : organization
    )))
  }

  function createOrganization(event) {
    event.preventDefault()
    const name = organizationDraft.trim()
    if (!name) return

    const organization = createOrganizationData(name)
    setOrganizations((currentOrganizations) => [...currentOrganizations, organization])
    setActiveOrganizationId(organization.id)
    setOrganizationDraft('')
    setIsCreatingOrganization(false)
  }

  function addCard(columnId, title) {
    updateOrganization(activeOrganization.id, (organization) => ({
      ...organization,
      columns: organization.columns.map((column) => (
        column.id === columnId
          ? { ...column, cards: [...column.cards, { id: createId('card'), title }] }
          : column
      )),
    }))
  }

  function moveCard(sourceOrganizationId, sourceColumnId, destinationColumnId, cardId) {
    if (sourceOrganizationId !== activeOrganization.id || sourceColumnId === destinationColumnId) return

    updateOrganization(sourceOrganizationId, (organization) => {
      const sourceColumn = organization.columns.find((column) => column.id === sourceColumnId)
      const card = sourceColumn?.cards.find((item) => item.id === cardId)
      if (!card) return organization

      return {
        ...organization,
        columns: organization.columns.map((column) => {
          if (column.id === sourceColumnId) {
            return { ...column, cards: column.cards.filter((item) => item.id !== cardId) }
          }
          if (column.id === destinationColumnId) {
            return { ...column, cards: [...column.cards, card] }
          }
          return column
        }),
      }
    })
  }

  function deleteCard(columnId, cardId) {
    updateOrganization(activeOrganization.id, (organization) => ({
      ...organization,
      columns: organization.columns.map((column) => (
        column.id === columnId
          ? { ...column, cards: column.cards.filter((card) => card.id !== cardId) }
          : column
      )),
    }))
  }

  function addColumn(event) {
    event.preventDefault()
    const title = columnDraft.trim()
    if (!title) return

    updateOrganization(activeOrganization.id, (organization) => ({
      ...organization,
      columns: [...organization.columns, { id: createId('column'), title, cards: [] }],
    }))
    setColumnDraft('')
    setIsCreatingColumn(false)
  }

  if (!activeOrganization) return null

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-body text-primary">
      <header className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 border-b border-border bg-accent px-6 py-4 text-on-accent max-[560px]:px-4">
        <div className="mr-auto flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#9cd5ff]/20 text-[15px]">▦</span>
          <div className="min-w-0">
            <p className="m-0 text-[10px] font-medium uppercase tracking-[0.12em] text-on-accent/70">Quadro de tarefas</p>
            <h1 className="m-0 truncate text-lg font-semibold tracking-[-0.025em]">{activeOrganization.name}</h1>
          </div>
        </div>

        <label className="sr-only" htmlFor="organization-switcher">Organização ativa</label>
        <select
          className="h-9 max-w-[220px] rounded-lg border border-white/25 bg-white/10 px-3 text-[13px] text-on-accent outline-none focus-visible:border-[#9cd5ff]"
          id="organization-switcher"
          onChange={(event) => setActiveOrganizationId(event.target.value)}
          value={activeOrganization.id}
        >
          {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
        </select>

        {isCreatingOrganization ? (
          <form className="flex items-center gap-2" onSubmit={createOrganization}>
            <input
              autoFocus
              aria-label="Nome da organização"
              className="h-9 w-[170px] rounded-lg border border-white/25 bg-white/10 px-3 text-[13px] text-on-accent outline-none placeholder:text-on-accent/60 focus-visible:border-[#9cd5ff]"
              onChange={(event) => setOrganizationDraft(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && setIsCreatingOrganization(false)}
              placeholder="Nome da organização"
              value={organizationDraft}
            />
            <Button isDisabled={!organizationDraft.trim()} label="Criar" size="sm" type="submit" variant="primary" />
            <Button label="Cancelar" onClick={() => setIsCreatingOrganization(false)} size="sm" type="button" variant="ghost" />
          </form>
        ) : (
          <Button
            className="border border-white/25 text-on-accent hover:bg-white/10"
            icon={<span aria-hidden="true">+</span>}
            label="Nova organização"
            onClick={() => setIsCreatingOrganization(true)}
            size="sm"
            type="button"
            variant="ghost"
          />
        )}
      </header>

      <div className="flex items-center gap-3 px-6 pt-4 max-[560px]:px-4">
        <p className="m-0 text-xs text-secondary">Organize cartões entre listas ou arraste para mudar o andamento.</p>
        <Badge className="border border-border bg-surface text-secondary" label={`${totalCards} cartões`} variant="neutral" />
      </div>

      <section aria-label={`Quadro de tarefas de ${activeOrganization.name}`} className="flex min-h-0 flex-1 items-start gap-3 overflow-x-auto overflow-y-hidden px-6 pb-6 pt-4 max-[560px]:px-4">
        {activeOrganization.columns.map((column) => (
          <KanbanColumn
            column={column}
            columns={activeOrganization.columns}
            key={column.id}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onMoveCard={moveCard}
            organizationId={activeOrganization.id}
          />
        ))}

        {isCreatingColumn ? (
          <form className="flex w-[290px] shrink-0 flex-col gap-2 rounded-xl border border-border bg-accent-muted p-3" onSubmit={addColumn}>
            <label className="text-xs font-medium text-primary" htmlFor="new-column-title">Nome da lista</label>
            <input
              autoFocus
              className="h-10 rounded-lg border border-border bg-surface px-3 text-[13px] text-primary outline-none placeholder:text-secondary focus-visible:border-border-strong"
              id="new-column-title"
              onChange={(event) => setColumnDraft(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && setIsCreatingColumn(false)}
              placeholder="Ex.: Em revisão"
              value={columnDraft}
            />
            <div className="flex gap-2">
              <Button isDisabled={!columnDraft.trim()} label="Adicionar lista" size="sm" type="submit" variant="primary" />
              <Button label="Cancelar" onClick={() => setIsCreatingColumn(false)} size="sm" type="button" variant="ghost" />
            </div>
          </form>
        ) : (
          <Button
            className="h-12 w-[290px] shrink-0 justify-start border border-border bg-accent-muted px-4 text-primary hover:bg-[#9cd5ff]/40"
            icon={<span aria-hidden="true" className="text-lg leading-none">+</span>}
            label="Adicionar outra lista"
            onClick={() => setIsCreatingColumn(true)}
            type="button"
            variant="ghost"
          />
        )}
      </section>
    </div>
  )
}

function createOrganizationData(name) {
  return createOrganization(name)
}
