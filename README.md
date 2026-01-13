# Personal LMS

A personal learning management system that helps students organize their courses, materials, notes, assignments, and general items all in one place.

## Features

- **General Dashboard**: Central hub with upcoming assignments, quick capture items, and overview
- **Course Management**: Create and manage multiple courses with custom colors
- **Materials**: Upload PDFs, add links, and organize syllabi
- **Notes**: Create and organize notes per course or in general
- **Assignments**: Track assignments with due dates and status
- **Global Search**: Search across all courses, materials, notes, and assignments
- **Add Anything**: Quick modal to add notes, links, files, assignments, or tasks

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)

## Getting Started

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

Or manually:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Running the Application

Start both frontend and backend servers:
```bash
npm run dev
```

Or run them separately:

**Backend** (runs on http://localhost:3001):
```bash
cd backend
npm run dev
```

**Frontend** (runs on http://localhost:5173):
```bash
cd frontend
npm run dev
```

## Usage

1. **Create a Course**: Click "New Course" button, enter course name, code (optional), and choose a color
2. **Add Content**: Use the "Add" button to add notes, links, files, assignments, or tasks
3. **Navigate**: Switch between General tab and course tabs using the header navigation
4. **Search**: Click the search icon to search across all content
5. **Manage**: View, edit, and delete items from each course tab

## Project Structure

```
.
├── backend/
│   ├── db.js           # Database setup and schema
│   ├── routes.js       # API routes
│   ├── server.js       # Express server
│   └── uploads/        # Uploaded files directory
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GeneralTab.jsx
│   │   │   ├── CourseTab.jsx
│   │   │   ├── AddAnythingModal.jsx
│   │   │   ├── SearchModal.jsx
│   │   │   └── CreateCourseModal.jsx
│   │   ├── api.js      # API client functions
│   │   ├── App.jsx     # Main app component
│   │   └── main.jsx    # Entry point
│   └── ...
└── package.json
```

## API Endpoints

- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create a course
- `DELETE /api/courses/:id` - Delete a course
- `GET /api/materials` - Get materials (optional: ?course_id=)
- `POST /api/materials` - Create material (multipart/form-data for files)
- `GET /api/notes` - Get notes (optional: ?course_id=)
- `POST /api/notes` - Create a note
- `GET /api/assignments` - Get assignments (optional: ?course_id=)
- `POST /api/assignments` - Create an assignment
- `GET /api/general` - Get general items
- `POST /api/general` - Create general item
- `GET /api/search` - Search (query: ?q=term&course_id=)

