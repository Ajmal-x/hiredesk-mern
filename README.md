# HireDesk

**HireDesk** is a modern full-stack job platform built with React, TypeScript, Node.js, Express, and MongoDB.

It connects candidates with recruiters through a clean workflow for discovering jobs, applying, managing applications, posting jobs, and reviewing candidates.

## ✨ Features

### For Candidates

* Browse and search jobs
* Filter jobs by type, location, work mode, and skills
* View detailed job information
* Save and unsave jobs
* Apply with a resume and cover letter
* Track application status and history
* Withdraw applications when allowed
* Manage profile and resume
* Receive application notifications

### For Recruiters

* Recruiter dashboard with hiring statistics
* Create, edit, close, and delete jobs
* Manage posted jobs
* View applicants for each job
* Review candidate resumes and cover letters
* Update application statuses
* Track hiring pipeline
* Receive notifications when candidates apply

## 🛠 Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Lucide React

### Backend

* Node.js
* Express
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* Multer

### Database

* MongoDB Atlas

## 📁 Project Structure

```text
hiredesk-mern/
├── client/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── context/
│       └── lib/
│
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── index.ts
│
├── package.json
├── README.md
└── .gitignore
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Ajmal-x/hiredesk-mern.git
cd hiredesk-mern
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create the required environment files for the backend and frontend.

Example backend configuration:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
MAX_UPLOAD_MB=5
```

Never commit `.env` files or production secrets to GitHub.

### 4. Start the application

```bash
npm run dev
```

The development environment runs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:4000
```

## 🔐 Authentication

HireDesk supports two main user roles:

* **Candidate** — search and apply for jobs
* **Recruiter** — create jobs and manage applicants

Authentication is handled through JWT-based authentication.

## 🔄 Application Workflow

```text
Candidate
   ↓
Browse Jobs
   ↓
View Job
   ↓
Apply
   ↓
Application stored in MongoDB
   ↓
Recruiter receives notification
   ↓
Recruiter reviews application
   ↓
Application status updated
```

## 🔔 Notifications

HireDesk includes a lightweight notification system for important application events.

Currently supported:

* New application notifications
* Read/unread notifications
* Mark all as read
* Delete notifications
* Notification links to relevant pages

## 📄 Resume Management

Candidates can:

* Upload a PDF or Word resume
* Replace an existing resume
* View their uploaded resume
* Delete their resume

Maximum upload size is configurable through the backend environment variables.

## 📡 API Overview

Main API resources include:

```text
/api/auth
/api/jobs
/api/applications
/api/stats
/api/notifications
```

The backend also provides a health endpoint:

```text
/api/health
```

## 🧪 Development

Run the development environment:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run the production server:

```bash
npm start
```

## 🌍 Deployment

The application is designed to work with:

* **MongoDB Atlas** — database
* **Render / Railway** — backend API
* **Vercel** — frontend

Production environment variables should be configured directly in the hosting provider and should never be committed to the repository.

## 🔒 Security

The project includes:

* JWT authentication
* Password hashing
* Role-based authorization
* HTTP security headers
* CORS configuration
* API rate limiting
* File type validation
* Upload size limits
* Environment-based configuration

## 🎯 Project Goals

HireDesk is designed as a practical full-stack project demonstrating:

* Modern React development
* TypeScript application architecture
* REST API development
* MongoDB data modeling
* Authentication and authorization
* File uploads
* Real-world application workflows
* Responsive UI development
* Full-stack deployment

## 👨‍💻 Author

**Ajmal Ahmadi**

Full-Stack Developer

GitHub: https://github.com/Ajmal-x

## 📄 License

This project is licensed under the MIT License.
