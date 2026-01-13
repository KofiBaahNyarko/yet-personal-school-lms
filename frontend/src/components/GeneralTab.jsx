import { useState, useEffect } from 'react';
import { Calendar, CheckSquare, FileText, Link as LinkIcon, Clock, Plus } from 'lucide-react';
import { getGeneralItems, createGeneralItem, deleteGeneralItem } from '../api';
import { getAssignments } from '../api';

export default function GeneralTab() {
  const [generalItems, setGeneralItems] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Listen for data updates
    const handleDataUpdate = () => loadData();
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, assignmentsRes] = await Promise.all([
        getGeneralItems(),
        getAssignments()
      ]);
      
      setGeneralItems(itemsRes.data);
      
      // Get upcoming assignments (next 7 days)
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = assignmentsRes.data
        .filter(a => a.due_date && new Date(a.due_date) <= weekFromNow && a.status !== 'completed')
        .slice(0, 5);
      setUpcomingAssignments(upcoming);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteGeneralItem(id);
      setGeneralItems(generalItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeUntil = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">General Dashboard</h2>
        <p className="text-gray-600 mt-1">Your student OS hub</p>
      </div>

      {/* Due Soon Section */}
      {upcomingAssignments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Clock size={20} className="text-indigo-600" />
              <span>Due This Week</span>
            </h3>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.map(assignment => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{assignment.title}</div>
                  {assignment.due_date && (
                    <div className="text-sm text-gray-500">
                      {formatDate(assignment.due_date)} • {formatTimeUntil(assignment.due_date)}
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-indigo-600">
                  {formatTimeUntil(assignment.due_date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {generalItems.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {item.type === 'note' && <FileText size={18} className="text-gray-400" />}
                {item.type === 'link' && <LinkIcon size={18} className="text-gray-400" />}
                {item.type === 'task' && <CheckSquare size={18} className="text-gray-400" />}
                {item.type === 'reminder' && <Calendar size={18} className="text-gray-400" />}
                <span className="text-xs font-medium text-gray-500 uppercase">{item.type}</span>
              </div>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="text-gray-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
            {item.content && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.content}</p>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline"
              >
                Open link →
              </a>
            )}
            {item.due_date && (
              <div className="text-xs text-gray-500 mt-2">
                Due: {formatDate(item.due_date)}
              </div>
            )}
          </div>
        ))}
      </div>

      {generalItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No items yet. Use the "Add" button to get started!</p>
        </div>
      )}
    </div>
  );
}

