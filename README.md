# 🚀 TaskBridge — Team Task Management Web App

A full-stack collaborative task management system built using the **MERN stack**.  
It allows teams to manage projects, assign tasks, and track progress with **role-based access control (RBAC)**.

---

## 📌 Features

### 🔐 Authentication
- User Signup & Login (JWT based authentication)
- Access + Refresh Tokens
- Password hashing using bcrypt
- Protected routes (frontend + backend)

---

### 📁 Project Management
- Create projects (creator becomes **Admin**)
- Add/remove members
- Role-based access (**Admin / Member**)
- Multiple members per project

---

### ✅ Task Management
- Create tasks with:
  - Title, Description
  - Due Date, Priority
  - Status (To Do / In Progress / Done)
- Assign tasks to project members
- **Admin**:
  - Full control (create, edit, delete, assign)
  - Cannot update task status
- **Member**:
  - Can only update status of assigned tasks

---

### 📊 Dashboard (Project-Based)
- Project-wise dashboard (no data mixing)
- **Admin View**:
  - Total tasks, completed, overdue
  - Project progress
  - Task distribution charts
  - Team performance
- **Member View**:
  - Only assigned tasks
  - Personal progress (**My Task Progress**)
  - Status & priority insights

---

### 🔄 Project Switcher
- Switch between projects from dashboard
- Dashboard updates dynamically per project

---

### 🎯 Role-Based Access Control (RBAC)

| Action                          | Admin | Member |
|--------------------------------|-------|--------|
| Create Project                 | ✅    | ✅     |
| Add/Remove Members            | ✅    | ❌     |
| Create Task                   | ✅    | ❌     |
| Edit Task (except status)     | ✅    | ❌     |
| Delete Task                   | ✅    | ❌     |
| Assign Task                   | ✅    | ❌     |
| Update Task Status            | ❌    | ✅     |
| View Project                  | ✅    | ✅     |

---

## 🏗️ Tech Stack

| Layer              | Technology                     |
|-------------------|--------------------------------|
| Frontend          | React (Vite) + Tailwind CSS   |
| Backend           | Node.js + Express             |
| Database          | MongoDB (Mongoose)            |
| Authentication    | JWT (Access + Refresh Tokens) |
| State Management  | Redux + Context API           |

---

## 📂 Project Structure
```
TaskBridge/
├── backend/
│ ├── server.js
│ └── src/
│ ├── config/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ └── validators/
│
└── frontend/
└── src/
├── api/
├── components/
├── context/
├── redux/
└── pages/
```

---

## 🗄️ Database Schema

### 👤 User
- name
- email
- password (hashed)
- avatar
- refreshToken

---

### 📁 Project
- name
- description
- creator (User)
- members:
  - user (ref)
  - role (admin / member)

---

### ✅ Task
- title
- description
- priority (low / medium / high)
- status (todo / inprogress / done)
- dueDate
- project (ref)
- assignedTo (User)
- createdBy (User)

---

## 🔗 API Endpoints

### 🔐 Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

---

### 📁 Projects
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`

---

### ✅ Tasks
- `GET /api/projects/:id/tasks`
- `POST /api/projects/:id/tasks`
- `PUT /api/projects/:id/tasks/:taskId`
- `DELETE /api/projects/:id/tasks/:taskId`

---

### 📊 Dashboard
- `GET /api/dashboard` (global - optional)
- `GET /api/dashboard/project/:projectId` ✅ (recommended)

---

## ⚙️ Local Setup

### 🔹 Backend

```bash
cd backend
npm install
npm run dev
```
### 🔹 Frontend

```bash
cd frontend
npm install
npm run dev
```
---

## (.env)
```bash
PORT=your_port
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=your_client_url
```
---

## 🎨 UI/UX Highlights

- Clean dashboard layout  
- Project-based analytics  
- Responsive design  
- Role-based UI rendering  
- Modal-based interactions  
- Kanban-style task view  

---

## 🚀 Future Improvements

- Real-time updates (WebSockets)  
- Notifications system  
- File attachments in tasks  
- Activity logs  
- Dark mode  

---

## 💡 Key Learnings

- Role-Based Access Control (RBAC)  
- Scalable backend architecture  
- State management with Redux + Context  
- API design & separation of concerns  
- Real-world product thinking  

---

## 💬 Author

**Samiksha Jain**
