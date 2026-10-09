import { useEffect, useState } from 'react'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { readAgendaNotes } from '../agenda/agendaStorage'

const storageKeys = {
  thoughts: 'lifeboard.thoughts.v1',
  notes: 'lifeboard.notes.v1',
  tasks: 'lifeboard.kanban.organizations.v1',
  goals: 'lifeboard.goals.v1',
  records: 'lifeboard.records.v1',
}

const quickLinks = [
  { label: 'Foco', description: 'Organize seu próximo período de foco.', icon: '◷' },
  { label: 'Atividade', description: 'Veja sua atividade recente.', icon: '⌁' },
  { label: 'Agenda', description: 'Confira seus compromissos.', icon: '▦' },
]

function readArray(key) {
  try {
    const value = window.localStorage.getItem(key)
    const parsed = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readSummary() {
  const agendaNotes = readAgendaNotes()
  const thoughts = readArray(storageKeys.thoughts)
  const notes = readArray(storageKeys.notes)
  const organizations = readArray(storageKeys.tasks)
  const goals = readArray(storageKeys.goals)
  const records = readArray(storageKeys.records)

  const cards = organizations.flatMap((organization) => (
    (organization.columns ?? []).flatMap((column) => column.cards ?? [])
  ))
  const registeredDays = records.reduce((total, metric) => total + new Set(metric.days ?? []).size, 0)
  const today = new Date()
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const nextAgendaNote = agendaNotes
    .filter((note) => note.date >= todayString)
    .sort((first, second) => first.date.localeCompare(second.date))[0] ?? null

  return {
    thoughtCount: thoughts.length,
    latestThought: [...thoughts].sort((a, b) => b.createdAt - a.createdAt)[0]?.content ?? '',
    noteCount: notes.length,
    latestNote: [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.title || '',
    organizationCount: organizations.length,
    taskCount: cards.length,
    goalCount: goals.length,
    goalsByTerm: {
      short: goals.filter((goal) => goal.timeframe === 'short').length,
      medium: goals.filter((goal) => goal.timeframe === 'medium').length,
      long: goals.filter((goal) => goal.timeframe === 'long').length,
    },
    metricCount: records.length,
    registeredDays,
    records: records.slice(0, 3).map((metric) => ({
      id: metric.id,
      name: metric.name,
      days: new Set(metric.days ?? []).size,
    })),
    agendaCount: agendaNotes.length,
    nextAgendaNote,
  }
}

function formatAgendaDate(date) {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })
    .format(new Date(`${date}T12:00:00`))
}

function SummaryCard({ title, count, unit, detail, children, onOpen, action }) {
  return (
    <Card className="flex min-h-[210px] min-w-0 flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-sm font-semibold text-primary">{title}</h2>
          <p className="mb-0 mt-1 text-xs text-secondary">{detail}</p>
        </div>
        <Badge label={`${count} ${unit}`} variant="neutral" />
      </div>
      <div className="my-auto py-4">{children}</div>
      <Button className="mt-1 justify-start" label={action} onClick={onOpen} type="button" variant="ghost" />
    </Card>
  )
}

export default function HomePage({ onNavigate, refreshKey }) {
  const [summary, setSummary] = useState(readSummary)

  useEffect(() => {
    setSummary(readSummary())
  }, [refreshKey])

  return (
    <div className="mx-auto w-full max-w-[1180px] px-10 pb-14 pt-9 max-[1024px]:px-7 max-[560px]:px-[18px] max-[560px]:pb-9 max-[560px]:pt-[26px]">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 max-[560px]:mb-5">
        <div>
          <span className="block text-[10px] font-semibold leading-5 tracking-[1.15px] text-secondary">LIFEBOARD · VISÃO GERAL</span>
          <h1 className="mb-1 mt-1.5 text-[30px] font-semibold leading-9 tracking-[-1.1px] text-primary">Início</h1>
          <p className="text-sm leading-5 text-secondary">Um resumo do que está acontecendo nos seus módulos.</p>
        </div>
        <Badge label={new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())} variant="neutral" />
      </header>

      <section aria-label="Resumo dos módulos" className="grid grid-cols-3 gap-4 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1">
        <SummaryCard
          action="Abrir pensamentos"
          count={summary.thoughtCount}
          detail="Ideias rápidas guardadas"
          onOpen={() => onNavigate('Pensamentos')}
          title="Pensamentos"
          unit={summary.thoughtCount === 1 ? 'pensamento' : 'pensamentos'}
        >
          <p className="m-0 line-clamp-3 text-[13px] leading-5 text-secondary">
            {summary.latestThought || 'Escreva uma ideia rápida para ela aparecer aqui.'}
          </p>
        </SummaryCard>

        <SummaryCard
          action="Abrir anotações"
          count={summary.noteCount}
          detail="Notas salvas neste navegador"
          onOpen={() => onNavigate('Anotações')}
          title="Anotações"
          unit={summary.noteCount === 1 ? 'nota' : 'notas'}
        >
          <p className="m-0 line-clamp-2 text-base font-medium text-primary">
            {summary.latestNote || 'Suas notas mais recentes aparecem aqui.'}
          </p>
        </SummaryCard>

        <SummaryCard
          action="Abrir agenda"
          count={summary.agendaCount}
          detail={summary.nextAgendaNote ? `Próxima · ${formatAgendaDate(summary.nextAgendaNote.date)}` : 'Anotações salvas neste navegador'}
          onOpen={() => onNavigate('Agenda')}
          title="Agenda"
          unit={summary.agendaCount === 1 ? 'anotação' : 'anotações'}
        >
          <p className="m-0 line-clamp-3 text-[13px] leading-5 text-secondary">
            {summary.nextAgendaNote?.title || 'Clique em um dia para criar sua primeira anotação.'}
          </p>
        </SummaryCard>

        <SummaryCard
          action="Abrir tarefas"
          count={summary.taskCount}
          detail={`${summary.organizationCount} ${summary.organizationCount === 1 ? 'organização' : 'organizações'}`}
          onOpen={() => onNavigate('Tarefas')}
          title="Tarefas"
          unit={summary.taskCount === 1 ? 'cartão' : 'cartões'}
        >
          <p className="m-0 text-sm text-secondary">Cartões nos seus quadros Kanban.</p>
        </SummaryCard>

        <SummaryCard
          action="Abrir metas"
          count={summary.goalCount}
          detail="Objetivos em andamento"
          onOpen={() => onNavigate('Metas')}
          title="Metas"
          unit={summary.goalCount === 1 ? 'meta' : 'metas'}
        >
          <div className="flex flex-wrap gap-2">
            <Badge label={`Curto ${summary.goalsByTerm.short}`} variant="neutral" />
            <Badge label={`Médio ${summary.goalsByTerm.medium}`} variant="neutral" />
            <Badge label={`Longo ${summary.goalsByTerm.long}`} variant="neutral" />
          </div>
        </SummaryCard>

        <SummaryCard
          action="Abrir Records"
          count={summary.metricCount}
          detail="Dias registrados nas atividades"
          onOpen={() => onNavigate('Records')}
          title="Records"
          unit={summary.metricCount === 1 ? 'métrica' : 'métricas'}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold leading-none tracking-tight text-primary tabular-nums">{summary.registeredDays}</span>
            <span className="text-xs text-secondary">dias no total</span>
          </div>
          <ul className="mb-0 mt-3 flex flex-wrap gap-x-3 gap-y-1 p-0 text-[11px] text-secondary">
            {summary.records.map((metric) => (
              <li className="list-none" key={metric.id}>{metric.name}: {metric.days}</li>
            ))}
          </ul>
        </SummaryCard>

        <SummaryCard
          action="Abrir foco"
          count="25 · 50 · 90"
          detail="Sessões com temporizador"
          onOpen={() => onNavigate('Foco')}
          title="Foco"
          unit="min"
        >
          <p className="m-0 text-sm text-secondary">Escolha um período e organize suas tarefas.</p>
        </SummaryCard>
      </section>

      <section aria-labelledby="quick-links-heading" className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="m-0 text-base font-semibold text-primary" id="quick-links-heading">Acesso rápido</h2>
            <p className="mb-0 mt-1 text-xs text-secondary">Abra outras áreas do LifeBoard.</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          {quickLinks.map((link) => (
            <button
              className="flex min-h-[86px] items-start gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-accent"
              key={link.label}
              onClick={() => onNavigate(link.label)}
              type="button"
            >
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-base text-primary">{link.icon}</span>
              <span className="flex min-w-0 flex-col gap-1">
                <strong className="text-[13px] font-semibold text-primary">{link.label}</strong>
                <span className="text-[11px] leading-4 text-secondary">{link.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
