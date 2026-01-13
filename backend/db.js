import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, 'database.json');

let db = {
  courses: [],
  materials: [],
  notes: [],
  assignments: [],
  general_items: []
};

// Load database from file
function loadDatabase() {
  if (fs.existsSync(dbPath)) {
    try {
      const data = fs.readFileSync(dbPath, 'utf8');
      db = JSON.parse(data);
      // Ensure all arrays exist
      if (!db.courses) db.courses = [];
      if (!db.materials) db.materials = [];
      if (!db.notes) db.notes = [];
      if (!db.assignments) db.assignments = [];
      if (!db.general_items) db.general_items = [];
    } catch (error) {
      console.error('Error loading database:', error);
      db = {
        courses: [],
        materials: [],
        notes: [],
        assignments: [],
        general_items: []
      };
    }
  }
  return db;
}

// Save database to file
function saveDatabase() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Initialize database
export function initDatabase() {
  loadDatabase();
  saveDatabase();
  return db;
}

// Get database instance
export function getDb() {
  if (!db.courses) {
    loadDatabase();
  }
  return {
    prepare: (query) => {
      const trimmedQuery = query.trim();
      const queryUpper = trimmedQuery.toUpperCase();
      
      // SELECT queries
      if (queryUpper.startsWith('SELECT')) {
        return {
          all: (...params) => {
            if (queryUpper.includes('FROM courses')) {
              let results = [...db.courses];
              
              // Handle LIKE queries for search
              if (queryUpper.includes('LIKE')) {
                const searchTerm = params[0]?.replace(/%/g, '') || '';
                results = results.filter(c => 
                  c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.code?.toLowerCase().includes(searchTerm.toLowerCase())
                );
              }
              
              if (queryUpper.includes('ORDER BY created_at DESC')) {
                results.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
              }
              return results;
            } else if (queryUpper.includes('FROM materials')) {
              let results = [...db.materials];
              
              if (queryUpper.includes('WHERE course_id = ?')) {
                const courseId = params[0];
                results = results.filter(m => m.course_id === courseId);
                
                // Handle LIKE in WHERE clause
                if (queryUpper.includes('LIKE')) {
                  const searchTerm = params[1]?.replace(/%/g, '') || params[2]?.replace(/%/g, '') || '';
                  results = results.filter(m => 
                    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    m.content?.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                }
              } else if (queryUpper.includes('LIKE')) {
                const searchTerm = params[0]?.replace(/%/g, '') || '';
                results = results.filter(m => 
                  m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  m.content?.toLowerCase().includes(searchTerm.toLowerCase())
                );
              }
              
              if (queryUpper.includes('ORDER BY created_at DESC')) {
                results.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
              }
              return results;
            } else if (queryUpper.includes('FROM notes')) {
              let results = [...db.notes];
              
              if (queryUpper.includes('WHERE course_id = ?')) {
                const courseId = params[0];
                results = results.filter(n => n.course_id === courseId);
                
                // Handle LIKE in WHERE clause
                if (queryUpper.includes('LIKE')) {
                  const searchTerm = params[1]?.replace(/%/g, '') || params[2]?.replace(/%/g, '') || '';
                  results = results.filter(n => 
                    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    n.content?.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                }
              } else if (queryUpper.includes('LIKE')) {
                const searchTerm = params[0]?.replace(/%/g, '') || '';
                results = results.filter(n => 
                  n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  n.content?.toLowerCase().includes(searchTerm.toLowerCase())
                );
              }
              
              if (queryUpper.includes('ORDER BY updated_at DESC')) {
                results.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
              }
              return results;
            } else if (queryUpper.includes('FROM assignments')) {
              let results = [...db.assignments];
              
              if (queryUpper.includes('WHERE course_id = ?')) {
                const courseId = params[0];
                results = results.filter(a => a.course_id === courseId);
                
                // Handle LIKE in WHERE clause
                if (queryUpper.includes('LIKE')) {
                  const searchTerm = params[1]?.replace(/%/g, '') || params[2]?.replace(/%/g, '') || '';
                  results = results.filter(a => 
                    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.description?.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                }
              } else if (queryUpper.includes('LIKE')) {
                const searchTerm = params[0]?.replace(/%/g, '') || '';
                results = results.filter(a => 
                  a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.description?.toLowerCase().includes(searchTerm.toLowerCase())
                );
              }
              
              if (queryUpper.includes('ORDER BY due_date ASC')) {
                results.sort((a, b) => {
                  if (!a.due_date) return 1;
                  if (!b.due_date) return -1;
                  return new Date(a.due_date) - new Date(b.due_date);
                });
              }
              return results;
            } else if (queryUpper.includes('FROM general_items')) {
              let results = [...db.general_items];
              if (queryUpper.includes('ORDER BY created_at DESC')) {
                results.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
              }
              return results;
            }
            return [];
          },
          get: (...params) => {
            if (queryUpper.includes('FROM courses') && queryUpper.includes('WHERE id = ?')) {
              return db.courses.find(c => c.id === params[0]) || null;
            } else if (queryUpper.includes('FROM materials') && queryUpper.includes('WHERE id = ?')) {
              return db.materials.find(m => m.id === params[0]) || null;
            } else if (queryUpper.includes('FROM notes') && queryUpper.includes('WHERE id = ?')) {
              return db.notes.find(n => n.id === params[0]) || null;
            } else if (queryUpper.includes('FROM assignments') && queryUpper.includes('WHERE id = ?')) {
              return db.assignments.find(a => a.id === params[0]) || null;
            } else if (queryUpper.includes('FROM general_items') && queryUpper.includes('WHERE id = ?')) {
              return db.general_items.find(g => g.id === params[0]) || null;
            }
            return null;
          }
        };
      }
      
      // INSERT queries
      if (queryUpper.startsWith('INSERT')) {
        return {
          run: (...params) => {
            const now = new Date().toISOString();
            
            if (queryUpper.includes('INTO courses')) {
              const course = {
                id: params[0],
                name: params[1],
                code: params[2] || null,
                color: params[3] || '#6366f1',
                created_at: now
              };
              db.courses.push(course);
              saveDatabase();
            } else if (queryUpper.includes('INTO materials')) {
              const material = {
                id: params[0],
                course_id: params[1] || null,
                type: params[2],
                title: params[3],
                content: params[4] || null,
                file_path: params[5] || null,
                url: params[6] || null,
                tags: params[7] || null,
                created_at: now
              };
              db.materials.push(material);
              saveDatabase();
            } else if (queryUpper.includes('INTO notes')) {
              const note = {
                id: params[0],
                course_id: params[1] || null,
                title: params[2],
                content: params[3],
                tags: params[4] || null,
                created_at: now,
                updated_at: now
              };
              db.notes.push(note);
              saveDatabase();
            } else if (queryUpper.includes('INTO assignments')) {
              const assignment = {
                id: params[0],
                course_id: params[1] || null,
                title: params[2],
                description: params[3] || null,
                due_date: params[4] || null,
                status: params[5] || 'pending',
                attachments: params[6] || null,
                created_at: now
              };
              db.assignments.push(assignment);
              saveDatabase();
            } else if (queryUpper.includes('INTO general_items')) {
              const item = {
                id: params[0],
                type: params[1],
                title: params[2],
                content: params[3] || null,
                due_date: params[4] || null,
                url: params[5] || null,
                status: 'active',
                created_at: now
              };
              db.general_items.push(item);
              saveDatabase();
            }
          }
        };
      }
      
      // UPDATE queries
      if (queryUpper.startsWith('UPDATE')) {
        return {
          run: (...params) => {
            if (queryUpper.includes('notes SET')) {
              const id = params[params.length - 1];
              const index = db.notes.findIndex(n => n.id === id);
              if (index !== -1) {
                db.notes[index] = {
                  ...db.notes[index],
                  title: params[0],
                  content: params[1],
                  tags: params[2] || null,
                  updated_at: new Date().toISOString()
                };
                saveDatabase();
              }
            } else if (queryUpper.includes('assignments SET')) {
              const id = params[params.length - 1];
              const index = db.assignments.findIndex(a => a.id === id);
              if (index !== -1) {
                db.assignments[index] = {
                  ...db.assignments[index],
                  title: params[0],
                  description: params[1] || null,
                  due_date: params[2] || null,
                  status: params[3] || 'pending',
                  attachments: params[4] || null
                };
                saveDatabase();
              }
            }
          }
        };
      }
      
      // DELETE queries
      if (queryUpper.startsWith('DELETE')) {
        return {
          run: (...params) => {
            const id = params[0];
            
            if (queryUpper.includes('FROM courses')) {
              // Delete course and cascade delete related items
              db.courses = db.courses.filter(c => c.id !== id);
              db.materials = db.materials.filter(m => m.course_id !== id);
              db.notes = db.notes.filter(n => n.course_id !== id);
              db.assignments = db.assignments.filter(a => a.course_id !== id);
              saveDatabase();
            } else if (queryUpper.includes('FROM materials')) {
              db.materials = db.materials.filter(m => m.id !== id);
              saveDatabase();
            } else if (queryUpper.includes('FROM notes')) {
              db.notes = db.notes.filter(n => n.id !== id);
              saveDatabase();
            } else if (queryUpper.includes('FROM assignments')) {
              db.assignments = db.assignments.filter(a => a.id !== id);
              saveDatabase();
            } else if (queryUpper.includes('FROM general_items')) {
              db.general_items = db.general_items.filter(g => g.id !== id);
              saveDatabase();
            }
          }
        };
      }
      
      return {
        all: () => [],
        get: () => null,
        run: () => {}
      };
    },
    exec: () => {} // No-op for CREATE TABLE statements
  };
}
