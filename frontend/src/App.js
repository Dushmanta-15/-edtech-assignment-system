import React, { useState, useEffect, createContext, useContext } from 'react';
import { AlertCircle, BookOpen, Calendar, FileText, Plus, Send, User, LogOut, Upload } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

// API Service
const apiService = {
  // Auth methods
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Assignment methods
  async getAssignments(token) {
    const response = await fetch(`${API_BASE_URL}/assignments/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async createAssignment(token, assignment) {
    const response = await fetch(`${API_BASE_URL}/assignments/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assignment)
    });
    return response.json();
  },

  async getAssignmentSubmissions(token, assignmentId) {
    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submissions/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Submission methods
  async submitAssignment(token, submission) {
    const formData = new FormData();
    formData.append('assignment_id', submission.assignment_id);
    formData.append('content', submission.content);
    if (submission.file) {
      formData.append('file', submission.file);
    }

    const response = await fetch(`${API_BASE_URL}/submissions/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  },

  async getSubmissions(token) {
    const response = await fetch(`${API_BASE_URL}/submissions/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiService.login(email, password);
      if (data.access) {
        setToken(data.access);
        setUser(data.user);
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await apiService.register(userData);
      if (data.access) {
        setToken(data.access);
        setUser(data.user);
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Components
const LoginForm = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button onClick={onSwitch} className="text-blue-600 hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
};

const RegisterForm = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    role: 'STUDENT',
    password: '',
    password_confirm: ''
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.password_confirm) {
      setError("Passwords don't match");
      return;
    }

    const result = await register(formData);
    if (!result.success) {
      setError(typeof result.error === 'string' ? result.error : 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-blue-600 hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
};

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center">
          <BookOpen className="mr-2" size={24} />
          EdTech Assignment System
        </h1>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <User className="mr-1" size={16} />
            {user?.first_name} {user?.last_name} ({user?.role})
          </span>
          <button
            onClick={logout}
            className="flex items-center px-3 py-1 bg-blue-700 rounded hover:bg-blue-800"
          >
            <LogOut className="mr-1" size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const CreateAssignmentForm = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiService.createAssignment(token, formData);
      if (result.id) {
        onCreated(result);
        onClose();
      } else {
        setError('Failed to create assignment');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Create New Assignment</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubmissionForm = ({ assignment, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState({
    content: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      setFormData(prev => ({
        ...prev,
        file: e.target.files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submissionData = {
        assignment_id: assignment.id,
        content: formData.content,
        file: formData.file
      };
      
      const result = await apiService.submitAssignment(token, submissionData);
      if (result.id) {
        onSubmitted(result);
        onClose();
      } else {
        setError('Failed to submit assignment');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Submit Assignment</h2>
        <p className="text-gray-600 mb-4">Assignment: {assignment.title}</p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              placeholder="Enter your assignment content here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Upload (Optional)
            </label>
            <input
              type="file"
              name="file"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? 'Submitting...' : (
                <>
                  <Send className="mr-2" size={16} />
                  Submit
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignmentCard = ({ assignment, onSubmit, onViewSubmissions, userRole }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = new Date(assignment.due_date) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{assignment.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            by {assignment.teacher.first_name} {assignment.teacher.last_name}
          </p>
        </div>
        <div className="text-right">
          <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar className="mr-1" size={16} />
            {formatDate(assignment.due_date)}
          </div>
          {isOverdue && (
            <div className="flex items-center text-red-600 text-sm mt-1">
              <AlertCircle className="mr-1" size={14} />
              Overdue
            </div>
          )}
        </div>
      </div>
      
      {assignment.description && (
        <p className="text-gray-700 mb-4">{assignment.description}</p>
      )}
      
      <div className="flex space-x-2">
        {userRole === 'STUDENT' && (
          <button
            onClick={() => onSubmit(assignment)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            <Send className="mr-2" size={16} />
            Submit
          </button>
        )}
        {userRole === 'TEACHER' && (
          <button
            onClick={() => onViewSubmissions(assignment)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <FileText className="mr-2" size={16} />
            View Submissions
          </button>
        )}
      </div>
    </div>
  );
};

const SubmissionsList = ({ assignment, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await apiService.getAssignmentSubmissions(token, assignment.id);
        setSubmissions(data);
      } catch (error) {
        setError('Failed to fetch submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignment.id, token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Submissions for "{assignment.title}"</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading submissions...</p>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          {!loading && !error && submissions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No submissions yet.
            </div>
          )}
          
          {!loading && !error && submissions.length > 0 && (
            <div className="space-y-4">
              {submissions.map(submission => (
                <div key={submission.id} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {submission.student.first_name} {submission.student.last_name}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {formatDate(submission.submitted_at)}
                    </span>
                  </div>
                  
                  {submission.content && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Content:</p>
                      <p className="text-gray-600 bg-white p-3 rounded border">
                        {submission.content}
                      </p>
                    </div>
                  )}
                  
                  {submission.file && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">File:</p>
                      <a
                        href={submission.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <Upload className="mr-1" size={16} />
                        View uploaded file
                      </a>
                    </div>
                  )}
                  
                  {submission.grade && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Grade: </span>
                      <span className="text-green-600 font-semibold">{submission.grade}/100</span>
                    </div>
                  )}
                  
                  {submission.feedback && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                      <p className="text-gray-600 bg-white p-3 rounded border">
                        {submission.feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showSubmissionsList, setShowSubmissionsList] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await apiService.getAssignments(token);
      setAssignments(data.results || data);
    } catch (error) {
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = (newAssignment) => {
    setAssignments(prev => [newAssignment, ...prev]);
  };

  const handleSubmitAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionForm(true);
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsList(true);
  };

  const handleSubmissionCreated = () => {
    // Refresh assignments or show success message
    fetchAssignments();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.role === 'TEACHER' ? 'My Assignments' : 'Available Assignments'}
          </h2>
          {user?.role === 'TEACHER' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="mr-2" size={16} />
              Create Assignment
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assignments...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-md text-red-700 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && assignments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {user?.role === 'TEACHER' 
              ? 'No assignments created yet. Create your first assignment!' 
              : 'No assignments available.'}
          </div>
        )}

        {!loading && !error && assignments.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map(assignment => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onSubmit={handleSubmitAssignment}
                onViewSubmissions={handleViewSubmissions}
                userRole={user?.role}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateForm && (
        <CreateAssignmentForm
          onClose={() => setShowCreateForm(false)}
          onCreated={handleCreateAssignment}
        />
      )}

      {showSubmissionForm && selectedAssignment && (
        <SubmissionForm
          assignment={selectedAssignment}
          onClose={() => setShowSubmissionForm(false)}
          onSubmitted={handleSubmissionCreated}
        />
      )}

      {showSubmissionsList && selectedAssignment && (
        <SubmissionsList
          assignment={selectedAssignment}
          onClose={() => setShowSubmissionsList(false)}
        />
      )}
    </div>
  );
};

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">EdTech Assignment System</h1>
          <p className="text-gray-600">Streamline assignment creation and submission</p>
        </div>
        
        {isLogin ? (
          <LoginForm onSwitch={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitch={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

// Main App Component with Auth Provider
const EdTechApp = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default EdTechApp;
