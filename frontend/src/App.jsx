import { useState, useEffect } from 'react';
import { Home, BookOpen, Plus, Search, X } from 'lucide-react';
import { getCourses, createCourse, deleteCourse } from './api';
import GeneralTab from './components/GeneralTab';
import CourseTab from './components/CourseTab';
import AddAnythingModal from './components/AddAnythingModal';
import SearchModal from './components/SearchModal';
import CreateCourseModal from './components/CreateCourseModal';

function App() {
  const [activeTab, setActiveTab] = useState('general');
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
    
    // Listen for data updates
    const handleDataUpdate = () => loadCourses();
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  const loadCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      const response = await createCourse(courseData);
      setCourses([...courses, response.data]);
      setShowCreateCourse(false);
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
        setCourses(courses.filter(c => c.id !== id));
        if (activeTab === id) {
          setActiveTab('general');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">Personal LMS</h1>
              
              {/* Tabs */}
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'general'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Home size={16} />
                    <span>General</span>
                  </div>
                </button>
                
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setActiveTab(course.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === course.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen size={16} />
                      <span>{course.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                        className="ml-1 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Search"
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => setShowCreateCourse(true)}
                className="px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <Plus size={16} />
                  <span>New Course</span>
                </div>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <div className="flex items-center space-x-1">
                  <Plus size={16} />
                  <span>Add</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : activeTab === 'general' ? (
          <GeneralTab />
        ) : (
          <CourseTab courseId={activeTab} course={courses.find(c => c.id === activeTab)} />
        )}
      </main>

      {/* Modals */}
      {showCreateCourse && (
        <CreateCourseModal
          onClose={() => setShowCreateCourse(false)}
          onCreate={handleCreateCourse}
        />
      )}
      
      {showAddModal && (
        <AddAnythingModal
          onClose={() => setShowAddModal(false)}
          courseId={activeTab !== 'general' ? activeTab : null}
          courses={courses}
        />
      )}

      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          courses={courses}
        />
      )}
    </div>
  );
}

export default App;
