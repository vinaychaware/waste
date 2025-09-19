import React, { useState, useEffect } from 'react';
import { Recycle, User, LogOut, Plus, Eye, UserPlus, Check, X, Clock, AlertTriangle, CheckCircle, Users, BarChart3, Map, ClipboardList, Tag as Tasks, HardHat, GraduationCap, Truck, Leaf, Trophy, ShoppingCart, FileText, Calendar, Star, TrendingUp, MapPin } from 'lucide-react';

// Types
interface User {
  username: string;
  role: string;
  loginTime: string;
}

interface Complaint {
  id: string;
  type: string;
  location: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  citizenId: string;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  notes?: string;
}

interface Worker {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  location: { lat: number; lng: number };
  tasksCompleted: number;
  rating: number;
}

// Sample Data
const sampleComplaints: Complaint[] = [
  {
    id: 'complaint-1',
    type: 'overflowing-bin',
    location: 'Main Street, Block A',
    description: 'Garbage bin is overflowing for 2 days',
    status: 'pending',
    priority: 'high',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    citizenId: 'citizen1'
  },
  {
    id: 'complaint-2',
    type: 'illegal-dumping',
    location: 'Park Avenue, Near Gate 2',
    description: 'Someone dumped construction waste',
    status: 'in-progress',
    priority: 'urgent',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    citizenId: 'citizen2',
    assignedTo: 'john-doe',
    assignedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'complaint-3',
    type: 'missed-collection',
    location: 'Rose Garden Society',
    description: 'Garbage collection was missed today',
    status: 'resolved',
    priority: 'medium',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    citizenId: 'citizen3',
    assignedTo: 'jane-smith',
    resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

const sampleWorkers: Worker[] = [
  {
    id: 'john-doe',
    name: 'John Doe',
    status: 'active',
    location: { lat: 40.7128, lng: -74.0060 },
    tasksCompleted: 45,
    rating: 4.7
  },
  {
    id: 'jane-smith',
    name: 'Jane Smith',
    status: 'active',
    location: { lat: 40.7589, lng: -73.9851 },
    tasksCompleted: 52,
    rating: 4.9
  },
  {
    id: 'mike-wilson',
    name: 'Mike Wilson',
    status: 'inactive',
    location: { lat: 40.7505, lng: -73.9934 },
    tasksCompleted: 38,
    rating: 4.5
  }
];

const users = {
  'superadmin': { 'admin': { password: 'admin123', role: 'superadmin' } },
  'admin': { 'admin': { password: 'admin123', role: 'admin' } },
  'worker': { 'worker': { password: 'worker123', role: 'worker' } },
  'green-champion': { 'champion': { password: 'champion123', role: 'green-champion' } },
  'citizen': { 'citizen': { password: 'citizen123', role: 'citizen' } }
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSection, setCurrentSection] = useState('overview');
  const [complaints, setComplaints] = useState<Complaint[]>(sampleComplaints);
  const [workers] = useState<Worker[]>(sampleWorkers);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    role: '',
    username: '',
    password: ''
  });

  // Complaint form state
  const [complaintForm, setComplaintForm] = useState({
    type: '',
    location: '',
    description: '',
    photo: null as File | null
  });

  // Task form state
  const [taskForm, setTaskForm] = useState({
    worker: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: string = 'info') => {
    setToast({ message, type });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { role, username, password } = loginForm;
    
    if (users[role as keyof typeof users] && 
        users[role as keyof typeof users][username as keyof typeof users[keyof typeof users]] && 
        users[role as keyof typeof users][username as keyof typeof users[keyof typeof users[keyof typeof users]]].password === password) {
      
      const user: User = {
        username,
        role,
        loginTime: new Date().toISOString()
      };
      
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      showToast('Login successful!', 'success');
    } else {
      showToast('Invalid credentials. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentSection('overview');
    showToast('Logged out successfully', 'success');
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newComplaint: Complaint = {
      id: `complaint-${Date.now()}`,
      type: complaintForm.type,
      location: complaintForm.location,
      description: complaintForm.description,
      status: 'pending',
      priority: 'medium',
      timestamp: new Date().toISOString(),
      citizenId: currentUser?.username || 'unknown'
    };
    
    setComplaints([...complaints, newComplaint]);
    setShowComplaintModal(false);
    setComplaintForm({ type: '', location: '', description: '', photo: null });
    showToast('Complaint submitted successfully!', 'success');
  };

  const handleTaskAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedComplaints = complaints.map(complaint => 
      complaint.id === selectedComplaintId 
        ? {
            ...complaint,
            status: 'in-progress' as const,
            assignedTo: taskForm.worker,
            priority: taskForm.priority,
            assignedAt: new Date().toISOString(),
            notes: taskForm.notes
          }
        : complaint
    );
    
    setComplaints(updatedComplaints);
    setShowTaskModal(false);
    setTaskForm({ worker: '', priority: 'medium', notes: '' });
    showToast('Task assigned successfully!', 'success');
  };

  const updateComplaintStatus = (id: string, status: 'pending' | 'in-progress' | 'resolved') => {
    const updatedComplaints = complaints.map(complaint => 
      complaint.id === id 
        ? {
            ...complaint,
            status,
            ...(status === 'resolved' ? { resolvedAt: new Date().toISOString() } : {})
          }
        : complaint
    );
    
    setComplaints(updatedComplaints);
    const statusMessages = {
      'resolved': 'Task approved and complaint resolved!',
      'pending': 'Task rejected. Complaint moved back to pending.',
      'in-progress': 'Complaint status updated.'
    };
    showToast(statusMessages[status], status === 'resolved' ? 'success' : 'warning');
  };

  const getMenuItems = (role: string) => {
    const commonItems = [
      { key: 'overview', label: 'Overview', icon: BarChart3 }
    ];
    
    const roleSpecificItems = {
      'superadmin': [
        ...commonItems,
        { key: 'analytics', label: 'System Analytics', icon: BarChart3 },
        { key: 'heat-map', label: 'Heat Map', icon: Map },
        { key: 'users', label: 'User Management', icon: Users },
        { key: 'reports', label: 'Reports', icon: FileText }
      ],
      'admin': [
        ...commonItems,
        { key: 'complaints', label: 'Complaints', icon: AlertTriangle },
        { key: 'tasks', label: 'Task Management', icon: Tasks },
        { key: 'workers', label: 'Workers', icon: HardHat },
        { key: 'heat-map', label: 'Heat Map', icon: Map }
      ],
      'worker': [
        ...commonItems,
        { key: 'my-tasks', label: 'My Tasks', icon: ClipboardList },
        { key: 'training', label: 'Training', icon: GraduationCap },
        { key: 'attendance', label: 'Attendance', icon: Clock }
      ],
      'green-champion': [
        ...commonItems,
        { key: 'complaints', label: 'My Complaints', icon: AlertTriangle },
        { key: 'points', label: 'Green Points', icon: Leaf },
        { key: 'training', label: 'Training', icon: GraduationCap },
        { key: 'leaderboard', label: 'Leaderboard', icon: Trophy }
      ],
      'citizen': [
        ...commonItems,
        { key: 'complaints', label: 'My Complaints', icon: AlertTriangle },
        { key: 'tracking', label: 'Vehicle Tracking', icon: Truck },
        { key: 'training', label: 'Training', icon: GraduationCap },
        { key: 'shop', label: 'E-Commerce', icon: ShoppingCart }
      ]
    };
    
    return roleSpecificItems[role as keyof typeof roleSpecificItems] || commonItems;
  };

  const getAnalytics = () => {
    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
    const urgentComplaints = complaints.filter(c => c.priority === 'urgent').length;
    const activeWorkers = workers.filter(w => w.status === 'active').length;
    
    return {
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      urgentComplaints,
      activeWorkers,
      avgResolutionTime: 24,
      avgRating: 4.7,
      resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0
    };
  };

  const formatComplaintType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const renderDashboardContent = () => {
    const analytics = getAnalytics();
    const userRole = currentUser?.role || '';
    
    switch (currentSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-2">Welcome to the Smart Waste Management System</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRole === 'superadmin' || userRole === 'admin' ? (
                <>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics.totalComplaints}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics.pendingComplaints}</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Resolved</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics.resolvedComplaints}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </>
              ) : userRole === 'citizen' ? (
                <>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">My Complaints</p>
                        <p className="text-3xl font-bold text-gray-900">{complaints.filter(c => c.citizenId === 'citizen').length}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Resolved</p>
                        <p className="text-3xl font-bold text-gray-900">{complaints.filter(c => c.citizenId === 'citizen' && c.status === 'resolved').length}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </>
              ) : userRole === 'green-champion' ? (
                <>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Green Points</p>
                        <p className="text-3xl font-bold text-gray-900">1,250</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Leaf className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Rank</p>
                        <p className="text-3xl font-bold text-gray-900">#3</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {renderComplaintTable(complaints.slice(0, 5))}
              </div>
            </div>
          </div>
        );
        
      case 'complaints':
        const filteredComplaints = userRole === 'citizen' 
          ? complaints.filter(c => c.citizenId === 'citizen')
          : userRole === 'green-champion'
          ? complaints.filter(c => c.citizenId === 'champion')
          : complaints;
          
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Complaints Management</h1>
                <p className="text-gray-600 mt-2">Manage and track complaint resolution</p>
              </div>
              {(userRole === 'citizen' || userRole === 'green-champion') && (
                <button
                  onClick={() => setShowComplaintModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Complaint
                </button>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                {renderComplaintTable(filteredComplaints)}
              </div>
            </div>
          </div>
        );
        
      case 'workers':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Worker Management</h1>
              <p className="text-gray-600 mt-2">Manage workforce and track performance</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Workers</p>
                    <p className="text-3xl font-bold text-gray-900">{workers.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-3xl font-bold text-gray-900">{workers.filter(w => w.status === 'active').length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactive</p>
                    <p className="text-3xl font-bold text-gray-900">{workers.filter(w => w.status === 'inactive').length}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Worker Status</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Completed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workers.map((worker) => (
                      <tr key={worker.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{worker.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {worker.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{worker.tasksCompleted}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {worker.rating}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            {worker.location.lat.toFixed(4)}, {worker.location.lng.toFixed(4)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'training':
        const modules = {
          'citizen': [
            { id: 1, title: 'Waste Segregation Basics', progress: 100, status: 'completed' },
            { id: 2, title: 'Composting at Home', progress: 60, status: 'in-progress' },
            { id: 3, title: 'Recycling Guidelines', progress: 0, status: 'not-started' }
          ],
          'worker': [
            { id: 1, title: 'Safety Protocols', progress: 100, status: 'completed' },
            { id: 2, title: 'Equipment Handling', progress: 80, status: 'in-progress' },
            { id: 3, title: 'Emergency Procedures', progress: 0, status: 'not-started' }
          ],
          'green-champion': [
            { id: 1, title: 'Community Leadership', progress: 100, status: 'completed' },
            { id: 2, title: 'Environmental Awareness', progress: 90, status: 'in-progress' },
            { id: 3, title: 'Event Organization', progress: 30, status: 'in-progress' }
          ]
        };
        
        const userModules = modules[userRole as keyof typeof modules] || modules.citizen;
        
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Training Modules</h1>
              <p className="text-gray-600 mt-2">Gamified learning experience</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userModules.map((module) => (
                <div key={module.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">Progress: {module.progress}%</p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full ${
                        module.status === 'completed' ? 'bg-green-600' : 
                        module.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${module.progress}%` }}
                    ></div>
                  </div>
                  
                  <button className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    module.status === 'completed' 
                      ? 'bg-green-100 text-green-800 cursor-default' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}>
                    {module.status === 'completed' ? '✅ Completed' : 
                     module.status === 'in-progress' ? '▶️ Continue' : '🚀 Start'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'tracking':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vehicle Tracking</h1>
              <p className="text-gray-600 mt-2">Real-time garbage collection vehicle locations</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Map className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Interactive Map</p>
                  <p className="text-sm">Real-time GPS tracking integration would be implemented here</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Vehicle Status</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">GV-001</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          En Route
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Main Street</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5 minutes</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">GV-002</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jane Smith</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Park Avenue</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'shop':
        const products = [
          { id: 1, name: 'Segregation Dustbin Set', price: '₹299', emoji: '🗑️' },
          { id: 2, name: 'Compost Bin', price: '₹199', emoji: '♻️' },
          { id: 3, name: 'Recycling Guide Book', price: '₹99', emoji: '📚' },
          { id: 4, name: 'Eco-friendly Bags', price: '₹149', emoji: '🛍️' }
        ];
        
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">E-Commerce Store</h1>
              <p className="text-gray-600 mt-2">Essential waste management utilities</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                  <div className="text-6xl mb-4">{product.emoji}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-green-600 mb-4">{product.price}</p>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return renderDashboardContent();
    }
  };

  const renderComplaintTable = (complaintsToShow: Complaint[]) => {
    if (!complaintsToShow.length) {
      return (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
          <p className="text-gray-500">There are no complaints to display at the moment.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {complaintsToShow.map((complaint) => (
              <tr key={complaint.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {complaint.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatComplaintType(complaint.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {complaint.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      complaint.priority === 'urgent' ? 'bg-red-500' :
                      complaint.priority === 'high' ? 'bg-orange-500' :
                      complaint.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    {complaint.priority}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(complaint.timestamp).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert(`Complaint Details:\n\nType: ${complaint.type}\nLocation: ${complaint.location}\nDescription: ${complaint.description}\nStatus: ${complaint.status}\nSubmitted: ${new Date(complaint.timestamp).toLocaleString()}`)}
                      className="text-green-600 hover:text-green-900 flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    
                    {currentUser?.role === 'admin' && (
                      <>
                        {complaint.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedComplaintId(complaint.id);
                              setShowTaskModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <UserPlus className="h-4 w-4" />
                            Assign
                          </button>
                        )}
                        
                        {complaint.status === 'in-progress' && (
                          <>
                            <button
                              onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => updateComplaintStatus(complaint.id, 'pending')}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8 text-white">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Recycle className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Smart Waste Management</h1>
            <p className="text-green-100">Connecting communities for a cleaner tomorrow</p>
          </div>
          
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Role</label>
              <select
                value={loginForm.role}
                onChange={(e) => setLoginForm({ ...loginForm, role: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Choose your role</option>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="worker">Worker</option>
                <option value="green-champion">Green Champion</option>
                <option value="citizen">Citizen</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <User className="h-5 w-5" />
              Login
            </button>
          </form>
          
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white text-sm">
            <h4 className="font-semibold mb-2 text-green-100">Demo Credentials:</h4>
            <div className="space-y-1 font-mono text-xs">
              <p><strong>Superadmin:</strong> admin / admin123</p>
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Worker:</strong> worker / worker123</p>
              <p><strong>Green Champion:</strong> champion / champion123</p>
              <p><strong>Citizen:</strong> citizen / citizen123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Recycle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Smart Waste Management</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser.username} ({currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 fixed left-0 top-20 bottom-0 overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-2">
              {getMenuItems(currentUser.role).map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => setCurrentSection(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        currentSection === item.key
                          ? 'bg-green-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {renderDashboardContent()}
        </main>
      </div>

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Submit New Complaint</h3>
                <button
                  onClick={() => setShowComplaintModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleComplaintSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                <select
                  value={complaintForm.type}
                  onChange={(e) => setComplaintForm({ ...complaintForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select issue type</option>
                  <option value="overflowing-bin">Overflowing Bin</option>
                  <option value="illegal-dumping">Illegal Dumping</option>
                  <option value="missed-collection">Missed Collection</option>
                  <option value="broken-bin">Broken Bin</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={complaintForm.location}
                  onChange={(e) => setComplaintForm({ ...complaintForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter location details"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the issue in detail"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setComplaintForm({ ...complaintForm, photo: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Assign Task</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleTaskAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Worker</label>
                <select
                  value={taskForm.worker}
                  onChange={(e) => setTaskForm({ ...taskForm, worker: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select worker</option>
                  <option value="john-doe">John Doe</option>
                  <option value="jane-smith">Jane Smith</option>
                  <option value="mike-wilson">Mike Wilson</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any specific instructions"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-6 p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' :
          toast.type === 'warning' ? 'bg-yellow-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {toast.type === 'error' && <X className="h-5 w-5" />}
          {toast.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;