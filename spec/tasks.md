# Tasks — Person 3

Based on `spec/plan.md`. Each task = one PR.

---

- [x] **Task 1 — Project Setup**
  Scaffold Vite + React, install dependencies (react-router-dom, axios, react-markdown), create `services/api.js` with Axios interceptor, create `AuthContext.jsx` and `ThemeContext.jsx`, wire up `App.jsx` with all routes and providers, add CSS variables for light/dark theme.

- [x] **Task 2 — Auth Pages + Navbar**
  Build `AuthForm.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`, `Navbar.jsx` (guest / auth / admin states), `PrivateRoute` wrapper, shared `Toast.jsx` and `Spinner.jsx` components.

- [x] **Task 3 — Home Page (Feed)**
  Build `PostCard.jsx`, `SortBar.jsx`, `Pagination.jsx`, `HomePage.jsx` with feed fetching, sort toggle, and infinite scroll via `IntersectionObserver`.

- [ ] **Task 4 — Post Page**
  Build `PostContent.jsx` (react-markdown), `LikeButton.jsx` with optimistic update, `CommentForm.jsx`, recursive `CommentList.jsx` for nested comments, `PostPage.jsx` with edit/delete buttons for post author.

- [ ] **Task 5 — Create / Edit Post**
  Build `MarkdownPreview.jsx`, `PostForm.jsx` with title/category/tags/body fields, `CreatePostPage.jsx`, `EditPostPage.jsx` pre-filled with existing post data.

- [ ] **Task 6 — User Profile Page**
  Build `ProfileHeader.jsx` with follow/unfollow button, reusable `PostList.jsx`, `ProfilePage.jsx` with inline edit form for own profile.

- [ ] **Task 7 — Notifications**
  Build `NotificationItem.jsx`, `NotificationList.jsx`, wire `NotificationBell.jsx` into Navbar with 30s polling, mark-as-read on click, delete per notification.

- [ ] **Task 8 — Private Messages**
  Build `ConversationList.jsx`, `MessageThread.jsx`, `MessageInput.jsx`, `InboxPage.jsx` with split layout (conversations left, thread right).

- [ ] **Task 9 — Search**
  Build `SearchBar.jsx` in Navbar, `FilterPanel.jsx`, `SortSelect.jsx`, `SearchPage.jsx` with Posts / Comments / Users tabs reading URL params.

- [ ] **Task 10 — Admin Dashboard + Polish**
  Build `AdminDashboardPage.jsx` with Reports / Users / Activity Log / Statistics tabs, add admin-only route guard. Then: responsive Navbar hamburger menu, dark mode verification, loading skeletons, toast system across all pages, `NotFoundPage.jsx`.
