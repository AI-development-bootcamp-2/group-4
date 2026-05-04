# Spec — Person 3: Frontend + Notifications + Messages + Admin + UI/UX

---

## 1. Project Setup

### 1.1 Initialize React Client
- Create `client/` folder with Vite + React
- Set up React Router for client-side routing
- Create `client/src/services/api.js` — a centralized Axios instance pointing to `http://localhost:5000/api`
- Store auth token in localStorage and attach it to every request via an Axios interceptor

**Routes:**
| Path | Component |
|------|-----------|
| `/` | HomePage |
| `/login` | LoginPage |
| `/register` | RegisterPage |
| `/profile/:id` | ProfilePage |
| `/posts/:id` | PostPage |
| `/posts/new` | CreatePostPage |
| `/posts/:id/edit` | EditPostPage |
| `/messages` | InboxPage |
| `/admin` | AdminDashboardPage |
| `*` | NotFoundPage |

---

## 2. Pages & Components

### 2.1 Home Page (Feed)
**What it shows:** A list of all posts, sorted by newest by default.

**User stories:**
- As a user, I can see a feed of posts with title, author, date, and like count
- As a user, I can switch between "New" and "Popular" sorting
- As a user, I can click a post to go to the post page
- As a user, I can navigate between pages (pagination)

**Components:**
- `PostCard` — displays title, author avatar, date, like count, comment count
- `SortBar` — buttons for "New" / "Popular"
- `Pagination` — previous / next / page numbers

**API calls:**
```
GET /api/posts?sort=new&page=1
GET /api/posts?sort=popular&page=1
```

---

### 2.2 Login / Register Page
**User stories:**
- As a guest, I can register with username, email, and password
- As a guest, I can log in with email and password
- As a user, I am redirected to the home page after login
- As a user, I see a clear error message if credentials are wrong

**Components:**
- `AuthForm` — shared form with toggle between login/register mode

**API calls:**
```
POST /api/auth/register  { username, email, password }
POST /api/auth/login     { email, password }
```

---

### 2.3 User Profile Page
**User stories:**
- As a user, I can view any user's profile (avatar, bio, post count)
- As a user, I can see all posts written by that user
- As a logged-in user, I can edit my own profile (bio, avatar)
- As a logged-in user, I can follow / unfollow a user

**Components:**
- `ProfileHeader` — avatar, username, bio, follow button
- `PostList` — reusable list of PostCards filtered by user

**API calls:**
```
GET /api/users/:id
PUT /api/users/:id  { bio, avatar }
GET /api/posts?author=:id
```

---

### 2.4 Post Page
**User stories:**
- As a user, I can read a full post with Markdown rendered
- As a user, I can see all comments (including nested replies)
- As a logged-in user, I can like / unlike the post
- As a logged-in user, I can add a comment
- As the post author, I can edit or delete the post

**Components:**
- `PostContent` — renders Markdown content
- `LikeButton` — toggles like, shows count
- `CommentList` — recursive component for nested comments
- `CommentForm` — textarea + submit button

**API calls:**
```
GET  /api/posts/:id
GET  /api/posts/:id/comments
POST /api/posts/:postId/comments  { content }
POST /api/posts/:id/like
DELETE /api/posts/:id/like
```

---

### 2.5 Create / Edit Post Page
**User stories:**
- As a logged-in user, I can write a post with a title and Markdown body
- As a logged-in user, I can select a category and add tags
- As a logged-in user, I can preview the Markdown before submitting
- As the post author, I can edit an existing post

**Components:**
- `PostForm` — title input, category select, tags input, Markdown editor
- `MarkdownPreview` — live preview panel

**API calls:**
```
POST /api/posts          { title, content, category, tags }
PUT  /api/posts/:id      { title, content, category, tags }
```

---

### 2.6 Navbar
**What it shows:** Always visible at the top of every page.

**User stories:**
- As a guest, I see Login and Register links
- As a logged-in user, I see my avatar, a notifications bell, a messages icon, and a logout button
- As an admin, I see an extra Admin link

**Components:**
- `Navbar`
- `NotificationBell` — badge with unread count, dropdown on click

---

### 2.7 404 Page
- Displayed on any unknown route
- Contains a "Go to Home" button

---

## 3. Notifications

**User stories:**
- As a user, I receive a notification when someone comments on my post
- As a user, I receive a notification when someone likes my post
- As a user, I receive a notification when someone follows me
- As a user, I receive a notification when someone mentions me (@username)
- As a user, I can mark a notification as read
- As a user, I can delete a notification

**Components:**
- `NotificationList` — dropdown list inside the bell icon
- `NotificationItem` — single notification row with type icon, text, timestamp, read/unread state

**API calls:**
```
GET    /api/notifications
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id
```

**Notification types:**
| Type | Message template |
|------|-----------------|
| comment | "[username] commented on your post" |
| like | "[username] liked your post" |
| follow | "[username] started following you" |
| mention | "[username] mentioned you in a post" |

---

## 4. Private Messages

**User stories:**
- As a user, I can send a private message to another user
- As a user, I can see my inbox with all conversations
- As a user, I can open a conversation and see the full message history
- As a user, I can delete a message

**Pages:**
- `InboxPage` — list of conversations on the left, active conversation on the right

**Components:**
- `ConversationList` — list of users I have talked to, with last message preview
- `MessageThread` — scrollable list of messages in a conversation
- `MessageInput` — text field + send button

**API calls:**
```
GET    /api/messages
GET    /api/messages/:userId
POST   /api/messages/:userId  { content }
DELETE /api/messages/:id
```

---

## 5. Moderation (Admin)

**Access:** Only visible to users with `role === 'admin'`.

**User stories:**
- As an admin, I can delete any post or comment
- As an admin, I can block or suspend any user
- As an admin, I can view all reported content (posts, comments, users)
- As an admin, I can see an activity log of moderation actions
- As an admin, I can see basic statistics (total users, posts, reports)

**Page:** `AdminDashboardPage` with tabs:

| Tab | Content |
|-----|---------|
| Reports | List of reported posts/comments/users with action buttons |
| Users | Table of all users with block/suspend actions |
| Activity Log | Chronological list of admin actions |
| Statistics | Cards showing total counts |

**API calls:**
```
GET    /api/admin/reports
DELETE /api/posts/:id          (admin override)
DELETE /api/comments/:id       (admin override)
PUT    /api/users/:id          { status: 'blocked' | 'suspended' }
GET    /api/admin/logs
GET    /api/admin/stats
```

---

## 6. Search UI

**User stories:**
- As a user, I can type a query and search across posts, comments, and users simultaneously
- As a user, I can filter results by date range, category, and author
- As a user, I can sort results by relevance or date

**Components:**
- `SearchBar` — input in the Navbar, navigates to `/search?q=...`
- `SearchPage` — tabs for Posts / Comments / Users results
- `FilterPanel` — date picker, category select, author input
- `SortSelect` — relevance / newest / oldest

**API calls:**
```
GET /api/search?q=:query&type=posts&category=:cat&author=:id&sort=newest
GET /api/search?q=:query&type=comments
GET /api/search?q=:query&type=users
```

---

## 7. UI/UX Requirements

### 7.1 Pagination
- Available on: Home feed, profile posts, search results, admin tables
- Shows page numbers, previous/next buttons
- Query param: `?page=N`

### 7.2 Infinite Scroll (alternative to pagination on feed)
- Triggered when user scrolls to within 200px of the bottom
- Appends next page of posts to the existing list
- Shows a spinner while loading

### 7.3 Dark Mode
- Toggle button in the Navbar
- Preference saved in localStorage
- Applied via a `data-theme="dark"` attribute on `<body>` + CSS variables

### 7.4 Responsive Design
- Mobile breakpoint: 768px
- Navbar collapses to a hamburger menu on mobile
- All pages are usable on a 375px screen

### 7.5 Loading States
- Every API call shows a spinner or skeleton while pending
- Buttons are disabled and show "Loading..." while submitting a form

### 7.6 Error / Success Messages
- Displayed as a toast notification (top-right corner)
- Auto-dismiss after 4 seconds
- Error toasts: red, Success toasts: green

---

## 8. Component File Structure

```
client/src/
├── components/
│   ├── Navbar.jsx
│   ├── PostCard.jsx
│   ├── PostForm.jsx
│   ├── CommentList.jsx
│   ├── CommentForm.jsx
│   ├── LikeButton.jsx
│   ├── NotificationBell.jsx
│   ├── NotificationItem.jsx
│   ├── ConversationList.jsx
│   ├── MessageThread.jsx
│   ├── MessageInput.jsx
│   ├── SearchBar.jsx
│   ├── FilterPanel.jsx
│   ├── Pagination.jsx
│   ├── Toast.jsx
│   └── Spinner.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ProfilePage.jsx
│   ├── PostPage.jsx
│   ├── CreatePostPage.jsx
│   ├── EditPostPage.jsx
│   ├── InboxPage.jsx
│   ├── SearchPage.jsx
│   ├── AdminDashboardPage.jsx
│   └── NotFoundPage.jsx
├── services/
│   └── api.js           # Axios instance + all API functions
├── context/
│   ├── AuthContext.jsx  # current user, login/logout
│   └── ThemeContext.jsx # dark/light mode
└── App.jsx
```
