# 🚀 Cipher Studio

> A online code editor and IDE built with Next.js and Node.js. Create, edit, and manage your web development projects in the browser with real-time preview and Monaco Editor integration.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://studio.iamabhinav.dev)
[![Backend API](https://img.shields.io/badge/API-live-blue)](https://studio.koyeb.app)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [About](#-about)

## ✨ Features

### Frontend Features
- 🎨 **Monaco Editor Integration** - Full-featured code editor with syntax highlighting
- 📁 **File Tree Explorer** - Visual file management with nested folder support
- 👁️ **Live Preview** - Real-time preview of your HTML/CSS/JavaScript projects
- 🌙 **Dark/Light Theme** - Theme switcher with system preference detection
- 💾 **Auto-save** - Automatic project saving with debouncing
- 📥 **Download Projects** - Export projects as ZIP files
- 🔐 **Authentication** - Secure user authentication with JWT
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **Fast Performance** - Built with Next.js 15 and React 19

### Backend Features
- 🔒 **Secure Authentication** - JWT-based auth with HTTP-only cookies
- 👤 **User Management** - Complete user registration and login system
- 📦 **Project Management** - CRUD operations for projects
- 🛡️ **Rate Limiting** - Protection against abuse
- 📝 **Request Logging** - Winston-based logging system
- ⚠️ **Error Handling** - Centralized error handling middleware
- 🔄 **Token Refresh** - Automatic token refresh mechanism
- 🗄️ **MongoDB Integration** - Mongoose ODM for data persistence

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with Turbopack
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/)
- **Icons**: [Heroicons](https://heroicons.com/), [React Icons](https://react-icons.github.io/react-icons/)
- **Code Formatting**: [Biome](https://biomejs.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JWT](https://jwt.io/) with [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Logging**: [Winston](https://github.com/winstonjs/winston), [Morgan](https://github.com/expressjs/morgan)
- **Validation**: [Zod](https://zod.dev/)
- **Security**: [CORS](https://www.npmjs.com/package/cors), [Cookie Parser](https://www.npmjs.com/package/cookie-parser)
- **Rate Limiting**: [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)


## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB database (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rishiyaduwanshi/cipherstudio.git
   cd cipherstudio
   ```

2. **Install Frontend Dependencies**
   ```bash
   pnpm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   pnpm install
   ```

### Running Locally

#### Frontend Development Server

```bash
# In the root directory
pnpm dev
```

The frontend will be available at `http://localhost:3000`

#### Backend Development Server

```bash
# In the server directory
cd server
pnpm dev
```

The backend API will be available at `http://localhost:5000` (or your configured port)

### Building for Production

#### Frontend

```bash
pnpm build
pnpm start
```

#### Backend

```bash
cd server
pnpm pro
```

## 📚 API Documentation

Complete API documentation is available in the [`server/API_DOCS.md`](./server/API_DOCS.md) file.

### Base URL

- **Production**: `https://studio.koyeb.app`
- **Local Development**: `http://localhost:5000`

### Quick Overview

#### Authentication Endpoints
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/signin` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/signout` - Logout user

#### Project Endpoints (Protected)
- `GET /api/v1/projects` - Get all user projects
- `GET /api/v1/projects/:id` - Get specific project
- `POST /api/v1/projects` - Create new project
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

**Note**: All API requests require credentials (HTTP-only cookies) for authentication.

For detailed request/response formats and examples, see [API_DOCS.md](./server/API_DOCS.md).

## 🌐 Deployment

### Live URLs

- **Frontend**: [https://studio.iamabhinav.dev](https://studio.iamabhinav.dev)
- **Backend API**: [https://studio.koyeb.app](https://studio.koyeb.app)

### Deployment Platforms

- **Frontend**: Deployed on Vercel/Netlify
- **Backend**: Deployed on Koyeb
- **Database**: MongoDB Atlas

## 🔐 Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://studio.koyeb.app
```

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=production
VERSION=1.0.0

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=https://studio.iamabhinav.dev

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```


### Links

- **Portfolio**: [iamabhinav.dev](https://iamabhinav.dev)
- **Blog**: [blog.iamabhinav.dev](https://blog.iamabhinav.dev)
- **Mail**: [hello@iamabhinav.dev](mailto:hello@iamabhinav.dev)
- **GitHub**: [@rishiyaduwanshi](https://github.com/rishiyaduwanshi)

- 🌐 **Frontend**: [studio.iamabhinav.dev](https://studio.iamabhinav.dev)
- 🔧 **Backend**: [studio.koyeb.app](https://studio.koyeb.app)
- 📖 **API Documentation**: [API_DOCS.md](./server/API_DOCS.md)
