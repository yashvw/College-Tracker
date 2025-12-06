# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Progressive Web App (PWA) for college students to track attendance, manage tasks/exams, maintain habits, and organize todos. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Features local-first data storage with backup/export capabilities and push notification support.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and API routes
  - `app/page.tsx` - Main attendance tracking page (single-page app with client-side routing)
  - `app/layout.tsx` - Root layout with PWA metadata
  - `app/attendance/mark.tsx` - Attendance marking page (linked from notifications)
  - `app/api/` - Backend API routes
    - `backup/route.ts` - Data backup endpoint
    - `export/route.ts` - CSV export endpoint
    - `export-xlsx/route.ts` - Excel export endpoint
    - `notifications/subscribe/route.ts` - Push notification subscription storage
    - `notifications/send/route.ts` - Send push notifications
- `components/` - React components
  - `attendance-card.tsx` - Subject attendance card with circular progress
  - `bottom-nav.tsx` - Bottom navigation bar
  - Modal components for various features (calendar, tasks, habits, todos, tags, etc.)
  - `ui/` - shadcn/ui component library
- `lib/` - Utility functions
  - `notifications.ts` - Notification API helpers (service worker, push, local notifications)
  - `utils.ts` - General utilities
- `hooks/` - React hooks
  - `use-notifications.ts` - Notification management + scheduled notification logic
- `public/` - Static assets
  - `sw.js` - Service worker for push notifications
  - `manifest.json` - PWA manifest
  - Favicon variants for different platforms

### Data Architecture

**Local Storage Schema:**
- `subjects` - Subject attendance records
- `tasks` - Exams and assignments with deadlines
- `todos` - Todo list items
- `binTodos` - Deleted todos (cleared daily)
- `habits` - Habit tracking with date-based completions
- `tags` - Subject tags for filtering
- `notificationSchedule` - Scheduled class notifications
- `attendanceData` - Quick attendance lookup
- `tutorialSeen` - Tutorial display flag

**Data Model:**
```typescript
Subject {
  id: string
  name: string
  attended: number
  missed: number
  requirement: number  // percentage (e.g., 75)
  glowColor: string   // hex color
  tags: string[]
}

Task {
  id: string
  title: string
  dueDate: string     // ISO date
  type: "exam" | "assignment"
  remindDaysBefore?: number
}

Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string   // ISO date
}

Habit {
  id: string
  name: string
  completions: Record<string, boolean>  // "YYYY-MM-DD" => true/false
  createdAt: string
}
```

### Page Navigation

The app uses client-side routing via `currentPage` state in `app/page.tsx`:
- `attendance` - Main attendance tracking page (default)
- `todos` - Todo list page
- `exams` - Exams and assignments page
- `habits` - Habit tracker page

Navigation is handled by `<BottomNav>` component which updates the `currentPage` state.

### Notification System

**Architecture:**
1. **Service Worker** (`public/sw.js`) - Handles push events and notification clicks
2. **Notification Library** (`lib/notifications.ts`) - Client-side notification API
3. **Notification Hook** (`hooks/use-notifications.ts`) - React integration + scheduled notifications
4. **API Routes** (`app/api/notifications/`) - Server-side push notification delivery

**Scheduled Notifications:**
The app supports class reminders stored in `localStorage.notificationSchedule`. The `use-notifications.ts` hook checks every minute for due notifications and sends them via the Notification API. Clicking a notification opens `/attendance/mark` with pre-filled subject and time information.

**Push Notifications:**
Requires VAPID keys in environment variables (see NOTIFICATIONS_SETUP.md):
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Public VAPID key (client-side)
- `VAPID_PRIVATE_KEY` - Private VAPID key (server-side)
- `VAPID_SUBJECT` - Contact email (e.g., mailto:email@example.com)

### Export/Backup System

**Export Formats:**
- **Excel (ZIP)** - Full backup with separate sheets for subjects, tasks, todos, habits (via ExcelJS)
- **CSV** - Legacy subject/task export
- **Habit Calendar** - Monthly calendar view with completion status (via ExcelJS)

**API Endpoints:**
- `POST /api/export` - Returns CSV
- `POST /api/export-xlsx` - Returns ZIP with Excel files
- `POST /api/backup` - (deprecated) legacy backup endpoint

**Import:**
The app supports importing backup ZIP files via `<TagManagementModal>` component. Files are parsed using JSZip and ExcelJS, then merged with existing data.

### Styling

- **Framework:** Tailwind CSS v4.x with PostCSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Animations:** tailwindcss-animate + tw-animate-css
- **Color Scheme:** Dark mode with green accent (#22c55e)
- **Responsive:** Mobile-first design with sm/md/lg breakpoints

### Build Configuration

- **Next.js Config:**
  - ESLint ignored during builds
  - TypeScript errors ignored during builds
  - Image optimization disabled (for static export compatibility)
- **TypeScript:**
  - Strict mode enabled
  - Path alias: `@/*` → `./*`
  - JSX set to `react-jsx` (React 19)

## Common Development Tasks

### Adding a New Subject Field

1. Update `Subject` interface in `app/page.tsx`
2. Update localStorage schema in `useEffect` hooks
3. Update `<AddSubjectModal>` and `<EditSubjectModal>` forms
4. Update `<AttendanceCard>` to display the field
5. Update export/backup logic in `app/api/export-xlsx/route.ts`

### Adding a New Page

1. Add new page key to `currentPage` state type
2. Create conditional render block in `app/page.tsx`
3. Add navigation button to `<BottomNav>`
4. Implement page layout following existing patterns

### Modifying Notification Behavior

- **Scheduled Notifications:** Edit logic in `hooks/use-notifications.ts` (lines 19-75)
- **Push Notifications:** Edit service worker in `public/sw.js`
- **Notification Permissions:** Edit `lib/notifications.ts`

### Working with Habits

The habit system uses a date-keyed dictionary for completion tracking:
```typescript
completions: {
  "2024-01-15": true,   // completed
  "2024-01-16": false,  // explicitly missed
  // undefined = not yet recorded
}
```

Past dates with no entry are treated as "missed" when exporting. Future dates remain blank.

## Important Notes

- **Data Persistence:** All data is stored in `localStorage`. No backend database.
- **PWA Support:** App can be installed on mobile devices via manifest.json
- **Offline First:** Works without internet (except push notifications)
- **Daily Bin Cleanup:** Deleted todos in bin are cleared at midnight
- **Attendance Calculation:** Percentage = attended / (attended + missed) × 100
- **Classes to Skip Formula:** Math.ceil(((requirement/100 × total - attended) / (1 - requirement/100)))
