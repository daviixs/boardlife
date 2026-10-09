import { useEffect, useState } from 'react'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { ToggleButton } from '@astryxdesign/core/ToggleButton'

const durations = [25, 50, 90]

const demoTasks = [
  { id: 'weekly-plan', title: 'Revisar o planejamento da semana', detail: 'Organização', estimate: '20 min' },
  { id: 'project-report', title: 'Finalizar relatório do projeto', detail: 'Trabalho', estimate: '45 min' },
  { id: 'research-reading', title: 'Ler capítulo de pesquisa', detail: 'Estudos', estimate: '30 min' },
  { id: 'inbox-zero', title: 'Responder mensagens importantes', detail: 'Pessoal', estimate: '15 min' },
]

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

function TimerPanel({ duration, onDurationChange, remaining, running, onStartPause, onReset }) {
  const completed = remaining === 0
  const statusLabel = completed ? 'Concluído' : running ? 'Em andamento' : 'Pronto para começar'

  return (
    <Card className="flex min-h-[330px] min-w-0 flex-col items-center p-6 max-[560px]:min-h-[290px] max-[560px]:px-4">
      <div className="flex w-full items-start justify-between gap-3">
        <div>
          <span className="block text-[10px] font-semibold leading-5 tracking-[1.15px] text-secondary">SEU PERÍODO</span>
          <h2 className="m-0 text-base font-semibold tracking-tight text-primary">Tempo de foco</h2>
        </div>
        <div className="inline-flex items-center gap-2 pt-1 text-xs text-secondary">
          <StatusDot
            isPulsing={running}
            label={statusLabel}
            variant={running ? 'success' : completed ? 'success' : 'neutral'}
          />
          <span>{statusLabel}</span>
        </div>
      </div>

      <div aria-label={`Tempo restante: ${formatTime(remaining)}`} className="my-auto mb-5 font-mono text-[clamp(54px,7vw,76px)] font-medium leading-none tracking-[-4px] tabular-nums text-primary" role="timer">
        {formatTime(remaining)}
      </div>

      <div aria-label="Duração da sessão" className="flex gap-1 rounded-lg border border-border bg-muted p-1" role="group">
        {durations.map((minutes) => (
          <ToggleButton
            className="min-w-[72px] max-[560px]:min-w-[64px]"
            isDisabled={running}
            isPressed={duration === minutes}
            key={minutes}
            label={`${minutes} min`}
            onPressedChange={() => onDurationChange(minutes)}
            size="sm"
            type="button"
          />
        ))}
      </div>

      <div className="mt-[18px] flex w-full items-center justify-center gap-2.5">
        <Button
          className="min-h-10"
          icon={<span aria-hidden="true">{running ? 'Ⅱ' : '▶'}</span>}
          label={running ? 'Pausar foco' : completed ? 'Começar de novo' : 'Iniciar foco'}
          onClick={onStartPause}
          type="button"
          variant="primary"
        />
        <Button label="Reiniciar" onClick={onReset} type="button" variant="ghost" />
      </div>
    </Card>
  )
}

function SessionPanel({ tasks, onRemove, onDropTask }) {
  function handleDrop(event) {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    if (taskId) onDropTask(taskId)
  }

  return (
    <Card
      aria-label="Tarefas desta sessão"
      className="flex min-h-[330px] min-w-0 flex-col p-5 max-[560px]:min-h-[280px] max-[560px]:p-4"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div>
          <span className="block text-[10px] font-semibold leading-5 tracking-[1.15px] text-secondary">NESTE PERÍODO</span>
          <h2 className="m-0 text-base font-semibold tracking-tight text-primary">Minha sessão</h2>
        </div>
        <Badge label={tasks.length} variant="neutral" />
      </div>

      {tasks.length === 0 ? (
        <div className="mt-[18px] flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border px-5 py-6 text-center text-secondary">
          <span aria-hidden="true" className="mb-2.5 grid size-8 place-items-center rounded-lg bg-muted text-lg">↓</span>
          <strong className="mb-1 text-[13px] font-semibold text-primary">Monte sua sessão</strong>
          <span className="max-w-[220px] text-xs leading-5">Arraste uma tarefa para cá ou adicione pela lista abaixo.</span>
        </div>
      ) : (
        <ol className="mt-[18px] flex flex-1 flex-col gap-1 p-0">
          {tasks.map((task, index) => (
            <li className="flex min-w-0 items-center gap-2.5 border-b border-border py-2.5" key={task.id}>
              <span aria-hidden="true" className="text-[10px] tabular-nums text-secondary">{String(index + 1).padStart(2, '0')}</span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <strong className="truncate text-xs font-medium text-primary">{task.title}</strong>
                <small className="text-[10px] text-secondary">{task.detail}</small>
              </span>
              <Button
                aria-label={`Remover ${task.title} da sessão`}
                className="min-w-7"
                icon={<span aria-hidden="true">×</span>}
                isIconOnly
                label={`Remover ${task.title} da sessão`}
                onClick={() => onRemove(task.id)}
                size="sm"
                type="button"
                variant="ghost"
              />
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

function AvailableTasksPanel({ tasks, sessionTaskIds, onAdd, onDragStart }) {
  return (
    <section aria-labelledby="available-tasks-heading" className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <span className="block text-[10px] font-semibold leading-5 tracking-[1.15px] text-secondary">ESCOLHA O QUE VAI FAZER</span>
          <h2 className="m-0 text-[17px] font-semibold tracking-tight text-primary" id="available-tasks-heading">Tarefas disponíveis</h2>
        </div>
        <Badge label="Exemplos" variant="neutral" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 max-[560px]:grid-cols-1">
        {tasks.map((task) => {
          const isAdded = sessionTaskIds.has(task.id)

          return (
            <Card
              className={`flex min-h-[136px] min-w-0 cursor-grab flex-col items-start p-4 transition-colors active:cursor-grabbing ${isAdded ? 'bg-muted opacity-70' : 'hover:border-border-strong'}`}
              draggable={!isAdded}
              key={task.id}
              onDragStart={(event) => onDragStart(event, task.id)}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <Badge label={task.detail} variant="neutral" />
                <span className="text-[10px] text-secondary">{task.estimate}</span>
              </div>
              <h3 className="mb-2 mt-2.5 text-[13px] font-semibold leading-5 text-primary">{task.title}</h3>
              <Button
                className="mt-auto"
                isDisabled={isAdded}
                label={isAdded ? 'Na sessão' : '+ Adicionar'}
                onClick={() => onAdd(task.id)}
                size="sm"
                type="button"
                variant="ghost"
              />
            </Card>
          )
        })}
      </div>
    </section>
  )
}

export default function FocusPage() {
  const [duration, setDuration] = useState(25)
  const [remaining, setRemaining] = useState(duration * 60)
  const [running, setRunning] = useState(false)
  const [sessionTasks, setSessionTasks] = useState([])

  useEffect(() => {
    if (!running || remaining <= 0) return undefined

    const timeout = window.setTimeout(() => {
      setRemaining((seconds) => Math.max(0, seconds - 1))
      if (remaining <= 1) setRunning(false)
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [remaining, running])

  function selectDuration(minutes) {
    setDuration(minutes)
    setRemaining(minutes * 60)
  }

  function addTask(taskId) {
    const task = demoTasks.find((item) => item.id === taskId)
    if (!task) return

    setSessionTasks((current) => (
      current.some((item) => item.id === taskId) ? current : [...current, task]
    ))
  }

  function handleDragStart(event, taskId) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('text/plain', taskId)
  }

  function resetTimer() {
    setRunning(false)
    setRemaining(duration * 60)
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-12 pb-16 pt-10 max-[1024px]:px-7 max-[560px]:px-[18px] max-[560px]:pb-9 max-[560px]:pt-[26px]">
      <header className="mb-7 max-[560px]:mb-5">
        <span className="block text-[10px] font-semibold leading-5 tracking-[1.15px] text-secondary">LIFEBOARD · MÓDULOS</span>
        <h1 className="mb-1 mt-1.5 text-[30px] font-semibold leading-9 tracking-[-1.1px] text-primary">Foco</h1>
        <p className="text-sm leading-5 text-secondary">Escolha um período e organize o que merece sua atenção.</p>
      </header>

      <div className="grid grid-cols-[minmax(320px,1.1fr)_minmax(290px,0.9fr)] items-stretch gap-[18px] max-[1024px]:grid-cols-1">
        <TimerPanel
          duration={duration}
          onDurationChange={selectDuration}
          onReset={resetTimer}
          onStartPause={() => {
            if (remaining === 0) setRemaining(duration * 60)
            setRunning((value) => !value)
          }}
          remaining={remaining}
          running={running}
        />
        <SessionPanel
          onDropTask={addTask}
          onRemove={(taskId) => setSessionTasks((current) => current.filter((task) => task.id !== taskId))}
          tasks={sessionTasks}
        />
      </div>

      <AvailableTasksPanel
        onAdd={addTask}
        onDragStart={handleDragStart}
        sessionTaskIds={new Set(sessionTasks.map((task) => task.id))}
        tasks={demoTasks}
      />
    </div>
  )
}
