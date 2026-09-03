import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, GripVertical } from 'lucide-react'
import type { Card } from '../../types'

interface Props {
  card: Card
  onClick: () => void
}

export default function KanbanCard({ card, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `card-${card.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  }

  const isOverdue =
    card.dueDate && card.status !== 'DONE'
      ? new Date(card.dueDate + 'T00:00:00') < new Date()
      : false

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-xl cursor-pointer transition-all select-none"
      onClick={onClick}
      {...attributes}
    >
      <div
        className="rounded-xl p-3.5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
          transition: 'box-shadow 0.15s ease, transform 0.15s ease',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.boxShadow = 'var(--shadow-card-hover)'
          el.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.boxShadow = 'var(--shadow-card)'
          el.style.transform = 'translateY(0)'
        }}
      >
        {/* Drag handle */}
        <div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 rounded"
          style={{ color: 'var(--text-tertiary)' }}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>

        {/* Title */}
        <p
          className="text-sm font-medium leading-snug pr-5"
          style={{ color: 'var(--text-primary)' }}
        >
          {card.title}
        </p>

        {/* Content preview */}
        {card.content && (
          <p
            className="text-xs mt-1.5 line-clamp-2 leading-relaxed"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {card.content.replace(/[#*`_>\-[\]()!]/g, '').trim()}
          </p>
        )}

        {/* Footer */}
        {card.dueDate && (
          <div className="flex items-center gap-1 mt-2.5">
            <Calendar
              size={11}
              style={{ color: isOverdue ? '#ef4444' : 'var(--text-tertiary)' }}
            />
            <span
              className="text-xs"
              style={{ color: isOverdue ? '#ef4444' : 'var(--text-tertiary)' }}
            >
              {new Date(card.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
