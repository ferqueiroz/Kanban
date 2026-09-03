import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, Pencil, Check, Trash2, Calendar, Tag, AlignLeft, Eye, Code2 } from 'lucide-react'
import type { Card, CardStatus, Group } from '../../types'
import { STATUS_LABELS } from '../../types'
import { dateValueToIso, InputDate, isoToDateValue } from '../ui/input-date'

interface Props {
  card: Card
  groups: Group[]
  onClose: () => void
  onUpdate: (id: number, data: { title: string; content?: string; status?: CardStatus; dueDate?: string }) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export default function CardDialog({ card, groups, onClose, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [content, setContent] = useState(card.content || '')
  const [status, setStatus] = useState<CardStatus>(card.status)
  const [dueDate, setDueDate] = useState(card.dueDate || '')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onUpdate(card.id, {
        title: title.trim(),
        content: content || undefined,
        status,
        dueDate: dueDate || undefined,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await onDelete(card.id)
    onClose()
  }

  const statusConfig: Record<CardStatus, { label: string; color: string; bg: string }> = {
    TODO: { label: 'A Fazer', color: 'var(--status-todo)', bg: 'var(--status-todo-bg)' },
    IN_PROGRESS: { label: 'Em Progresso', color: 'var(--status-progress)', bg: 'var(--status-progress-bg)' },
    DONE: { label: 'Concluído', color: 'var(--status-done)', bg: 'var(--status-done-bg)' },
  }

  const group = groups.find((g) => g.id === card.groupId)

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'var(--bg-overlay)' }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden animate-slide-up"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-dialog)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            {/* Group badge */}
            {group && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: group.color + '22', color: group.color }}
              >
                {group.name}
              </span>
            )}
            {/* Status badge */}
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: statusConfig[card.status].bg,
                color: statusConfig[card.status].color,
              }}
            >
              {statusConfig[card.status].label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary-text)',
                }}
              >
                <Pencil size={14} />
                Editar
              </button>
            )}

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2'
                  e.currentTarget.style.color = '#dc2626'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-tertiary)'
                }}
              >
                <Trash2 size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Deletar?</span>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: '#dc2626', color: '#fff' }}
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-column)', color: 'var(--text-secondary)' }}
                >
                  <X size={13} />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-column)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          {editing ? (
            <input
              className="w-full text-xl font-bold outline-none bg-transparent border-b-2 pb-1"
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--text-primary)',
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da tarefa..."
            />
          ) : (
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {card.title}
            </h2>
          )}

          {/* Meta: status + due date (editing mode) */}
          {editing && (
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
                  <Tag size={11} className="inline mr-1" />
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CardStatus)}
                  className="text-sm px-3 py-1.5 rounded-lg outline-none"
                  style={{
                    backgroundColor: 'var(--bg-column)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {(Object.keys(STATUS_LABELS) as CardStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
                  <Calendar size={11} className="inline mr-1" />
                  Data de entrega
                </label>

                <InputDate 
                  value={isoToDateValue(dueDate)}
                  onChange={(date) => setDueDate(dateValueToIso(date))}
                />
              </div>
            </div>
          )}

          {/* Due date display (view mode) */}
          {!editing && card.dueDate && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {new Date(card.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

          {/* Content area */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <AlignLeft size={14} style={{ color: 'var(--text-tertiary)' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Descrição
                </span>
              </div>

              {editing && (
                <div
                  className="flex rounded-lg p-0.5"
                  style={{ backgroundColor: 'var(--bg-column)' }}
                >
                  <button
                    onClick={() => setPreview(false)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                    style={{
                      backgroundColor: !preview ? 'var(--bg-surface)' : 'transparent',
                      color: !preview ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      boxShadow: !preview ? 'var(--shadow-card)' : 'none',
                    }}
                  >
                    <Code2 size={12} />
                    Editar
                  </button>
                  <button
                    onClick={() => setPreview(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                    style={{
                      backgroundColor: preview ? 'var(--bg-surface)' : 'transparent',
                      color: preview ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      boxShadow: preview ? 'var(--shadow-card)' : 'none',
                    }}
                  >
                    <Eye size={12} />
                    Preview
                  </button>
                </div>
              )}
            </div>

            {editing && !preview ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva sua descrição em Markdown...&#10;&#10;# Título&#10;## Subtítulo&#10;- Item de lista&#10;**negrito** _itálico_ `código`"
                rows={12}
                className="w-full text-sm px-4 py-3 rounded-xl outline-none resize-none font-mono"
                style={{
                  backgroundColor: 'var(--bg-column)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.7',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
              />
            ) : (
              <div
                className="markdown-body min-h-24 rounded-xl px-4 py-3"
                style={{
                  backgroundColor: editing ? 'var(--bg-column)' : 'transparent',
                  border: editing ? '1px solid var(--border-default)' : 'none',
                }}
              >
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
                    Sem descrição. Clique em Editar para adicionar.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions (editing) */}
        {editing && (
          <div
            className="flex items-center justify-end gap-2 px-6 py-4 flex-shrink-0"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <button
              onClick={() => {
                setEditing(false)
                setTitle(card.title)
                setContent(card.content || '')
                setStatus(card.status)
                setDueDate(card.dueDate || '')
                setPreview(false)
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--bg-column)',
                color: 'var(--text-secondary)',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: '#fff',
                opacity: saving || !title.trim() ? 0.6 : 1,
              }}
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
