import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, X, Check } from 'lucide-react'
import KanbanCard from './KanbanCard'
import type { Card, CardStatus } from '../../types'

interface Props {
  status: CardStatus
  label: string
  cards: Card[]
  groupId: number
  onCardClick: (card: Card) => void
  onAddCard: (title: string, status: CardStatus, groupId: number) => Promise<void>
}

const STATUS_COLORS: Record<CardStatus, { dot: string; count: string }> = {
  TODO: { dot: 'var(--status-todo)', count: 'var(--status-todo-bg)' },
  IN_PROGRESS: { dot: 'var(--status-progress)', count: 'var(--status-progress-bg)' },
  DONE: { dot: 'var(--status-done)', count: 'var(--status-done-bg)' },
}

export default function KanbanColumn({
  status,
  label,
  cards,
  groupId,
  onCardClick,
  onAddCard,
}: Props) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: `col-${status}-${groupId}`,
    data: { status, groupId },
  })

  const handleAdd = async () => {
    if (!newTitle.trim() || saving) return
    setSaving(true)
    try {
      await onAddCard(newTitle.trim(), status, groupId)
      setNewTitle('')
      setAdding(false)
    } finally {
      setSaving(false)
    }
  }

  const colors = STATUS_COLORS[status]

  return (
    <div
      className="flex flex-col w-72 flex-shrink-0 rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-column)',
        border: isOver ? '2px solid var(--primary)' : '2px solid transparent',
        transition: 'border-color 0.15s ease',
        minHeight: 400,
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: 'var(--bg-column-header)' }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: colors.dot }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </span>
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-full min-w-5 text-center"
            style={{
              backgroundColor: colors.count,
              color: colors.dot,
            }}
          >
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => setAdding(true)}
          className="p-1 rounded-md transition-colors"
          title="Adicionar card"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-column)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-tertiary)'
          }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Cards drop area */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto"
        style={{ minHeight: 100 }}
      >
        <SortableContext
          items={cards.map((c) => `card-${c.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && !adding && (
          <div
            className="flex-1 flex items-center justify-center py-8 rounded-xl border-2 border-dashed"
            style={{ borderColor: 'var(--border-subtle)', minHeight: 80 }}
          >
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Arraste cards aqui
            </p>
          </div>
        )}

        {/* Quick-add form */}
        {adding && (
          <div
            className="rounded-xl p-3 animate-slide-up"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--primary)',
              boxShadow: '0 0 0 3px var(--primary-subtle)',
            }}
          >
            <textarea
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título da tarefa..."
              rows={2}
              autoFocus
              className="w-full text-sm outline-none resize-none bg-transparent"
              style={{ color: 'var(--text-primary)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAdd()
                }
                if (e.key === 'Escape') {
                  setAdding(false)
                  setNewTitle('')
                }
              }}
            />
            <div className="flex items-center gap-1.5 mt-2">
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim() || saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  opacity: !newTitle.trim() || saving ? 0.6 : 1,
                }}
              >
                <Check size={12} />
                {saving ? 'Salvando...' : 'Adicionar'}
              </button>
              <button
                onClick={() => { setAdding(false); setNewTitle('') }}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  color: 'var(--text-tertiary)',
                  backgroundColor: 'var(--bg-column)',
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add card bottom link */}
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--primary-text)'
            e.currentTarget.style.backgroundColor = 'var(--primary-subtle)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-tertiary)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Plus size={13} />
          Adicionar tarefa
        </button>
      )}
    </div>
  )
}
