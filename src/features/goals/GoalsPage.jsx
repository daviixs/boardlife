import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'

const STORAGE_KEY = 'lifeboard.goals.v1'

const timeframes = [
  { id: 'short', label: 'Curto prazo', description: 'Próximas semanas' },
  { id: 'medium', label: 'Médio prazo', description: 'Próximos meses' },
  { id: 'long', label: 'Longo prazo', description: 'Visão de futuro' },
]

function readGoals() {
  try {
    const storedGoals = window.localStorage.getItem(STORAGE_KEY)
    const parsedGoals = storedGoals ? JSON.parse(storedGoals) : []
    return Array.isArray(parsedGoals) ? parsedGoals : []
  } catch {
    return []
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `goal-${Date.now()}`
}

export default function GoalsPage() {
  const [goals, setGoals] = useState(readGoals)
  const [title, setTitle] = useState('')
  const [timeframe, setTimeframe] = useState('short')

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    } catch {
      // Keep goal editing available when browser storage is disabled or full.
    }
  }, [goals])

  const groupedGoals = useMemo(
    () => Object.fromEntries(timeframes.map((period) => [
      period.id,
      goals.filter((goal) => goal.timeframe === period.id),
    ])),
    [goals],
  )

  function addGoal(event) {
    event.preventDefault()
    const normalizedTitle = title.trim()
    if (!normalizedTitle) return

    setGoals((currentGoals) => [
      { id: createId(), title: normalizedTitle, timeframe, createdAt: Date.now() },
      ...currentGoals,
    ])
    setTitle('')
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-12 pb-16 pt-10 max-[1024px]:px-7 max-[560px]:px-[18px] max-[560px]:pb-9 max-[560px]:pt-[26px]">
      <header className="mb-7 max-[560px]:mb-5">
        <span className="block text-[10px] font-semibold leading-5 tracking-[1.15px] text-secondary">LIFEBOARD · MÓDULOS</span>
        <h1 className="mb-1 mt-1.5 text-[30px] font-semibold leading-9 tracking-[-1.1px] text-primary">Metas</h1>
        <p className="text-sm leading-5 text-secondary">Organize o que você quer alcançar em cada horizonte.</p>
      </header>

      <Card className="mb-6 p-5 max-[560px]:p-4">
        <form className="flex items-end gap-3 max-[560px]:flex-col max-[560px]:items-stretch" onSubmit={addGoal}>
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-medium text-secondary">
            Nova meta
            <input
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-primary outline-none placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-accent"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="O que você quer alcançar?"
              value={title}
            />
          </label>
          <label className="flex w-[190px] shrink-0 flex-col gap-1.5 text-xs font-medium text-secondary max-[560px]:w-full">
            Prazo
            <select
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-primary outline-none focus-visible:outline-2 focus-visible:outline-accent"
              onChange={(event) => setTimeframe(event.target.value)}
              value={timeframe}
            >
              {timeframes.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}
            </select>
          </label>
          <Button className="min-h-10 max-[560px]:w-full" isDisabled={!title.trim()} label="Adicionar meta" type="submit" variant="primary" />
        </form>
      </Card>

      <section aria-label="Metas por prazo" className="grid grid-cols-3 items-start gap-4 max-[900px]:grid-cols-1">
        {timeframes.map((period) => {
          const periodGoals = groupedGoals[period.id]

          return (
            <Card className="flex min-h-[260px] min-w-0 flex-col p-4" key={period.id}>
              <div className="mb-3 flex items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h2 className="m-0 text-sm font-semibold text-primary">{period.label}</h2>
                  <p className="mb-0 mt-1 text-[11px] text-secondary">{period.description}</p>
                </div>
                <Badge label={periodGoals.length} variant="neutral" />
              </div>

              {periodGoals.length === 0 ? (
                <div className="grid flex-1 place-items-center px-3 py-8 text-center text-xs leading-5 text-secondary">
                  Nenhuma meta neste prazo ainda.
                </div>
              ) : (
                <ul className="m-0 flex flex-col gap-2 p-0">
                  {periodGoals.map((goal) => (
                    <li className="list-none rounded-lg border border-border bg-surface px-3.5 py-3 text-[13px] leading-5 text-primary" key={goal.id}>
                      {goal.title}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )
        })}
      </section>
    </div>
  )
}
