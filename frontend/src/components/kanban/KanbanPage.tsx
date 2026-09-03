import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsApi, cardsApi } from '../../lib/api'
import GroupSidebar from '../groups/GroupSidebar'
import KanbanBoard from './KanbanBoard'
import type { CardStatus, Group } from '../../types'
import { LayoutGrid, Menu, X } from 'lucide-react'

export default function KanbanPage() {
  const queryClient = useQueryClient()
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch all groups with their cards
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  })

  // Auto-select first group when data loads
  if (groups.length > 0 && activeGroupId === null) {
    setActiveGroupId(groups[0].id)
  }

  // --- Group mutations ---
  const createGroupMutation = useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      groupsApi.create({ name, color }),
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      setActiveGroupId(newGroup.id)
    },
  })

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, name, color }: { id: number; name: string; color: string }) =>
      groupsApi.update(id, { name, color }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })

  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => groupsApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      if (activeGroupId === deletedId) {
        const remaining = groups.filter((g: Group) => g.id !== deletedId)
        setActiveGroupId(remaining.length > 0 ? remaining[0].id : null)
      }
    },
  })

  // --- Card mutations ---
  const addCardMutation = useMutation({
    mutationFn: ({ title, status, groupId }: { title: string; status: CardStatus; groupId: number }) =>
      cardsApi.create({ title, status, groupId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })

  const updateCardMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: { title: string; content?: string; status?: CardStatus; dueDate?: string }
    }) => cardsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })

  const moveCardMutation = useMutation({
    mutationFn: ({
      id,
      status,
      groupId,
    }: {
      id: number
      status: CardStatus
      groupId?: number
    }) => cardsApi.move(id, { status, groupId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })

  const deleteCardMutation = useMutation({
    mutationFn: (id: number) => cardsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })

  // Stable callbacks
  const handleAddCard = useCallback(
    async (title: string, status: CardStatus, groupId: number) => {
      await addCardMutation.mutateAsync({ title, status, groupId })
    },
    [addCardMutation]
  )

  const handleUpdateCard = useCallback(
    async (
      id: number,
      data: { title: string; content?: string; status?: CardStatus; dueDate?: string }
    ) => {
      await updateCardMutation.mutateAsync({ id, data })
    },
    [updateCardMutation]
  )

  const handleMoveCard = useCallback(
    async (id: number, status: CardStatus, groupId?: number) => {
      await moveCardMutation.mutateAsync({ id, status, groupId })
    },
    [moveCardMutation]
  )

  const handleDeleteCard = useCallback(
    async (id: number) => {
      await deleteCardMutation.mutateAsync(id)
    },
    [deleteCardMutation]
  )

  const activeGroup = groups.find((g: Group) => g.id === activeGroupId) ?? null

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: 'var(--bg-overlay)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-40 md:z-auto h-full
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <GroupSidebar
          groups={groups}
          activeGroupId={activeGroupId}
          onSelect={(id) => {
            setActiveGroupId(id)
            setSidebarOpen(false)
          }}
          onCreate={async (name, color) => {
            await createGroupMutation.mutateAsync({ name, color })
          }}
          onUpdate={async (id, name, color) => {
            await updateGroupMutation.mutateAsync({ id, name, color })
          }}
          onDelete={async (id) => {
            await deleteGroupMutation.mutateAsync(id)
          }}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Board header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-lg"
              onClick={() => setSidebarOpen((v) => !v)}
              style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-column)' }}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {activeGroup ? (
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activeGroup.color }}
                />
                <h2
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {activeGroup.name}
                </h2>
              </div>
            ) : (
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Selecione um grupo
              </h2>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <LayoutGrid size={16} style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Board
            </span>
          </div>
        </div>

        {/* Board content */}
        <div className="flex-1 overflow-auto px-5 pt-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'var(--primary)' }}
                />
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Carregando...
                </p>
              </div>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-xs">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--primary-subtle)' }}
                >
                  <LayoutGrid size={26} style={{ color: 'var(--primary)' }} />
                </div>
                <h3
                  className="font-semibold text-base mb-1.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Nenhum grupo ainda
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Crie seu primeiro grupo na barra lateral para começar a organizar suas tarefas.
                </p>
              </div>
            </div>
          ) : !activeGroup ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Selecione um grupo na barra lateral.
              </p>
            </div>
          ) : (
            <KanbanBoard
              group={activeGroup}
              allGroups={groups}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onMoveCard={handleMoveCard}
              onDeleteCard={handleDeleteCard}
            />
          )}
        </div>
      </div>
    </div>
  )
}
