# Internship Management REST API

A full-stack internship management application built with **Node.js, Express.js, SQLite, HTML5, CSS3, and JavaScript**.

This project provides a responsive internship discovery interface connected to a REST API with persistent data storage, CRUD operations, input validation, pagination, search, and filtering.

## 🚀 Features

### Frontend

* Responsive internship listing interface
* Search internships by keyword
* Filter internships by domain
* Filter internships by work mode
* Display internship details, skills, location, and openings
* Add new internships
* Edit existing internships
* Delete internships
* Loading, empty, and error states
* Responsive design for desktop, tablet, and mobile

### Backend

* RESTful API built with Express.js
* SQLite persistent database
* Complete CRUD operations
* Input validation
* Pagination support
* Consistent JSON response format
* Appropriate HTTP status codes
* Duplicate internship-code validation
* CORS support

## 🛠️ Technology Stack

| Technology | Purpose                 |
| ---------- | ----------------------- |
| HTML5      | Frontend structure      |
| CSS3       | Responsive styling      |
| JavaScript | Frontend functionality  |
| Node.js    | Backend runtime         |
| Express.js | REST API                |
| SQLite     | Persistent data storage |
| CORS       | API request handling    |

## 📁 Project Structure

```text
task3/
│
├── backend/
│   ├── data/
│   │   └── internships.json
│   ├── database/
│   │   └── internship.db
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── screenshots/
│   ├── 01-home.png
│   ├── 02-search-filter.png
│   ├── 03-add-internship.png
│   └── 04-api-response.png
│
├── .gitignore
└── README.md
```

> `node_modules/` and generated database files should not be committed to the repository.

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd task3/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Seed the database

```bash
npm run seed
```

### 4. Start the server

```bash
npm start
```

The application will run at:

```text
http://localhost:3000
```

Open the URL in a browser to access the internship interface.

## 🔌 API Endpoints

### Health Check

```http
GET /
```

### Get All Internships

```http
GET /api/internships
```

### Get Paginated Internships

```http
GET /api/internships?page=1&limit=5
```

### Get Internship by ID

```http
GET /api/internships/:id
```

### Create Internship

```http
POST /api/internships
```

Example request:

```json
{
  "code": "INT-106",
  "title": "Cloud Engineer Intern",
  "domain": "Cloud Computing",
  "mode": "Remote",
  "location": "Pune",
  "skills": ["AWS", "Linux", "Docker"],
  "openings": 2
}
```

### Update Internship

```http
PUT /api/internships/:id
```

### Delete Internship

```http
DELETE /api/internships/:id
```

## 📋 Internship Data Model

Each internship record contains:

| Field        | Description                  |
| ------------ | ---------------------------- |
| `id`         | Unique database identifier   |
| `code`       | Unique internship code       |
| `title`      | Internship title             |
| `domain`     | Internship domain            |
| `mode`       | Remote, Hybrid, or On-site   |
| `location`   | Internship location          |
| `skills`     | Required skills              |
| `openings`   | Number of available openings |
| `created_at` | Record creation timestamp    |
| `updated_at` | Last update timestamp        |

Supported work modes:

```text
Remote
Hybrid
On-site
```

## ✅ Input Validation

The API validates:

* Internship code
* Internship title
* Domain
* Work mode
* Location
* Skills
* Number of openings
* Internship ID
* Duplicate internship codes

Invalid requests return a structured error response.

Example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error message"
  }
}
```

## 📄 API Response Format

Successful responses follow a consistent structure:

```json
{
  "success": true,
  "data": []
}
```

Paginated responses include pagination information:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 5,
    "totalPages": 1
  }
}
```

## 🧪 Tested Functionality

The following functionality has been tested successfully:

* ✅ Get all internships
* ✅ Get internship by ID
* ✅ Create internship
* ✅ Update internship
* ✅ Delete internship
* ✅ Input validation
* ✅ Error handling
* ✅ Pagination
* ✅ Search
* ✅ Domain filtering
* ✅ Work-mode filtering
* ✅ SQLite persistence
* ✅ Responsive frontend

## 📸 Screenshots

### Internship Dashboard

![Internship Dashboard](screenshots/01-home.png)

### Search and Filters

![Search and Filters](screenshots/02-search-filter.png)

### Add Internship

![Add Internship](screenshots/03-add-internship.png)

### REST API Response

![REST API Response](screenshots/04-api-response.png)

## 🎯 Project Objective

The objective of this project is to demonstrate the implementation of a predictable REST API contract, persistent data storage, safe CRUD operations, input validation, pagination, and a responsive frontend interface for managing internship records.

## 👩‍💻 Project Information

**Project:** Internship Management REST API
**Task:** EdVyro Full Stack Development Task 3
**Backend:** Node.js + Express.js
**Database:** SQLite
**Frontend:** HTML5 + CSS3 + JavaScript
