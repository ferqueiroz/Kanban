# Kanban — Organize suas tarefas

Aplicação Kanban full-stack com React + TypeScript no frontend e Spring Boot + PostgreSQL no backend.

---

## Stack

| Camada     | Tecnologia                                  |
|------------|---------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS    |
| Drag & Drop| @dnd-kit                                    |
| Markdown   | react-markdown + remark-gfm                 |
| HTTP       | Axios + TanStack Query                      |
| Backend    | Spring Boot 3.2, Java 17, Spring Security   |
| ORM        | JPA + Hibernate                             |
| Banco      | PostgreSQL 16                               |
| Auth       | JWT (jjwt 0.12)                             |

---

## Pré-requisitos

- Java 17+
- Node.js 20+
- PostgreSQL 16 (ou Docker)
- Maven 3.9+

---

## Setup local (sem Docker)

### 1. Banco de dados

```sql
CREATE DATABASE kanban_db;
```

### 2. Backend

```bash
cd backend

# Configure o application.properties:
# spring.datasource.password=sua_senha
# jwt.secret=uma-chave-com-pelo-menos-32-caracteres

mvn spring-boot:run
```

O backend sobe em `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.

---

## Setup com Docker (recomendado)

```bash
# Na raiz do projeto
docker compose up --build
```

Acesse em `http://localhost:5173`.

---

## Variáveis de ambiente do backend

| Variável                       | Padrão                    | Descrição                        |
|--------------------------------|---------------------------|----------------------------------|
| `spring.datasource.url`        | `jdbc:postgresql://...`   | URL do PostgreSQL                |
| `spring.datasource.username`   | `postgres`                | Usuário do banco                 |
| `spring.datasource.password`   | —                         | Senha do banco (obrigatório)     |
| `jwt.secret`                   | —                         | Chave JWT — mínimo 32 chars      |
| `jwt.expiration`               | `86400000`                | Expiração em ms (24h padrão)     |
| `app.cors.allowed-origins`     | `http://localhost:5173`   | Origins permitidas               |

---

## Endpoints da API

### Auth
| Método | Rota               | Body                           |
|--------|--------------------|--------------------------------|
| POST   | `/api/auth/register` | `{ username, password }`     |
| POST   | `/api/auth/login`    | `{ username, password }`     |

### Groups (requer JWT)
| Método | Rota              | Descrição           |
|--------|-------------------|---------------------|
| GET    | `/api/groups`     | Lista todos os grupos do usuário (com cards) |
| POST   | `/api/groups`     | Cria grupo          |
| PUT    | `/api/groups/:id` | Atualiza grupo      |
| DELETE | `/api/groups/:id` | Remove grupo        |

### Cards (requer JWT)
| Método | Rota                   | Descrição             |
|--------|------------------------|-----------------------|
| GET    | `/api/cards/:id`       | Busca card por ID     |
| POST   | `/api/cards`           | Cria card             |
| PUT    | `/api/cards/:id`       | Atualiza card         |
| PATCH  | `/api/cards/:id/move`  | Move card de coluna   |
| DELETE | `/api/cards/:id`       | Remove card           |

---

## Funcionalidades

- ✅ Autenticação por username/senha com JWT
- ✅ Grupos (workspaces) independentes por usuário
- ✅ Kanban com 3 colunas: A Fazer, Em Progresso, Concluído
- ✅ Cards com título, descrição Markdown, data de entrega
- ✅ Drag & drop para mover cards entre colunas
- ✅ Dialog de visualização com preview Markdown renderizado
- ✅ Editor com toggle Editar/Preview (suporte a GFM: tabelas, checklists, código)
- ✅ Tema Dark/Light com persistência (localStorage)
- ✅ Responsivo (sidebar colapsável em mobile)
- ✅ Datas de entrega com destaque vermelho quando vencidas

---

## Markdown suportado

Dentro dos cards, você pode usar:

```markdown
# Título principal
## Subtítulo

**negrito**, _itálico_, `código inline`

- [ ] Tarefa pendente
- [x] Tarefa concluída

| Coluna A | Coluna B |
|----------|----------|
| Valor 1  | Valor 2  |

```código em bloco```

> Citação
```

---

## Estrutura do projeto

```
kanban-app/
├── backend/
│   ├── src/main/java/com/kanban/
│   │   ├── config/          # Security, CORS, exception handler
│   │   ├── controller/      # AuthController, GroupController, CardController
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # User, Group, Card
│   │   ├── repository/      # JPA repositories
│   │   ├── security/        # JWT, filter, UserPrincipal
│   │   └── service/         # AuthService, GroupService, CardService
│   └── src/main/resources/
│       └── application.properties
└── frontend/
    └── src/
        ├── components/
        │   ├── auth/        # LoginPage
        │   ├── groups/      # GroupSidebar
        │   ├── kanban/      # KanbanPage, KanbanBoard, KanbanColumn, KanbanCard, CardDialog
        │   └── layout/      # Layout, header
        ├── context/         # AuthContext, ThemeContext
        ├── lib/             # api.ts (axios)
        ├── types/           # TypeScript interfaces
        └── styles/          # globals.css (design tokens CSS vars)
```
