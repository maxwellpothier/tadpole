# Tadpole

A modern, full-stack task management application built with Next.js, React, Tailwind CSS, and CockroachDB. Tadpole provides an intuitive interface for managing tasks with advanced features including drag-and-drop reordering, intelligent tagging, and archival capabilities.

## Overview

Tadpole is designed to streamline task management workflows through a clean, minimalist interface inspired by industry-leading productivity tools. The application leverages modern web technologies to deliver a responsive, performant user experience with real-time updates and seamless interactions.

## Development Timeline

This project was completed in approximately 8 hours of focused development time, with emphasis on learning modern full-stack technologies and best practices:

**Hour 1:** Planning session and documentation generation, including PRD and technical implementation guides (available in `/notes`)

**Hours 2-3:** Database layer setup with Prisma and CockroachDB, including research on distributed database architecture and migration strategies

**Hours 4-5:** RESTful API development with Next.js 15 App Router, focusing on request/response patterns and data validation

**Hours 6-7:** Frontend architecture design and implementation with modular component structure and @dnd-kit integration

**Hour 8:** Tag system implementation including color-coded categorization and autocomplete search *(in progress on `tags` branch)*

## Features

### Core Functionality
- **Complete CRUD Operations** - Full create, read, update, and delete functionality for task management
- **Advanced Task Management** - Support for task titles, detailed descriptions, and completion status tracking
- **Intelligent Tagging System** - Color-coded tags with autocomplete search and centralized tag library
- **Adaptive Color Contrast** - Automatic text color optimization based on tag background for accessibility compliance
- **Drag-and-Drop Interface** - Intuitive task reordering powered by @dnd-kit library
- **Archive Management** - Separate view for archived tasks to maintain workspace organization
- **Optimistic UI Updates** - Client-side state updates with automatic rollback on server errors
- **Dynamic Branding** - Server-rendered emoji rotation for consistent user experience

### User Experience
- **Professional Interface Design** - Clean, minimal aesthetic inspired by Notion, Anthropic, and OpenAI
- **Context-Aware Actions** - Action buttons revealed on hover to reduce visual clutter
- **Inline Editing** - Seamless editing experience without modal dialogs or page navigation
- **Auto-Save Functionality** - Automatic save on blur with configurable delay
- **Keyboard Navigation** - Full keyboard support including Enter to save and Escape to cancel
- **Comprehensive Error Handling** - Graceful error states with clear user feedback

## Installation and Setup

### System Requirements
- Node.js version 18.0 or higher
- npm or yarn package manager
- CockroachDB cloud account (free tier available at https://cockroachlabs.cloud)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd full-stack-todo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root with the following configuration:
   ```env
   DATABASE_URL="postgresql://username:password@host:26257/defaultdb?sslmode=verify-full"
   ```

4. **Initialize the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Synchronize database schema
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**

   Open your browser and navigate to `http://localhost:3000`

## Technology Stack

### Frontend Technologies
- **Next.js 15.5.4** - React-based framework utilizing App Router architecture
- **React 18+** - Component-based UI library with modern hooks API
- **TypeScript** - Statically typed superset of JavaScript for enhanced developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **@dnd-kit** - Modular, performant drag-and-drop library
- **lucide-react** - Consistent icon system

### Backend Infrastructure
- **Next.js API Routes** - Serverless API endpoints with edge runtime support
- **Prisma ORM** - Type-safe database client with schema migration support
- **CockroachDB Serverless** - Distributed, cloud-native SQL database

### Deployment and Hosting
- **Vercel** - Serverless deployment platform optimized for Next.js applications

## Project Architecture

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

## Database Schema

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

## API Reference

### Tasks
- `GET /api/tasks` - List all tasks with tags
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/[id]` - Update task (title, description, completed, archived, position, tags)
- `DELETE /api/tasks/[id]` - Delete task

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create new tag (name, color)
- `DELETE /api/tags/[id]` - Delete tag

## Architecture and Design Decisions

### User Interface Design
- **Minimalist Aesthetic** - Interface design follows principles from industry-leading productivity applications (Notion, Linear)
- **Progressive Disclosure** - Action buttons revealed contextually on hover to minimize cognitive load
- **Accessibility Compliance** - Automated color contrast calculation ensures WCAG readability standards
- **Optimistic UI Pattern** - Immediate client-side updates with server synchronization and error recovery
- **Server-Side Rendering** - Dynamic content generation on server to prevent hydration mismatches

### System Architecture
- **Client-Side Filtering** - Local state filtering reduces API overhead and improves response time
- **Normalized Data Model** - Tag entities stored independently for reusability across tasks
- **Optimistic Concurrency Control** - Client-side mutations with automatic rollback on server errors
- **End-to-End Type Safety** - TypeScript types propagated from database schema through API to UI components

### Technology Selection Rationale
- **@dnd-kit** - Selected for superior TypeScript support and active maintenance compared to alternatives
- **Prisma ORM** - Chosen for mature ecosystem and excellent developer experience
- **CockroachDB** - Distributed architecture with generous free tier and PostgreSQL compatibility
- **Semantic Naming** - `Task` model naming preferred over `Todo` for professional context

## Current Feature Set

### Implemented Functionality
- Complete CRUD operations for task management
- Inline editing with automatic save on blur
- Drag-and-drop task reordering with position persistence
- Archive and restoration capabilities
- Tag creation, management, and association
- 8 preset color options for tag categorization
- Tag autocomplete with search functionality
- WCAG-compliant automatic text color contrast
- Task completion status tracking
- Position-based task ordering
- Optimistic UI updates with error recovery
- Comprehensive error handling and validation
- Fully responsive design
- Dynamic branding elements
- Custom favicon implementation

## Development Roadmap

### Phase 2: Enhanced Filtering and Search
- Full-text search across task titles and descriptions
- Keyboard shortcut system (Cmd/Ctrl+K for search)
- Debounced search input for performance optimization
- Tag-based filtering
- Status-based filtering (active/completed/all)
- Bulk operations (archive all completed tasks)

### Phase 3: Advanced Features
- Priority level system (High/Medium/Low)
- Focus mode for distraction-free task management
- Hierarchical subtask support
- Due date tracking and visualization
- Recurring task automation
- Multi-user authentication and authorization
- Theme customization including dark mode
- Data export and import capabilities (JSON, CSV)
- Native mobile applications (iOS, Android)

## Testing and Verification

### Feature Testing Guide

1. **Task Creation**
   - Select the title input field
   - Enter task title and optional description
   - Add tags using the "Add tags..." field with autocomplete
   - Submit to create task

2. **Task Editing**
   - Hover over task to reveal action buttons
   - Click edit icon to enter edit mode
   - Modify title, description, or associated tags
   - Click outside the task card to auto-save

3. **Task Reordering**
   - Hover over task to reveal drag handle
   - Click and drag task to desired position
   - Release to persist new order

4. **Archive Management**
   - Hover over task and select archive icon
   - Toggle "Show Archived" to switch between views
   - Use unarchive icon to restore tasks

5. **Tag System**
   - Access tag input during task creation or editing
   - Search existing tags by typing
   - Create new tags with custom colors (8 preset options)
   - Tags are added to centralized library for reuse

## Known Issues and Limitations

No critical issues currently identified. Please report bugs via the issue tracker.

## Contributing

While this project serves primarily as a learning exercise, contributions and suggestions are welcome. Please open an issue to discuss proposed changes before submitting pull requests.

## License

This project is licensed under the MIT License.

## Acknowledgments

This application was developed as an educational project to explore modern web development technologies and best practices.

**Technology Credits:**
- Interface design inspired by Notion, Linear, Anthropic, and OpenAI
- Drag-and-drop functionality powered by @dnd-kit
- Built with Next.js 15, React 18, Prisma, and CockroachDB
