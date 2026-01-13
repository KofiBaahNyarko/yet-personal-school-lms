import { useState, useEffect } from 'react';
import { FileText, BookOpen, ClipboardList, Link as LinkIcon, X } from 'lucide-react';
import { getMaterials, deleteMaterial } from '../api';
import { getNotes, deleteNote } from '../api';
import { getAssignments, deleteAssignment } from '../api';

export default function CourseTab({ courseId, course }) {
  const [materials, setMaterials] = useState([]);
  const [notes, setNotes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
    
    // Listen for data updates
    const handleDataUpdate = () => {
      if (courseId) loadData();
    };
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, [courseId]);

  const loadData = async () => {
    try {
      const [materialsRes, notesRes, assignmentsRes] = await Promise.all([
        getMaterials(courseId),
        getNotes(courseId),
        getAssignments(courseId)
      ]);
      
      setMaterials(materialsRes.data);
      setNotes(notesRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await deleteMaterial(id);
      setMaterials(materials.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      await deleteAssignment(id);
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'materials', label: 'Materials', icon: FileText },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{course?.name || 'Course'}</h2>
        {course?.code && (
          <p className="text-gray-600 mt-1">{course.code}</p>
        )}
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === section.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Materials</h3>
              <FileText size={20} className="text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{materials.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total items</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Notes</h3>
              <FileText size={20} className="text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{notes.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total notes</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Assignments</h3>
              <ClipboardList size={20} className="text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{assignments.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total assignments</div>
          </div>

          {/* Upcoming Assignments */}
          {assignments.filter(a => a.due_date && a.status !== 'completed').length > 0 && (
            <div className="md:col-span-3 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Assignments</h3>
              <div className="space-y-2">
                {assignments
                  .filter(a => a.due_date && a.status !== 'completed')
                  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                  .slice(0, 5)
                  .map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{assignment.title}</div>
                        <div className="text-sm text-gray-500">{formatDate(assignment.due_date)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Materials Section */}
      {activeSection === 'materials' && (
        <div className="space-y-4">
          {materials.map(material => (
            <div
              key={material.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {material.type === 'link' && <LinkIcon size={18} className="text-gray-400" />}
                    {material.type === 'file' && <FileText size={18} className="text-gray-400" />}
                    {material.type === 'syllabus' && <BookOpen size={18} className="text-gray-400" />}
                    <span className="text-xs font-medium text-gray-500 uppercase">{material.type}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{material.title}</h4>
                  {material.content && (
                    <p className="text-sm text-gray-600 mb-2">{material.content}</p>
                  )}
                  {material.url && (
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Open link →
                    </a>
                  )}
                  {material.file_path && (
                    <a
                      href={`http://localhost:3001${material.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      View file →
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteMaterial(material.id)}
                  className="ml-4 text-gray-400 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
          {materials.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No materials yet. Use the "Add" button to add materials!</p>
            </div>
          )}
        </div>
      )}

      {/* Notes Section */}
      {activeSection === 'notes' && (
        <div className="space-y-4">
          {notes.map(note => (
            <div
              key={note.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{note.title}</h4>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="ml-4 text-gray-400 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</p>
              {note.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {note.tags.split(',').map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                Updated: {formatDate(note.updated_at)}
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No notes yet. Use the "Add" button to create notes!</p>
            </div>
          )}
        </div>
      )}

      {/* Assignments Section */}
      {activeSection === 'assignments' && (
        <div className="space-y-4">
          {assignments.map(assignment => (
            <div
              key={assignment.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      assignment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </div>
                  {assignment.description && (
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                  )}
                  {assignment.due_date && (
                    <div className="text-sm text-gray-500">
                      Due: {formatDate(assignment.due_date)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  className="ml-4 text-gray-400 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No assignments yet. Use the "Add" button to add assignments!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

