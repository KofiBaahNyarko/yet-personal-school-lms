import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { randomUUID } from 'uuid';
import { getDb } from './db.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Courses
router.get('/api/courses', (req, res) => {
  const db = getDb();
  const courses = db.prepare('SELECT * FROM courses ORDER BY created_at DESC').all();
  res.json(courses);
});

router.post('/api/courses', (req, res) => {
  const db = getDb();
  const { name, code, color } = req.body;
  const id = randomUUID();
  
  db.prepare('INSERT INTO courses (id, name, code, color) VALUES (?, ?, ?, ?)')
    .run(id, name, code || null, color || '#6366f1');
  
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  res.json(course);
});

router.delete('/api/courses/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Materials
router.get('/api/materials', (req, res) => {
  const db = getDb();
  const { course_id } = req.query;
  let materials;
  
  if (course_id) {
    materials = db.prepare('SELECT * FROM materials WHERE course_id = ? ORDER BY created_at DESC').all(course_id);
  } else {
    materials = db.prepare('SELECT * FROM materials ORDER BY created_at DESC').all();
  }
  
  res.json(materials);
});

router.post('/api/materials', upload.single('file'), (req, res) => {
  const db = getDb();
  const { course_id, type, title, content, url, tags } = req.body;
  const id = randomUUID();
  const file_path = req.file ? `/uploads/${req.file.filename}` : null;
  
  db.prepare('INSERT INTO materials (id, course_id, type, title, content, file_path, url, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, course_id || null, type, title, content || null, file_path, url || null, tags || null);
  
  const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
  res.json(material);
});

router.delete('/api/materials/:id', (req, res) => {
  const db = getDb();
  const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
  
  if (material && material.file_path) {
    const filePath = path.join(__dirname, material.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  db.prepare('DELETE FROM materials WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Notes
router.get('/api/notes', (req, res) => {
  const db = getDb();
  const { course_id } = req.query;
  let notes;
  
  if (course_id) {
    notes = db.prepare('SELECT * FROM notes WHERE course_id = ? ORDER BY updated_at DESC').all(course_id);
  } else {
    notes = db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all();
  }
  
  res.json(notes);
});

router.post('/api/notes', (req, res) => {
  const db = getDb();
  const { course_id, title, content, tags } = req.body;
  const id = randomUUID();
  
  db.prepare('INSERT INTO notes (id, course_id, title, content, tags) VALUES (?, ?, ?, ?, ?)')
    .run(id, course_id || null, title, content, tags || null);
  
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  res.json(note);
});

router.put('/api/notes/:id', (req, res) => {
  const db = getDb();
  const { title, content, tags } = req.body;
  
  db.prepare('UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(title, content, tags || null, req.params.id);
  
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  res.json(note);
});

router.delete('/api/notes/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Assignments
router.get('/api/assignments', (req, res) => {
  const db = getDb();
  const { course_id } = req.query;
  let assignments;
  
  if (course_id) {
    assignments = db.prepare('SELECT * FROM assignments WHERE course_id = ? ORDER BY due_date ASC').all(course_id);
  } else {
    assignments = db.prepare('SELECT * FROM assignments ORDER BY due_date ASC').all();
  }
  
  res.json(assignments);
});

router.post('/api/assignments', (req, res) => {
  const db = getDb();
  const { course_id, title, description, due_date, status, attachments } = req.body;
  const id = randomUUID();
  
  db.prepare('INSERT INTO assignments (id, course_id, title, description, due_date, status, attachments) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, course_id || null, title, description || null, due_date || null, status || 'pending', attachments || null);
  
  const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
  res.json(assignment);
});

router.put('/api/assignments/:id', (req, res) => {
  const db = getDb();
  const { title, description, due_date, status, attachments } = req.body;
  
  db.prepare('UPDATE assignments SET title = ?, description = ?, due_date = ?, status = ?, attachments = ? WHERE id = ?')
    .run(title, description || null, due_date || null, status || 'pending', attachments || null, req.params.id);
  
  const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  res.json(assignment);
});

router.delete('/api/assignments/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM assignments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// General items
router.get('/api/general', (req, res) => {
  const db = getDb();
  const items = db.prepare('SELECT * FROM general_items ORDER BY created_at DESC').all();
  res.json(items);
});

router.post('/api/general', (req, res) => {
  const db = getDb();
  const { type, title, content, due_date, url } = req.body;
  const id = randomUUID();
  
  db.prepare('INSERT INTO general_items (id, type, title, content, due_date, url) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, type, title, content || null, due_date || null, url || null);
  
  const item = db.prepare('SELECT * FROM general_items WHERE id = ?').get(id);
  res.json(item);
});

router.delete('/api/general/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM general_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Search
router.get('/api/search', (req, res) => {
  const db = getDb();
  const { q, course_id } = req.query;
  const searchTerm = `%${q}%`;
  
  const results = {
    courses: [],
    materials: [],
    notes: [],
    assignments: []
  };
  
  if (course_id) {
    results.materials = db.prepare('SELECT * FROM materials WHERE course_id = ? AND (title LIKE ? OR content LIKE ?)').all(course_id, searchTerm, searchTerm);
    results.notes = db.prepare('SELECT * FROM notes WHERE course_id = ? AND (title LIKE ? OR content LIKE ?)').all(course_id, searchTerm, searchTerm);
    results.assignments = db.prepare('SELECT * FROM assignments WHERE course_id = ? AND (title LIKE ? OR description LIKE ?)').all(course_id, searchTerm, searchTerm);
  } else {
    results.courses = db.prepare('SELECT * FROM courses WHERE name LIKE ? OR code LIKE ?').all(searchTerm, searchTerm);
    results.materials = db.prepare('SELECT * FROM materials WHERE title LIKE ? OR content LIKE ?').all(searchTerm, searchTerm);
    results.notes = db.prepare('SELECT * FROM notes WHERE title LIKE ? OR content LIKE ?').all(searchTerm, searchTerm);
    results.assignments = db.prepare('SELECT * FROM assignments WHERE title LIKE ? OR description LIKE ?').all(searchTerm, searchTerm);
  }
  
  res.json(results);
});

export function setupRoutes(app) {
  app.use(router);
}

