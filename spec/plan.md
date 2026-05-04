# Plan — Person 3: Frontend Implementation

> Pre-execution plan based on `spec/SPEC.md`. Each phase should ship as a separate PR.

---

## Phase 0 — Project Setup

**Goal:** A working React app that can talk to the backend.

**Steps:**
1. Scaffold with Vite: `npm create vite@latest client -- --template react`
2. Install dependencies:
   - `react-router-dom` — routing
   - `axios` — API calls
   - `react-markdown` — render Markdown in posts
3. Create `client/src/services/api.js`:
   - Axios instance with `baseURL: http://localhost:5000/api`
   - Request interceptor that reads token from `localStorage` and attaches `Authorization: Bearer <token>` header
4. Create `client/src/context/AuthContext.jsx`:
   - State: `user`, `token`
   - Methods: `login(token, user)`, `logout()`
   - Reads initial state from `localStorage` on mount
5. Create `client/src/context/ThemeContext.jsx`:
   - State: `theme` (`'light'` | `'dark'`)
   - Reads/writes `localStorage`
   - Applies `data-theme` attribute to `document.body`
6. Wire up `App.jsx` with `BrowserRouter`, all routes, and both context providers
7. Add CSS variables for light/dark theme in `index.css`

**Done when:** `npm run dev` starts, routes render without crashing, Axios interceptor attaches the token.

---

## Phase 1 — Auth Pages + Navbar

**Goal:** Users can log in and register. Navbar reflects auth state.

**Steps:**
1. Build `AuthForm.jsx` — single component with a mode prop (`'login'` | `'register'`), form fields, and submit handler
2. Build `LoginPage.jsx` — calls `POST /api/auth/login`, saves token via `AuthContext.login()`, redirects to `/`
3. Build `RegisterPage.jsx` — calls `POST /api/auth/register`, then auto-logs in
4. Build `Navbar.jsx`:
   - Guest state: Login + Register links
   - Auth state: avatar, notification bell placeholder, messages icon, logout button
   - Admin state: extra Admin link (`role === 'admin'`)
5. Add `PrivateRoute` wrapper component — redirects to `/login` if not authenticated
6. Add `Toast.jsx` + `Spinner.jsx` shared components (used in all future phases)

**Done when:** Register → Login → see avatar in Navbar → Logout works end-to-end.

---

## Phase 2 — Home Page (Feed)

**Goal:** Logged-in users see a list of posts they can browse and sort.

**Steps:**
1. Build `PostCard.jsx` — title, author avatar, date, like count, comment count, link to `/posts/:id`
2. Build `SortBar.jsx` — "New" / "Popular" toggle buttons, updates query param
3. Build `Pagination.jsx` — previous / next / page numbers, reads `?page=N` from URL
4. Build `HomePage.jsx`:
   - Calls `GET /api/posts?sort=new&page=1`
   - Renders list of `PostCard` components
   - Wires up `SortBar` and `Pagination`
5. Add infinite scroll as an alternative to pagination on the feed:
   - `IntersectionObserver` watching a sentinel div at the bottom
   - Fetches next page and appends to the list
   - Shows `Spinner` while loading

**Done when:** Feed loads, sort switches work, pagination or infinite scroll navigates pages correctly.

---

## Phase 3 — Post Page

**Goal:** Users can read a full post, see comments, and interact.

**Steps:**
1. Build `PostContent.jsx` — renders `content` field via `react-markdown`
2. Build `LikeButton.jsx` — calls `POST/DELETE /api/posts/:id/like`, shows current count, optimistic update
3. Build `CommentForm.jsx` — textarea + submit, calls `POST /api/posts/:postId/comments`
4. Build `CommentList.jsx` — recursive component:
   - Renders a comment and its children (where `parent === comment._id`)
   - Each comment has its own reply button that opens an inline `CommentForm` with the `parent` field set
5. Build `PostPage.jsx`:
   - Fetches `GET /api/posts/:id` and `GET /api/posts/:id/comments`
   - Renders `PostContent`, `LikeButton`, `CommentList`, `CommentForm`
   - Shows Edit / Delete buttons if `user._id === post.author`

**Done when:** Post renders with Markdown, likes toggle correctly, comments thread visually with nesting.

---

## Phase 4 — Create / Edit Post

**Goal:** Logged-in users can write and edit posts.

**Steps:**
1. Build `MarkdownPreview.jsx` — side-by-side editor + `react-markdown` preview
2. Build `PostForm.jsx`:
   - Fields: title, category (select), tags (comma-separated input), Markdown body
   - Embeds `MarkdownPreview`
   - Submit calls `POST /api/posts` or `PUT /api/posts/:id` depending on mode
3. Build `CreatePostPage.jsx` — renders `PostForm` in create mode
4. Build `EditPostPage.jsx` — fetches existing post, renders `PostForm` pre-filled in edit mode

**Done when:** Create a post → appears in feed. Edit a post → changes persist.

---

## Phase 5 — User Profile Page

**Goal:** Any user's profile is viewable; own profile is editable.

**Steps:**
1. Build `ProfileHeader.jsx` — avatar, username, bio, follower count, Follow/Unfollow button
2. Build `PostList.jsx` — reusable list of `PostCard` filtered by a given `author` param
3. Build `ProfilePage.jsx`:
   - Fetches `GET /api/users/:id`
   - Fetches `GET /api/posts?author=:id`
   - Renders `ProfileHeader` + `PostList`
   - Shows Edit Profile form inline if viewing own profile (`user._id === params.id`)
   - Edit calls `PUT /api/users/:id` with `{ bio, avatar }`

**Done when:** Viewing own and other profiles works, follow button toggles, bio edits save.

---

## Phase 6 — Notifications

**Goal:** Users see real-time-like notifications in the Navbar bell.

**Steps:**
1. Build `NotificationItem.jsx` — type icon, message text, timestamp, read/unread indicator
2. Build `NotificationList.jsx` — dropdown list, "Mark all as read" button
3. Wire `NotificationBell.jsx` into `Navbar`:
   - Polls `GET /api/notifications` every 30 seconds (or on focus)
   - Shows badge with unread count
   - Clicking the bell opens `NotificationList` dropdown
4. Clicking a notification:
   - Calls `PUT /api/notifications/:id/read`
   - Navigates to the relevant post/profile
5. Add delete button per notification: `DELETE /api/notifications/:id`

**Done when:** Bell shows unread count, dropdown lists notifications, clicking marks as read.

---

## Phase 7 — Private Messages

**Goal:** Users can send and receive private messages.

**Steps:**
1. Build `ConversationList.jsx` — left panel, list of users I've chatted with, last message preview, unread indicator
2. Build `MessageThread.jsx` — right panel, chronological list of messages, auto-scrolls to bottom
3. Build `MessageInput.jsx` — text field + send button, calls `POST /api/messages/:userId`
4. Build `InboxPage.jsx`:
   - Fetches `GET /api/messages` for conversation list
   - On conversation select, fetches `GET /api/messages/:userId`
   - Renders `ConversationList` | `MessageThread` + `MessageInput` split layout
5. Add delete per message: `DELETE /api/messages/:id`

**Done when:** Two users can exchange messages, inbox updates on new messages.

---

## Phase 8 — Search

**Goal:** Users can search across all content with filters.

**Steps:**
1. Wire `SearchBar.jsx` into `Navbar` — on submit navigates to `/search?q=...`
2. Build `FilterPanel.jsx` — date range picker, category select, author text input; updates URL params
3. Build `SortSelect.jsx` — relevance / newest / oldest dropdown
4. Build `SearchPage.jsx`:
   - Reads `q`, `type`, `category`, `author`, `sort` from URL params
   - Three tabs: Posts / Comments / Users
   - Each tab calls the corresponding search endpoint
   - Results rendered with `PostCard` or user rows

**Done when:** Searching from Navbar shows results, filters narrow results correctly.

---

## Phase 9 — Admin Dashboard

**Goal:** Admin users can moderate content and view stats.

**Steps:**
1. Add admin-only guard: redirect non-admins away from `/admin`
2. Build `AdminDashboardPage.jsx` with four tabs:
   - **Reports** — fetches `GET /api/admin/reports`, lists each report with Delete post/comment and Dismiss buttons
   - **Users** — fetches `GET /api/users`, table with Block / Suspend action per row (`PUT /api/users/:id`)
   - **Activity Log** — fetches `GET /api/admin/logs`, chronological list
   - **Statistics** — fetches `GET /api/admin/stats`, displays count cards (users, posts, open reports)
3. Add Pagination to Reports and Users tabs

**Done when:** Admin can delete posts, block users, and see open reports from the dashboard.

---

## Phase 10 — Polish & UI/UX

**Goal:** Consistent, responsive, accessible UI across all pages.

**Steps:**
1. **Responsive Navbar** — hamburger menu collapses links below 768px
2. **Dark mode** — verify CSS variables cover all components, toggle in Navbar persists across refresh
3. **Loading states** — every page/component that fetches data shows `Spinner` or skeleton while pending; submit buttons disable and show "Loading..."
4. **Toast system** — `Toast.jsx` renders in a portal at top-right, auto-dismisses after 4s, red for errors / green for success; replace all `alert()` / `console.error()` calls
5. **404 page** — `NotFoundPage.jsx` with a "Go to Home" button, registered as `*` route
6. **Mobile pass** — manually verify each page at 375px width

**Done when:** All pages work on mobile, dark mode toggles cleanly, toasts appear on every success/error.

---

## Dependency Map

Each phase depends on the previous one being merged:

```
Phase 0 (setup)
  └── Phase 1 (auth + navbar)
        ├── Phase 2 (feed)
        │     └── Phase 3 (post page)
        │           └── Phase 4 (create/edit post)
        ├── Phase 5 (profile)
        ├── Phase 6 (notifications)
        ├── Phase 7 (messages)
        ├── Phase 8 (search)
        └── Phase 9 (admin)
                └── Phase 10 (polish — runs last)
```

Phases 5–9 can be worked on in parallel once Phase 1 is merged.
