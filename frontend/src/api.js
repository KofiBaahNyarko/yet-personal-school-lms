import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Courses
export const getCourses = () => api.get('/api/courses');
export const createCourse = (data) => api.post('/api/courses', data);
export const deleteCourse = (id) => api.delete(`/api/courses/${id}`);

// Materials
export const getMaterials = (courseId) => 
  api.get('/api/materials', { params: courseId ? { course_id: courseId } : {} });
export const createMaterial = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return api.post('/api/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteMaterial = (id) => api.delete(`/api/materials/${id}`);

// Notes
export const getNotes = (courseId) => 
  api.get('/api/notes', { params: courseId ? { course_id: courseId } : {} });
export const createNote = (data) => api.post('/api/notes', data);
export const updateNote = (id, data) => api.put(`/api/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/api/notes/${id}`);

// Assignments
export const getAssignments = (courseId) => 
  api.get('/api/assignments', { params: courseId ? { course_id: courseId } : {} });
export const createAssignment = (data) => api.post('/api/assignments', data);
export const updateAssignment = (id, data) => api.put(`/api/assignments/${id}`, data);
export const deleteAssignment = (id) => api.delete(`/api/assignments/${id}`);

// General items
export const getGeneralItems = () => api.get('/api/general');
export const createGeneralItem = (data) => api.post('/api/general', data);
export const deleteGeneralItem = (id) => api.delete(`/api/general/${id}`);

// Search
export const search = (query, courseId) => 
  api.get('/api/search', { params: { q: query, course_id: courseId || undefined } });

export default api;

