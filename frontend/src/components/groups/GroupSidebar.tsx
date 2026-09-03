import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Layers } from 'lucide-react'
import type { Group } from '../../types'

const GROUP_COLORS = [
  '#60a5fa', '#34d399', '#f472b6', '#a78bfa',
  '#fb923c', '#facc15', '#f87171', '#2dd4bf',
]

interface Props {
  groups: Group[]
  activeGroupId: number | null
  onSelect: (id: number) => void
  onCreate: (name: string, color: string) => Promise<void>
  onUpdate: (id: number, name: string, color: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export default function GroupSidebar({
  groups,
  activeGroupId,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(GROUP_COLORS[0])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleCreate = async () => {
    if (!newName.trim()) return
    await onCreate(newName.trim(), newColor)
    setNewName('')
    setNewColor(GROUP_COLORS[0])
    setCreating(false)
  }

  const startEdit = (g: Group) => {
    setEditingId(g.id)
    setEditName(g.name)
    setEditColor(g.color)
  }

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return
    await onUpdate(editingId, editName.trim(), editColor)
    setEditingId(null)
  }

  return (
    <aside
      className="flex flex-col h-full w-56 flex-shrink-0"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <Layers size={15} style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Grupos
          </span>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="p-1 rounded-md transition-colors"
          title="Novo grupo"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-column)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Group list */}
      <div className="flex-1 overflow-y-auto py-2">
        {groups.length === 0 && !creating && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Nenhum grupo ainda.
              <br />
              Crie um para começar.
            </p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.id}>
            {editingId === group.id ? (
              <div className="px-3 py-2">
                <input
                  className="w-full text-sm px-2 py-1.5 rounded-lg mb-2 outline-none"
                  style={{
                    backgroundColor: 'var(--bg-column)',
                    border: '1px solid var(--primary)',
                    color: 'var(--text-primary)',
                  }}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                  autoFocus
                />
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {GROUP_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className="w-5 h-5 rounded-full transition-transform"
                      style={{
                        backgroundColor: c,
                        transform: editColor === c ? 'scale(1.25)' : 'scale(1)',
                        outline: editColor === c ? `2px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 py-1 rounded-md text-xs font-medium flex items-center justify-center gap-1"
                    style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                  >
                    <Check size={12} /> Salvar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 rounded-md"
                    style={{ backgroundColor: 'var(--bg-column)', color: 'var(--text-secondary)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="group flex items-center gap-2.5 px-3 py-2.5 cursor-pointer mx-2 rounded-lg transition-all"
                onClick={() => onSelect(group.id)}
                style={{
                  backgroundColor: activeGroupId === group.id ? 'var(--primary-subtle)' : 'transparent',
                  color: activeGroupId === group.id ? 'var(--primary-text)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeGroupId !== group.id) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-column)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeGroupId !== group.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-sm font-medium flex-1 truncate">{group.name}</span>

                {/* Action buttons — appear on hover */}
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(group) }}
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    <Pencil size={12} />
                  </button>
                  {deletingId === group.id ? (
                    <>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          await onDelete(group.id)
                          setDeletingId(null)
                        }}
                        className="p-1 rounded"
                        style={{ color: '#dc2626' }}
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(null) }}
                        className="p-1 rounded"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingId(group.id) }}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Create form */}
        {creating && (
          <div className="px-3 py-2 mx-2 rounded-lg mt-1" style={{ border: '1px dashed var(--border-strong)' }}>
            <input
              className="w-full text-sm px-2 py-1.5 rounded-lg mb-2 outline-none"
              style={{
                backgroundColor: 'var(--bg-column)',
                border: '1px solid var(--primary)',
                color: 'var(--text-primary)',
              }}
              placeholder="Nome do grupo..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5 mb-2">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-5 h-5 rounded-full transition-transform"
                  style={{
                    backgroundColor: c,
                    transform: newColor === c ? 'scale(1.25)' : 'scale(1)',
                    outline: newColor === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 py-1 rounded-md text-xs font-medium flex items-center justify-center gap-1"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  opacity: !newName.trim() ? 0.5 : 1,
                }}
              >
                <Check size={12} /> Criar
              </button>
              <button
                onClick={() => { setCreating(false); setNewName('') }}
                className="p-1 rounded-md"
                style={{ backgroundColor: 'var(--bg-column)', color: 'var(--text-secondary)' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
