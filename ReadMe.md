# 🌌 Nova — Social Media Platform

**Connect. Share. Inspire.**

A full-stack social media platform — Node.js REST API + vanilla JS frontend.

</div>

---

## ✨ Features

- 🔐 **Auth** — register, email verification (Mailjet), login with JWT, forgot/reset password
- 👤 **Profiles** — bio, profile pictures, edit profile, user search
- 📸 **Posts** — image & video uploads, personalized feed (follow-based), captions, post search
- 💬 **Social** — comments, likes, follow/unfollow, block/unblock (mutual visibility rules)
- 🔔 **Notifications** — follow/like/comment triggers, unread badge, mark as read
- 🛡️ **Admin panel** — moderate posts & comments, deactivate/restore users (soft delete), create admins
- 🚫 **Privacy by design** — blocked & deactivated users disappear from feeds, lists, and search automatically

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js · Express 5 · Sequelize 6 · PostgreSQL |
| **Auth & Security** | JWT · bcrypt · Helmet · CORS · express-rate-limit |
| **Validation** | Zod (env + request schemas) |
| **Uploads & Email** | Multer · Mailjet |
| **Frontend** | HTML5 · CSS3 · JavaScript · jQuery · AJAX |

## 🏗️ Architecture

```
Routes → Controllers → Services → Models → PostgreSQL
```

- 🧩 Clean layered design — validation, business logic, and data access fully separated
- 🔁 Shared single-source helpers (block checks, notifications, user sanitization)
- 🗑️ Soft delete via Sequelize paranoid mode — restore brings a user's entire footprint back
- 🎭 Role separation — admins moderate but have **no social presence** (can't post, follow, or appear in searches)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
npm install

# configure environment
cp .env.example .env        # then fill in your values

# database
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all   # seeds the first admin

npm run dev
```

API runs at `http://localhost:3000` 🚀

### Frontend

Serve the `frontend/` folder with any static server (e.g. VS Code **Live Server**), then open `index.html`.


## 📡 API Overview

| Area | Endpoints |
|---|---|
| 🔐 Auth | register · verify-email · login · forgot/reset password |
| 👤 Users | profile · search · follow · block · followers/following |
| 📸 Posts | create · feed · search · update caption · delete |
| 💬 Comments | create · list · update · delete |
| ❤️ Likes | like · unlike · who liked |
| 🔔 Notifications | list · unread count · mark read |
| 🛡️ Admin | deactivate/restore users · remove posts/comments · create admin |

## 👩‍💻 Author

**Remah** — CS graduate & backend developer (ASP.NET Core → Node.js)

Built as a learning project during a **Code Alpha** internship — every endpoint designed and implemented from scratch.

🔗 [LinkedIn](https://www.linkedin.com/in/remah-shayya-415889359/)

---

<div align="center">⭐ If you find this project useful, a star is appreciated!</div>