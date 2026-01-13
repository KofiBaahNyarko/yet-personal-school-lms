import { useState } from 'react';
import { X, Search, FileText, BookOpen, ClipboardList } from 'lucide-react';
import { search } from '../api';

export default function SearchModal({ onClose, courses }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await search(query, selectedCourse || undefined);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Search</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4 mb-6">
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search across all courses..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {results && !loading && (
            <div className="space-y-6">
              {/* Courses */}
              {results.courses && results.courses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <BookOpen size={20} />
                    <span>Courses</span>
                  </h3>
                  <div className="space-y-2">
                    {results.courses.map(course => (
                      <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{course.name}</div>
                        {course.code && <div className="text-sm text-gray-500">{course.code}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {results.materials && results.materials.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <FileText size={20} />
                    <span>Materials</span>
                  </h3>
                  <div className="space-y-2">
                    {results.materials.map(material => (
                      <div key={material.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{material.title}</div>
                        <div className="text-sm text-gray-500">{material.type}</div>
                        {material.content && (
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">{material.content}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {results.notes && results.notes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <FileText size={20} />
                    <span>Notes</span>
                  </h3>
                  <div className="space-y-2">
                    {results.notes.map(note => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{note.title}</div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignments */}
              {results.assignments && results.assignments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <ClipboardList size={20} />
                    <span>Assignments</span>
                  </h3>
                  <div className="space-y-2">
                    {results.assignments.map(assignment => (
                      <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{assignment.title}</div>
                        {assignment.description && (
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.description}</div>
                        )}
                        {assignment.due_date && (
                          <div className="text-sm text-gray-500 mt-1">Due: {formatDate(assignment.due_date)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!results.courses || results.courses.length === 0) &&
               (!results.materials || results.materials.length === 0) &&
               (!results.notes || results.notes.length === 0) &&
               (!results.assignments || results.assignments.length === 0) && (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No results found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

