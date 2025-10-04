# Product Requirements Document: Modern Todo Application

## 1. Product Overview

A full-stack todo application with a unique, slick interface that provides essential task management capabilities with drag-and-drop reordering, robust search/filtering, and archiving functionality. Built with Next.js, React, Tailwind CSS, and CockroachDB.

### Vision

Create an intuitive, fast, and visually distinctive todo app that handles the basics exceptionally well while providing thoughtful quality-of-life features that reduce friction in daily task management.

### Target Users

- Individual users managing personal tasks
- Professionals tracking work items
- Anyone seeking a clean, efficient alternative to existing todo apps

## 2. Core User Stories

**Must-Have (MVP)**

- As a user, I want to create todos with a title and description so I can capture tasks with context
- As a user, I want to check off completed todos so I can track my progress
- As a user, I want to edit existing todos so I can update task details as they evolve
- As a user, I want to delete todos so I can remove tasks that are no longer relevant
- As a user, I want to drag and drop todos to reorder them so I can manually prioritize my work
- As a user, I want to search and filter my todos so I can quickly find specific tasks
- As a user, I want to archive completed todos so I can maintain a clean active list while preserving history

**Nice-to-Have (Future Phases)**

- As a user, I want to assign priority levels to todos so I can identify urgent tasks at a glance
- As a user, I want a focus mode that highlights only my current task so I can minimize distractions
- As a user, I want quick capture functionality so I can add todos instantly without breaking my flow
- As a user, I want to tag tasks by energy level required so I can match tasks to my current state
- As a user, I want to break down todos into subtasks so I can manage complex projects

## 3. Feature Requirements

### 3.1 MVP Features (Phase 1)

#### 3.1.1 Todo CRUD Operations

**Create Todo**

- Title field (required, max 200 characters)
- Description field (optional, rich text support, max 2000 characters)
- Auto-save on creation
- Visual confirmation of successful creation
- Default position: bottom of active list

**Edit Todo**

- Inline editing for title
- Modal or expandable panel for description editing
- Auto-save after 1 second of inactivity or on blur
- Visual indicator of save status (saving... / saved)
- Keyboard shortcuts: Enter to save, Esc to cancel

**Complete/Uncomplete Todo**

- Single-click checkbox to toggle completion status
- Visual transition (strikethrough, opacity change, animation)
- Completed todos move to separate section or remain in place (configurable)
- Timestamp of completion captured

**Delete Todo**

- Delete button with confirmation prompt
- Soft delete with 30-second undo option
- Permanent deletion after undo window expires
- Optional: Toast notification with undo button

#### 3.1.2 Drag and Drop Reordering

**Behavior**

- Drag handle or entire card draggable
- Visual feedback during drag (ghost/placeholder)
- Smooth animations on drop
- Works on both active and archived lists independently
- Position persisted immediately to database
- Touch-friendly on mobile devices

**Technical Considerations**

- Use a library like @dnd-kit/core or react-beautiful-dnd
- Optimistic UI updates
- Position stored as integer or float for flexible reordering

#### 3.1.3 Search and Filter

**Search**

- Search bar prominently placed at top of interface
- Real-time search as user types (debounced)
- Searches across title and description
- Highlight matched text in results
- Clear button to reset search
- Keyboard shortcut to focus search (Cmd/Ctrl + K)

**Filter**

- Filter by status: Active / Completed / All
- Filter toggle buttons or dropdown
- Multiple filters can be active simultaneously (search + status filter)
- Filter state persisted in URL for shareability
- Clear all filters button

**Results Display**

- Show count of filtered results
- Empty state message when no results found
- Maintain drag-and-drop functionality on filtered results

#### 3.1.4 Archive Functionality

**Archive Behavior**

- Manual archive action (separate from completion)
- OR auto-archive completed todos after X days (configurable)
- Archived todos moved to separate "Archive" view/tab
- Archive view has same search/filter capabilities
- Can un-archive todos back to active list
- Archived todos retain all metadata (completion date, position, etc.)

**Archive UI**

- Toggle between "Active" and "Archive" views
- Archive count badge
- Bulk archive action (archive all completed)
- Optional: Permanent delete from archive

### 3.2 Future Features (Phase 2+)

#### Priority Levels

- 3 levels: High (red), Medium (yellow), Low (green/gray)
- Visual indicator: color-coded badge or border
- Sort by priority option
- Filter by priority

#### Focus Mode

- Single-task view that hides all other todos
- Timer integration (optional)
- Next/Previous navigation
- Exit focus mode button

#### Quick Capture

- Global keyboard shortcut (/) to open quick-add modal
- Minimal fields: just title, everything else optional
- Instant save on Enter
- Stays at top of screen, non-blocking

#### Energy-Based Sorting

- Tag system: High Energy / Medium Energy / Low Energy
- UI selector when creating/editing todo
- Filter: "Show me Low Energy tasks"
- Visual icons (⚡ battery-style indicators)
- Implementation: simply a tag/category field with predefined values

#### Subtasks

- Nested checklist within a todo
- Progress indicator (2/5 subtasks complete)
- Indented visual hierarchy
- Subtasks can be reordered
- Parent todo only completes when all subtasks complete (optional)

## 4. Technical Requirements

### 4.1 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: CockroachDB Serverless (cloud-hosted)
- **ORM**: Prisma or Drizzle ORM (recommend Drizzle for better type safety)
- **Deployment**: Vercel (recommended) or similar platform

### 4.2 Database Schema (MVP)

```
Table: todos
- id (UUID, primary key)
- title (VARCHAR(200), required)
- description (TEXT, nullable)
- completed (BOOLEAN, default false)
- archived (BOOLEAN, default false)
- position (INTEGER or FLOAT, for ordering)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- completed_at (TIMESTAMP, nullable)
```

### 4.3 API Endpoints (MVP)

```
GET    /api/todos              - List all todos (with query params for filters)
POST   /api/todos              - Create new todo
GET    /api/todos/[id]         - Get single todo
PATCH  /api/todos/[id]         - Update todo (title, description, completed, archived, position)
DELETE /api/todos/[id]         - Delete todo
POST   /api/todos/reorder      - Batch update positions after drag-and-drop
```

### 4.4 Performance Requirements

- Initial page load: < 1 second
- Todo creation: < 200ms perceived (optimistic UI)
- Search results: < 100ms
- Drag-and-drop: 60fps animations
- Database queries: < 100ms (indexed searches)

### 4.5 UI/UX Requirements

**Unique Interface Elements**

- Custom animations for todo completion (not just strikethrough)
- Gradient backgrounds or glassmorphism effects
- Micro-interactions (hover states, transitions)
- Dark mode support
- Responsive design (mobile-first)

**Accessibility**

- Keyboard navigation for all actions
- ARIA labels for screen readers
- Focus indicators
- Color contrast ratios meet WCAG AA standards

## 5. Success Metrics

**User Engagement**

- Daily active users
- Average todos created per user per day
- Average session duration

**Feature Usage**

- % of users who use search/filter
- % of users who use drag-and-drop reordering
- % of users who archive todos
- Completion rate (todos completed / todos created)

**Technical Performance**

- Average API response time
- Error rate
- Page load time (P50, P95)

## 6. Out of Scope (for MVP)

- User authentication / multi-user support (single-user app initially)
- Collaboration features
- Mobile native apps (web-only)
- Third-party integrations (calendar, email, etc.)
- Recurring todos
- Reminders/notifications
- Data export
- Themes/customization options

## 7. Future Considerations

**Phase 2** (Post-MVP)

- Priority levels
- Focus mode
- Quick capture

**Phase 3** (Long-term)

- User authentication
- Energy-based sorting
- Subtasks
- Recurring todos
- Mobile apps
- Data export/import

## 8. Design Decisions

1. **Completed todos**: Remain in active view with strikethrough and automatically move to bottom of list
2. **Archive**: Manual only - no auto-archiving functionality
3. **Authentication**: Single-user application, no auth required for MVP
4. **Drag-and-drop**: Works within active and archived sections independently
5. **Display limit**: 200 todos before pagination (if needed)

## 9. Open Questions

1. Should there be an "undo" history for bulk actions?
2. Should drag-and-drop allow moving items between active/archived sections?

## 9. Design Inspiration

Consider exploring:

- Linear's clean, minimal interface
- Notion's smooth interactions
- Things 3's thoughtful details
- Todoist's keyboard-first approach

The goal is to create something that feels **fast**, **smooth**, and **uniquely yours**.
