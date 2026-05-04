# Forum Project — Group 4

An internet forum built with React + Node.js + Express + MongoDB.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Backend | Node.js + Express |
| Database | MongoDB |
| Auth | JWT / Sessions |

---

## Folder Structure

```
forum-project/
├── client/               # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/     # API calls
│   │   └── App.jsx
│   └── package.json
├── server/               # Backend (Node.js + Express)
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   └── index.js
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
└── README.md
```

---

## Task Division

### Person 1 — Backend Infrastructure + Auth + Users

Responsible for all backend infrastructure and user management.

**Project Setup:**
- [ ] Set up server/ (Express, MongoDB connection, basic middleware)
- [ ] Configure GitHub Actions CI (build + lint + tests)

**Authentication:**
- [ ] `POST /api/auth/register` — Register (username, email, password)
- [ ] `POST /api/auth/login` — Login
- [ ] `POST /api/auth/logout` — Logout
- [ ] Auth middleware (JWT / Sessions)

**Users:**
- [ ] `GET /api/users` — List users
- [ ] `GET /api/users/:id` — User profile
- [ ] `PUT /api/users/:id` — Edit profile
- [ ] `DELETE /api/users/:id` — Delete account
- [ ] Profile picture upload
- [ ] Change password
- [ ] Forgot password
- [ ] Followers / Following
- [ ] Block users
- [ ] Online status
- [ ] Search users

**Model:**
```js
User {
  _id, username, email, password, // hashed
  avatar, bio, role, // 'user' | 'admin' | 'moderator'
  createdAt, updatedAt
}
```

---

### Person 2 — Posts + Comments + Interactions + Categories

Responsible for all forum content logic.

**Posts:**
- [ ] `GET /api/posts` — Post feed (with sorting: new, popular)
- [ ] `GET /api/posts/:id` — View post
- [ ] `POST /api/posts` — Create post
- [ ] `PUT /api/posts/:id` — Edit post
- [ ] `DELETE /api/posts/:id` — Delete post
- [ ] Posts by user / category
- [ ] Search posts
- [ ] Markdown support
- [ ] Drafts
- [ ] Pinned post

**Comments:**
- [ ] `GET /api/posts/:id/comments` — Get post comments
- [ ] `POST /api/posts/:postId/comments` — Add comment
- [ ] `PUT /api/comments/:id` — Edit comment
- [ ] `DELETE /api/comments/:id` — Delete comment
- [ ] Nested comments (parent field)
- [ ] Quote comment

**Interactions:**
- [ ] `POST /api/posts/:id/like` — Like post
- [ ] `DELETE /api/posts/:id/like` — Unlike post
- [ ] `POST /api/comments/:id/like` — Like comment
- [ ] `DELETE /api/comments/:id/like` — Unlike comment
- [ ] Save post to favorites
- [ ] Report post / comment / user

**Categories & Tags:**
- [ ] List categories
- [ ] Create category (admin only)
- [ ] Post tags
- [ ] Posts by tag
- [ ] Popular tags

**Models:**
```js
Post {
  _id, title, content, author, // ref: User
  category, tags, likes, // ref: User[]
  createdAt, updatedAt
}

Comment {
  _id, content, author, // ref: User
  post, // ref: Post
  parent, // ref: Comment (nested)
  likes, // ref: User[]
  createdAt, updatedAt
}
```

---

### Person 3 — Frontend + Notifications + Messages + Admin + UI/UX

Responsible for all frontend and advanced features.

**Frontend Setup:**
- [ ] Set up client/ (React, routing, services/api.js)
- [ ] Connect to all API endpoints

**Pages & Components:**
- [ ] Home page (feed)
- [ ] Login / Register page
- [ ] User profile page
- [ ] Post page (with comments)
- [ ] Create / Edit post page
- [ ] 404 page
- [ ] Navigation (Navbar)

**Notifications:**
- [ ] Notification on new comment
- [ ] Notification on like
- [ ] Notification on new follower
- [ ] Notification on mention (@username)
- [ ] Mark notification as read
- [ ] Delete notifications

**Private Messages:**
- [ ] Send private message
- [ ] Inbox
- [ ] Conversation between users
- [ ] Delete message

**Moderation (Admin):**
- [ ] Delete another user's post / comment
- [ ] Block / suspend user
- [ ] View reports
- [ ] Activity log + statistics

**Search UI:**
- [ ] Global search (posts, comments, users)
- [ ] Filters (date, category, author)
- [ ] Sort results

**UI/UX:**
- [ ] Pagination
- [ ] Infinite scroll
- [ ] Dark mode
- [ ] Responsive design (mobile-friendly)
- [ ] Loading states
- [ ] Error / success messages

---

## Game Rules (Reverse CTF)

- Every feature = **separate PR**
- CI must pass before merge (build + lint + tests)
- Another group does **Code Review** on our code
- We do **Code Review** on another group's code
- **Plant bugs** — documented in a secret file (not pushed to GitHub)

### Scoring
| Action | Points |
|--------|--------|
| Bug planted that passed Review | 2 |
| Bug found in the other group's code | 2 |
| Creativity bonus | 1 |

---

## API — Endpoints Summary

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
GET    /api/posts/:id/comments

POST   /api/posts/:postId/comments
PUT    /api/comments/:id
DELETE /api/comments/:id

POST   /api/posts/:id/like
DELETE /api/posts/:id/like
POST   /api/comments/:id/like
DELETE /api/comments/:id/like
```
