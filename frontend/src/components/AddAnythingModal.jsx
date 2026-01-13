import { useState } from 'react';
import { X, FileText, Link as LinkIcon, ClipboardList, Image, Upload } from 'lucide-react';
import { createMaterial, createNote, createAssignment, createGeneralItem } from '../api';

export default function AddAnythingModal({ onClose, courseId, courses }) {
  const [type, setType] = useState('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const types = [
    { id: 'note', label: 'Note', icon: FileText },
    { id: 'link', label: 'Link', icon: LinkIcon },
    { id: 'file', label: 'File', icon: Upload },
    { id: 'assignment', label: 'Assignment', icon: ClipboardList },
    { id: 'task', label: 'Task', icon: ClipboardList },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'note') {
        await createNote({
          course_id: selectedCourse || null,
          title,
          content,
        });
      } else if (type === 'link') {
        if (selectedCourse) {
          await createMaterial({
            course_id: selectedCourse,
            type: 'link',
            title,
            url,
          });
        } else {
          await createGeneralItem({
            type: 'link',
            title,
            url,
          });
        }
      } else if (type === 'file') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('course_id', selectedCourse || '');
        formData.append('type', 'file');
        formData.append('title', title);
        await createMaterial(formData);
      } else if (type === 'assignment') {
        await createAssignment({
          course_id: selectedCourse,
          title,
          description: content,
          due_date: dueDate || null,
        });
      } else if (type === 'task') {
        await createGeneralItem({
          type: 'task',
          title,
          content,
          due_date: dueDate || null,
        });
      }

      // Reset and close
      setTitle('');
      setContent('');
      setUrl('');
      setDueDate('');
      setFile(null);
      onClose();
      // Trigger a custom event to refresh data
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error creating item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Anything</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {types.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-colors ${
                      type === t.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} className={type === t.id ? 'text-indigo-600' : 'text-gray-400'} />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Course Selection (if not on a course tab) */}
          {!courseId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course (optional)
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">General</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* URL (for links) */}
          {type === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* File Upload (for files) */}
          {type === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File *
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Content/Description */}
          {(type === 'note' || type === 'assignment' || type === 'task') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === 'assignment' ? 'Description' : 'Content'}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Due Date (for assignments and tasks) */}
          {(type === 'assignment' || type === 'task') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

