# Forum Project — Group 4

פרויקט פורום אינטרנטי מבוסס React + Node.js + Express + MongoDB.

---

## Stack טכנולוגי

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | React |
| Backend | Node.js + Express |
| Database | MongoDB |
| Auth | JWT / Sessions (לבחירת הקבוצה) |

---

## מבנה תיקיות

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

## חלוקת משימות

### Person 1 — Backend Infrastructure + Auth + Users

אחראי על כל תשתית הבאקאנד והמשתמשים.

**הקמת פרויקט:**
- [ ] הקמת server/ (Express, MongoDB connection, middleware בסיסי)
- [ ] הגדרת GitHub Actions CI (build + lint + tests)

**Authentication:**
- [ ] `POST /api/auth/register` — הרשמה (username, email, password)
- [ ] `POST /api/auth/login` — התחברות
- [ ] `POST /api/auth/logout` — התנתקות
- [ ] Middleware לאימות (JWT / Sessions)

**Users:**
- [ ] `GET /api/users` — רשימת משתמשים
- [ ] `GET /api/users/:id` — פרופיל משתמש
- [ ] `PUT /api/users/:id` — עריכת פרופיל
- [ ] `DELETE /api/users/:id` — מחיקת חשבון
- [ ] העלאת תמונת פרופיל
- [ ] שינוי סיסמה
- [ ] שכחתי סיסמה
- [ ] עוקבים / נעקבים
- [ ] חסימת משתמשים
- [ ] סטטוס אונליין
- [ ] חיפוש משתמשים

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

אחראי על כל הלוגיקה של תוכן הפורום.

**Posts:**
- [ ] `GET /api/posts` — פיד פוסטים (עם מיון: חדש, פופולרי)
- [ ] `GET /api/posts/:id` — צפייה בפוסט
- [ ] `POST /api/posts` — יצירת פוסט
- [ ] `PUT /api/posts/:id` — עריכת פוסט
- [ ] `DELETE /api/posts/:id` — מחיקת פוסט
- [ ] פוסטים לפי משתמש / קטגוריה
- [ ] חיפוש פוסטים
- [ ] תמיכה ב-Markdown
- [ ] טיוטות
- [ ] פוסט מוצמד

**Comments:**
- [ ] `GET /api/posts/:id/comments` — תגובות לפוסט
- [ ] `POST /api/posts/:postId/comments` — הוספת תגובה
- [ ] `PUT /api/comments/:id` — עריכת תגובה
- [ ] `DELETE /api/comments/:id` — מחיקת תגובה
- [ ] תגובות מקוננות (nested — שדה parent)
- [ ] ציטוט תגובה

**Interactions:**
- [ ] `POST /api/posts/:id/like` — לייק לפוסט
- [ ] `DELETE /api/posts/:id/like` — ביטול לייק
- [ ] `POST /api/comments/:id/like` — לייק לתגובה
- [ ] `DELETE /api/comments/:id/like` — ביטול לייק
- [ ] שמירת פוסט למועדפים
- [ ] דיווח על פוסט / תגובה / משתמש

**Categories & Tags:**
- [ ] רשימת קטגוריות
- [ ] יצירת קטגוריה (admin)
- [ ] תגיות לפוסטים
- [ ] פוסטים לפי תגית
- [ ] תגיות פופולריות

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

אחראי על כל הפרונטאנד ועל פיצ'רים מתקדמים.

**הקמת Frontend:**
- [ ] הקמת client/ (React, routing, services/api.js)
- [ ] חיבור לכל ה-API endpoints

**Pages & Components:**
- [ ] דף בית (feed)
- [ ] דף התחברות / הרשמה
- [ ] דף פרופיל משתמש
- [ ] דף פוסט (עם תגובות)
- [ ] דף יצירת / עריכת פוסט
- [ ] דף 404
- [ ] ניווט (Navbar)

**Notifications:**
- [ ] התראה על תגובה חדשה
- [ ] התראה על לייק
- [ ] התראה על עוקב חדש
- [ ] התראה על אזכור (@username)
- [ ] סימון התראה כנקראה
- [ ] מחיקת התראות

**Private Messages:**
- [ ] שליחת הודעה פרטית
- [ ] תיבת הודעות (inbox)
- [ ] שיחה בין משתמשים
- [ ] מחיקת הודעה

**Moderation (Admin):**
- [ ] מחיקת פוסט / תגובה של משתמש אחר
- [ ] חסימה / השעיית משתמש
- [ ] צפייה בדיווחים
- [ ] לוג פעולות + סטטיסטיקות

**Search UI:**
- [ ] חיפוש גלובלי (פוסטים, תגובות, משתמשים)
- [ ] פילטרים (תאריך, קטגוריה, מחבר)
- [ ] מיון תוצאות

**UI/UX:**
- [ ] Pagination
- [ ] Infinite scroll
- [ ] Dark mode
- [ ] רספונסיביות (mobile-friendly)
- [ ] Loading states
- [ ] הודעות שגיאה / הצלחה

---

## חוקי המשחק (Reverse CTF)

- כל פיצ'ר = **PR נפרד**
- CI חייב לעבור לפני Merge (build + lint + tests)
- קבוצה אחרת עושה **Code Review** על הקוד שלנו
- אנחנו עושים **Code Review** על קבוצה אחרת
- **מטמינים באגים** — מתועדים בקובץ סודי (לא מועלה ל-GitHub)

### ניקוד
| פעולה | נקודות |
|--------|--------|
| באג שהכנסנו ועבר Review | 2 |
| באג שמצאנו אצל הקבוצה השנייה | 2 |
| בונוס יצירתיות | 1 |

---

## API — סיכום Endpoints

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
