# 🐸 Tadpole

**Start small. Grow bigger. Get stuff done.**

A modern, full-stack todo application built with Next.js, React, Tailwind CSS, and CockroachDB. Tadpole combines a clean, Notion-inspired interface with powerful task management features including drag-and-drop reordering, tags, and archiving.

## ✨ Features

### Core Functionality
- **✅ Full CRUD Operations** - Create, read, update, and delete tasks
- **🎯 Task Management** - Title, description, and completion tracking
- **🏷️ Smart Tagging System** - Color-coded tags with autocomplete and reusable tag library
- **🎨 Color-Adaptive Tags** - Automatic text color adjustment for optimal readability
- **↕️ Drag-and-Drop Reordering** - Smooth, intuitive task prioritization with @dnd-kit
- **📦 Archive Functionality** - Clean separation between active and archived tasks
- **⚡ Optimistic UI Updates** - Instant feedback for all actions
- **🎲 Random Emoji Header** - Fresh random emoji on every page load

### User Experience
- **Clean, Minimal Design** - Inspired by Notion, Anthropic, and OpenAI interfaces
- **Hover-Only Actions** - Edit, archive, and delete buttons appear on hover
- **Inline Editing** - Quick edits without leaving the task view
- **Smart Edit Mode** - Click anywhere outside to save changes
- **Keyboard Shortcuts** - Enter to save, Escape to cancel
- **Error Handling** - Graceful degradation with user-friendly error messages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- CockroachDB account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd full-stack-todo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@host:26257/defaultdb?sslmode=verify-full"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 18+** - UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **@dnd-kit** - Drag-and-drop functionality
- **lucide-react** - Beautiful icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe ORM
- **CockroachDB Serverless** - Distributed SQL database

### Deployment
- **Vercel** - Optimized for Next.js applications

## 📁 Project Structure

```
full-stack-todo/
├── app/
│   ├── api/
│   │   ├── tags/
│   │   │   ├── route.ts          # GET, POST tags
│   │   │   └── [id]/
│   │   │       └── route.ts      # DELETE tag
│   │   └── tasks/
│   │       ├── route.ts          # GET, POST tasks
│   │       └── [id]/
│   │           └── route.ts      # PATCH, DELETE task
│   ├── components/
│   │   ├── ArchiveToggle.tsx    # Toggle archived view
│   │   ├── TagInput.tsx         # Tag creation & selection
│   │   ├── TodoForm.tsx         # Task creation form
│   │   ├── TodoItem.tsx         # Individual task card
│   │   └── TodoList.tsx         # Main task container
│   ├── hooks/
│   │   ├── useTags.ts           # Tag state management
│   │   └── useTasks.ts          # Task state management
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── utils/
│   │   └── colorUtils.ts        # Color contrast utilities
│   ├── layout.tsx               # Root layout & metadata
│   └── page.tsx                 # Homepage
├── lib/
│   └── prisma.ts                # Prisma client singleton
├── prisma/
│   └── schema.prisma            # Database schema
├── public/
│   └── favicon.svg              # Whale emoji favicon
└── notes/
    ├── prd.md                   # Product requirements
    └── technical-implementation.md
```

## 🗄️ Database Schema

### Task Model
```prisma
model Task {
  id          String    @id @default(uuid())
  title       String    @db.String(200)
  description String?   @db.String(2000)
  completed   Boolean   @default(false)
  archived    Boolean   @default(false)
  position    Float     @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  completedAt DateTime?
  tags        TaskTag[]
}
```

### Tag Model
```prisma
model Tag {
  id        String    @id @default(uuid())
  name      String    @unique @db.String(50)
  color     String    @db.String(7) // Hex color
  createdAt DateTime  @default(now())
  tasks     TaskTag[]
}
```

### TaskTag Junction Table
```prisma
model TaskTag {
  taskId String
  tagId  String
  task   Task   @relation(...)
  tag    Tag    @relation(...)

  @@id([taskId, tagId])
}
```

## 🔌 API Endpoints

### Tasks
- `GET /api/tasks` - List all tasks with tags
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/[id]` - Update task (title, description, completed, archived, position, tags)
- `DELETE /api/tasks/[id]` - Delete task

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create new tag (name, color)
- `DELETE /api/tags/[id]` - Delete tag

## 🎨 Design Decisions

### UI/UX
- **Clean Aesthetic**: Moved away from glassmorphism to a cleaner Notion/Linear-inspired design
- **Hover Interactions**: Edit and delete buttons only appear on hover to reduce visual clutter
- **Color Contrast**: Automatic text color calculation ensures tags are always readable
- **Optimistic Updates**: All mutations update the UI immediately before server confirmation
- **Random Emoji**: Server-side generation prevents hydration issues

### Architecture
- **Client-Side Filtering**: Archive toggle filters tasks locally to avoid unnecessary API calls
- **Separate Tag Management**: Tags are global entities, reusable across all tasks
- **Optimistic UI**: All mutations use optimistic updates with automatic revert on failure
- **Type Safety**: Full TypeScript coverage with strict typing from database to UI

### Technical Choices
- **@dnd-kit over react-beautiful-dnd**: Better TypeScript support and active maintenance
- **Prisma over Drizzle**: More mature ecosystem despite notes recommending Drizzle
- **CockroachDB**: Serverless, distributed SQL with excellent free tier
- **Task Model**: Used `Task` instead of `Todo` for cleaner naming

## ✅ Completed Features

- [x] Task CRUD operations
- [x] Inline editing with auto-save
- [x] Drag-and-drop reordering
- [x] Archive/unarchive functionality
- [x] Tag creation and management
- [x] Color-coded tag system with 8 preset colors
- [x] Tag autocomplete and search
- [x] Automatic text color for accessibility
- [x] Completed task tracking
- [x] Position-based ordering
- [x] Optimistic UI updates
- [x] Error handling and validation
- [x] Responsive design
- [x] Random emoji header
- [x] Custom whale emoji favicon

## 🚧 Upcoming Features

### Phase 2 (Near-term)
- [ ] Search and filter functionality
- [ ] Keyboard shortcuts (Cmd+K for search)
- [ ] Debounced search input
- [ ] Filter by tag
- [ ] Filter by completion status
- [ ] Bulk actions (archive all completed)

### Phase 3 (Long-term)
- [ ] Priority levels (High/Medium/Low)
- [ ] Focus mode
- [ ] Subtasks
- [ ] Due dates
- [ ] Recurring tasks
- [ ] User authentication
- [ ] Dark mode toggle
- [ ] Data export/import
- [ ] Mobile native apps

## 🧪 Testing Locally

1. **Create a task**
   - Click the title input, add a title and optional description
   - Add tags by typing in "Add tags..." field
   - Click "Add" to create

2. **Edit a task**
   - Hover over a task and click the edit (pencil) icon
   - Modify title, description, or tags
   - Click outside to save

3. **Reorder tasks**
   - Hover over a task to reveal the drag handle
   - Click and drag to reorder

4. **Archive tasks**
   - Hover over a task and click the archive icon
   - Click "Show Archived" to view archived tasks
   - Click unarchive icon to restore

5. **Tag management**
   - When creating/editing, click "Add tags..."
   - Type to search existing tags or create new ones
   - Select a color for new tags
   - Click "Create" to add to your tag library

## 🐛 Known Issues

- None currently reported

## 🤝 Contributing

This is a learning project, but suggestions and improvements are welcome!

## 📝 License

MIT

## 🙏 Acknowledgments

- Design inspiration from Notion, Linear, Anthropic, and OpenAI
- Built as a learning project to explore Next.js 15, Prisma, and CockroachDB
- Special thanks to the @dnd-kit team for an excellent drag-and-drop library

---

**Built with ❤️ and lots of ☕**
