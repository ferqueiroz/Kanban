import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import CardDialog from './CardDialog'
import type { Card, CardStatus, Group } from '../../types'
import { STATUS_LABELS, STATUS_ORDER } from '../../types'

interface Props {
  group: Group
  allGroups: Group[]
  onAddCard: (title: string, status: CardStatus, groupId: number) => Promise<void>
  onUpdateCard: (
    id: number,
    data: { title: string; content?: string; status?: CardStatus; dueDate?: string }
  ) => Promise<void>
  onMoveCard: (id: number, status: CardStatus, groupId?: number) => Promise<void>
  onDeleteCard: (id: number) => Promise<void>
}

export default function KanbanBoard({
  group,
  allGroups,
  onAddCard,
  onUpdateCard,
  onMoveCard,
  onDeleteCard,
}: Props) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [activeCard, setActiveCard] = useState<Card | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const findCard = useCallback(
    (id: number): Card | undefined => {
      for (const status of STATUS_ORDER) {
        const found = group.columns[status].find((c) => c.id === id)
        if (found) return found
      }
    },
    [group]
  )

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = Number(String(event.active.id).replace('card-', ''))
    const card = findCard(cardId)
    if (card) setActiveCard(card)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return

    const cardId = Number(String(active.id).replace('card-', ''))
    const card = findCard(cardId)
    if (!card) return

    // over a column
    if (String(over.id).startsWith('col-')) {
      // col-IN_PROGRESS-1  →  parts[1] may be split weirdly for IN_PROGRESS
      // Format: col-{STATUS}-{groupId}
      const withoutPrefix = String(over.id).slice(4) // remove "col-"
      const lastDash = withoutPrefix.lastIndexOf('-')
      const newStatus = withoutPrefix.slice(0, lastDash) as CardStatus
      const newGroupId = Number(withoutPrefix.slice(lastDash + 1))

      if (newStatus !== card.status || newGroupId !== card.groupId) {
        await onMoveCard(card.id, newStatus, newGroupId !== card.groupId ? newGroupId : undefined)
      }
      return
    }

    // over another card
    if (String(over.id).startsWith('card-')) {
      const targetId = Number(String(over.id).replace('card-', ''))
      const targetCard = findCard(targetId)
      if (!targetCard) return

      if (targetCard.status !== card.status || targetCard.groupId !== card.groupId) {
        await onMoveCard(card.id, targetCard.status, targetCard.groupId !== card.groupId ? targetCard.groupId : undefined)
      }
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full items-start pb-6">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              label={STATUS_LABELS[status]}
              cards={group.columns[status]}
              groupId={group.id}
              onCardClick={setSelectedCard}
              onAddCard={onAddCard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard && (
            <div style={{ opacity: 0.85, cursor: 'grabbing', transform: 'rotate(2deg)' }}>
              <KanbanCard card={activeCard} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardDialog
          card={selectedCard}
          groups={allGroups}
          onClose={() => setSelectedCard(null)}
          onUpdate={async (id, data) => {
            await onUpdateCard(id, data)
            // Refresh selected card data optimistically
            setSelectedCard((prev) =>
              prev
                ? {
                    ...prev,
                    title: data.title,
                    content: data.content ?? prev.content,
                    status: data.status ?? prev.status,
                    dueDate: data.dueDate ?? null,
                  }
                : null
            )
          }}
          onDelete={async (id) => {
            await onDeleteCard(id)
            setSelectedCard(null)
          }}
        />
      )}
    </>
  )
}
