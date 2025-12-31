# SweetWellness - AI Coding Agent Instructions

## Project Overview
SweetWellness is a React-based nutrition and recipe recommendation web app with an AI-powered chat assistant. It integrates Firebase for authentication and data persistence, Google's Gemini API for nutrition advice, and Tailwind CSS for styling.

## Architecture Overview

### Core Tech Stack
- **Frontend**: React 19 + Vite + React Router v7 for SPA navigation
- **Styling**: Tailwind CSS v4.1 (with `@tailwindcss/vite` plugin)
- **Backend**: Firebase (Firestore DB + Authentication)
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash Lite)
- **Build/Dev**: Vite with HMR support

### Key Data Flow
1. **Firebase Auth** (`src/firebase.js`): Exports `db` (Firestore) and `auth` instances used globally
2. **Route Protection** (`src/main.jsx`):
   - `PrivateRoute`: Wraps pages requiring login (Profile, ChatAI, Admin)
   - `PublicRoute`: Wraps guest-only pages (Login, Register)
   - Auth state checked via `onAuthStateChanged()` before rendering
3. **Navigation**: App shell in `src/App.jsx` renders `<Navbar />`, `<Outlet />` (page content), and `<Footer />`

### Database Schema (Firestore Collections)
- **users**: `{ fullName, goal, allergy, diet, role (user|admin) }`
- **recipes**: `{ title, category, calories, ingredients[], tags[], status (draft|approved), ...metadata }`
- **feedbacks**: `{ recipeId, userId, rating, comment, timestamp }`
- **reviews**: `{ userId, comment, timestamp }` (Home.jsx listens to this)

## Critical Page Components

### ChatAI Page (`src/pages/ChatAI.jsx`)
- **Purpose**: AI nutrition assistant using Gemini API with user profile context
- **Key Pattern**: 
  - Fetches user profile from Firestore on mount
  - Loads recipe database as string context for AI recommendations
  - Prompts include `userProfile.goal`, `userProfile.allergy`, `userProfile.diet`, `recipeContext`
  - Uses `VITE_GEMINI_API_KEY` environment variable
  - Messages formatted with bold (`**text**`) and newlines

### Admin Page (`src/pages/Admin.jsx`)
- **Purpose**: Recipe management dashboard (approve/reject submissions, view stats)
- **Key Pattern**:
  - Uses role-based access (check `role === "admin"` in Firestore user doc)
  - Listens to "pending" status recipes for approval workflow
  - Supports bulk operations and recipe form with dynamic field handling
  - Inline SVG icons defined in `Icons` object at top

### Resep & Home Pages
- **Pattern**: Both fetch recipes with `where("status", "==", "approved")`
- **Rating Logic**: Real-time average calculated from `feedbacks` collection
- **Filtering**: Dynamic diet/method filters built from recipe data
- **Pagination**: 6 recipes per page (Resep) or 3 (Home)

## Development Workflows

### Start Development
```bash
npm run dev          # Runs Vite dev server (usually http://localhost:5173)
```

### Build & Deploy
```bash
npm run build        # Bundles to dist/
npm run preview      # Local preview of production build
```

### Linting
```bash
npm lint             # ESLint check on all .js/.jsx files
```

### Environment Setup
Create `.env.local` with:
```
VITE_GEMINI_API_KEY=<your-gemini-key>
```

## Code Conventions & Patterns

### React Hooks Usage
- Always use `onAuthStateChanged()` from `firebase/auth` to monitor login state
- Use `useEffect()` cleanup functions to unsubscribe from Firestore listeners
- State updates must account for Firestore async operations with loading flags

### Firestore Queries
- Always filter with `where("status", "==", "approved")` when displaying public recipes
- Use `onSnapshot()` for real-time updates (e.g., ratings, reviews)
- Use `getDocs()` for one-time fetches to build context
- Prefer `serverTimestamp()` over client timestamps for consistency

### Component Patterns
- Export reusable components (Button, Modal, etc.) as default or named exports
- Navbar checks admin role via `userData.role === "admin"` from user doc
- Modal/dialog state typically managed with `selectedRecipe` state and null check rendering

### Styling Conventions
- Use Tailwind utility classes exclusively (no custom CSS except in `App.css`)
- Common spacing: `pt-20` (navbar offset), `min-h-screen`, `flex flex-col`
- Color scheme: Dark browns (`#4B110D` for text emphasis), cream backgrounds

### Error Handling
- Wrap Firebase calls in try-catch, catch `error.message` for logging
- Display user-friendly error messages (e.g., "Koneksi terputus. Coba lagi ya!")
- Always unsubscribe from listeners in cleanup functions

## Integration Points

### Google Gemini API
- Model: `gemini-2.5-flash-lite`
- Input: User message + user profile (goal, allergy, diet) + recipe database as context
- Output: Formatted text with bold (`**...**`) and newlines
- Key: Read from `import.meta.env.VITE_GEMINI_API_KEY`

### Firebase Security
- Auth: Email/password via `signOut()`, `onAuthStateChanged()`
- Firestore: Assumes security rules validate `auth.uid == doc.userId` where needed
- Public recipes filtered server-side with `where("status", "==", "approved")`

## Common Maintenance Tasks

- **Adding new page**: Import in `src/main.jsx`, add route with appropriate guard (PrivateRoute or PublicRoute)
- **Adding recipe field**: Update Admin form schema, update ChatAI prompt context, update Home/Resep filters if needed
- **Changing model**: Update model ID in ChatAI.jsx line ~30: `getGenerativeModel({ model: "..." })`
- **Styling updates**: Modify Tailwind classes directly; no custom CSS files (except App.css for global tweaks)

## Debugging Tips
- Check browser console for Firebase auth/Firestore errors
- Use Firestore emulator if developing offline
- Verify `.env.local` has `VITE_GEMINI_API_KEY` set before running ChatAI
- Monitor real-time listeners in React DevTools Profiler for performance issues
