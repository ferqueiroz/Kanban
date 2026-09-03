export type CardStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Card {
  id: number
  title: string
  content: string | null
  status: CardStatus
  dueDate: string | null
  positionOrder: number
  groupId: number
  groupName: string
  createdAt: string
  updatedAt: string
}

export interface Group {
  id: number
  name: string
  color: string
  positionOrder: number
  createdAt: string
  columns: {
    TODO: Card[]
    IN_PROGRESS: Card[]
    DONE: Card[]
  }
}

export interface SimpleGroup {
  id: number
  name: string
  color: string
  positionOrder: number
  createdAt: string
}

export interface AuthResponse {
  token: string
  username: string
  userId: number
}

export interface CreateCardRequest {
  title: string
  content?: string
  status: CardStatus
  dueDate?: string
  groupId: number
}

export interface UpdateCardRequest {
  title: string
  content?: string
  status?: CardStatus
  dueDate?: string
}

export interface MoveCardRequest {
  status: CardStatus
  groupId?: number
  positionOrder?: number
}

export interface CreateGroupRequest {
  name: string
  color?: string
}

export interface UpdateGroupRequest {
  name: string
  color?: string
}

export const STATUS_LABELS: Record<CardStatus, string> = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Progresso',
  DONE: 'Concluído',
}

export const STATUS_ORDER: CardStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']
