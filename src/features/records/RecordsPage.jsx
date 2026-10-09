import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'

const STORAGE_KEY = 'lifeboard.records.v1'

const starterMetrics = [
  { id: 'study', name: 'Estudando', days: [] },
  { id: 'programming', name: 'Programando', days: [] },
  { id: 'job-search', name: 'Procurando empregos', days: [] },
]

function readMetrics() {
  try {
    const storedMetrics = window.localStorage.getItem(STORAGE_KEY)
    if (storedMetrics) {
      const parsedMetrics = JSON.parse(storedMetrics)
      return Array.isArray(parsedMetrics) ? parsedMetrics : starterMetrics
    }
  } catch {
    // Fall back to the starter metrics when storage is unavailable or invalid.
  }

  return starterMetrics
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `metric-${Date.now()}`
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' })
    .format(new Date(year, month - 1, day))
}

export default function RecordsPage() {
  const [metrics, setMetrics] = useState(readMetrics)
  const [metricName, setMetricName] = useState('')
  const today = getLocalDateKey()

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics))
    } catch {
      // Keep metric tracking available when browser storage is disabled or full.
    }
  }, [metrics])

  const totalDays = useMemo(
    () => metrics.reduce((total, metric) => total + new Set(metric.days).size, 0),
    [metrics],
  )

  function addMetric(event) {
    event.preventDefault()
    const name = metricName.trim()
    if (!name) return

    setMetrics((currentMetrics) => [...currentMetrics, { id: createId(), name, days: [] }])
    setMetricName('')
  }

  function toggleToday(metricId) {
    setMetrics((currentMetrics) => currentMetrics.map((metric) => {
      if (metric.id !== metricId) return metric

      const days = new Set(metric.days)
      if (days.has(today)) days.delete(today)
      else days.add(today)

      return { ...metric, days: [...days].sort() }
    }))
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-12 pb-16 pt-10 max-[1024px]:px-7 max-[560px]:px-[18px] max-[560px]:pb-9 max-[560px]:pt-[26px]">
      <header className="mb-7 max-[560px]:mb-5">
        <span className="block text-[10px] font-semibold leading-5 tracking-[1.15px] text-secondary">LIFEBOARD · MÓDULOS</span>
        <h1 className="mb-1 mt-1.5 text-[30px] font-semibold leading-9 tracking-[-1.1px] text-primary">Records</h1>
        <p className="text-sm leading-5 text-secondary">Acompanhe quantos dias você dedicou a cada atividade.</p>
      </header>

      <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 p-5 max-[560px]:p-4">
        <div>
          <span className="text-xs text-secondary">Dias registrados em todas as métricas</span>
          <p className="mb-0 mt-1 text-2xl font-semibold tracking-tight text-primary tabular-nums">{totalDays}</p>
        </div>
        <Badge label={`Hoje · ${formatDate(today)}`} variant="neutral" />
      </Card>

      <section aria-label="Métricas de atividade" className="grid grid-cols-3 items-stretch gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        {metrics.map((metric) => {
          const recordedToday = metric.days.includes(today)
          const dayCount = new Set(metric.days).size

          return (
            <Card className="flex min-h-[205px] flex-col p-5" key={metric.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-sm font-semibold text-primary">{metric.name}</h2>
                  <p className="mb-0 mt-1 text-xs text-secondary">Dias com atividade</p>
                </div>
                <Badge label={recordedToday ? 'Hoje registrado' : 'Hoje pendente'} variant={recordedToday ? 'success' : 'neutral'} />
              </div>

              <div className="my-auto py-5">
                <span className="text-[42px] font-semibold leading-none tracking-[-1.5px] text-primary tabular-nums">{dayCount}</span>
                <span className="ml-2 text-sm text-secondary">{dayCount === 1 ? 'dia' : 'dias'}</span>
              </div>

              <Button
                className="w-full"
                label={recordedToday ? 'Desfazer registro de hoje' : 'Registrar hoje'}
                onClick={() => toggleToday(metric.id)}
                type="button"
                variant={recordedToday ? 'secondary' : 'primary'}
              />
            </Card>
          )
        })}
      </section>

      <Card className="mt-6 p-5 max-[560px]:p-4">
        <form className="flex items-end gap-3 max-[560px]:flex-col max-[560px]:items-stretch" onSubmit={addMetric}>
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-medium text-secondary">
            Nova métrica
            <input
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-primary outline-none placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-accent"
              onChange={(event) => setMetricName(event.target.value)}
              placeholder="Ex.: Praticando inglês"
              value={metricName}
            />
          </label>
          <Button className="min-h-10 max-[560px]:w-full" isDisabled={!metricName.trim()} label="Adicionar métrica" type="submit" variant="primary" />
        </form>
      </Card>
    </div>
  )
}
