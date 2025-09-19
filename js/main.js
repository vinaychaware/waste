// Import modules
import { AuthManager } from './auth.js';
import { DashboardManager } from './dashboard.js';
import { DataManager } from './data.js';
import { UIManager } from './ui.js';

// Initialize the application
class App {
    constructor() {
        this.auth = new AuthManager();
        this.data = new DataManager();
        this.ui = new UIManager();
        this.dashboard = new DashboardManager(this.data, this.ui);
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAuthState();
    }
    
    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
        
        // Modal close handlers
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.ui.closeModal(modal.id);
            });
        });
        
        // Complaint form
        document.getElementById('complaintForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleComplaintSubmission();
        });
        
        // Task assignment form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskAssignment();
        });
        
        // File upload preview
        document.getElementById('complaintPhoto').addEventListener('change', (e) => {
            this.ui.handleFilePreview(e.target);
        });
    }
    
    checkAuthState() {
        const currentUser = this.auth.getCurrentUser();
        if (currentUser) {
            this.showDashboard(currentUser);
        } else {
            this.showLogin();
        }
    }
    
    handleLogin() {
        const role = document.getElementById('userRole').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (this.auth.login(role, username, password)) {
            const user = this.auth.getCurrentUser();
            this.showDashboard(user);
            this.ui.showToast('Login successful!', 'success');
        } else {
            this.ui.showToast('Invalid credentials. Please try again.', 'error');
        }
    }
    
    handleLogout() {
        this.auth.logout();
        this.showLogin();
        this.ui.showToast('Logged out successfully', 'success');
    }
    
    showLogin() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('dashboardScreen').classList.remove('active');
        
        // Clear form
        document.getElementById('loginForm').reset();
    }
    
    showDashboard(user) {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('dashboardScreen').classList.add('active');
        
        // Update user welcome message
        document.getElementById('userWelcome').textContent = 
            `Welcome, ${user.username} (${user.role.charAt(0).toUpperCase() + user.role.slice(1)})`;
        
        // Load dashboard content
        this.dashboard.loadDashboard(user.role);
    }
    
    handleComplaintSubmission() {
        const formData = new FormData(document.getElementById('complaintForm'));
        const complaintData = {
            type: formData.get('complaintType') || document.getElementById('complaintType').value,
            location: formData.get('complaintLocation') || document.getElementById('complaintLocation').value,
            description: formData.get('complaintDescription') || document.getElementById('complaintDescription').value,
            photo: document.getElementById('complaintPhoto').files[0],
            timestamp: new Date().toISOString(),
            status: 'pending',
            citizenId: this.auth.getCurrentUser().username
        };
        
        const complaintId = this.data.addComplaint(complaintData);
        this.ui.closeModal('complaintModal');
        this.ui.showToast('Complaint submitted successfully!', 'success');
        
        // Refresh dashboard
        this.dashboard.loadDashboard(this.auth.getCurrentUser().role);
        
        // Clear form
        document.getElementById('complaintForm').reset();
    }
    
    handleTaskAssignment() {
        const currentComplaintId = document.getElementById('taskForm').dataset.complaintId;
        const worker = document.getElementById('assignWorker').value;
        const priority = document.getElementById('taskPriority').value;
        const notes = document.getElementById('taskNotes').value;
        
        this.data.assignTask(currentComplaintId, {
            worker,
            priority,
            notes,
            assignedAt: new Date().toISOString(),
            assignedBy: this.auth.getCurrentUser().username
        });
        
        this.ui.closeModal('taskModal');
        this.ui.showToast('Task assigned successfully!', 'success');
        
        // Refresh dashboard
        this.dashboard.loadDashboard(this.auth.getCurrentUser().role);
        
        // Clear form
        document.getElementById('taskForm').reset();
    }
}

// Global functions for HTML onclick handlers
window.openModal = function(modalId) {
    document.getElementById(modalId).classList.add('show');
};

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('show');
};

window.assignTask = function(complaintId) {
    document.getElementById('taskForm').dataset.complaintId = complaintId;
    openModal('taskModal');
};

window.approveTask = function(complaintId) {
    const app = window.appInstance;
    app.data.updateComplaintStatus(complaintId, 'resolved');
    app.ui.showToast('Task approved and complaint resolved!', 'success');
    app.dashboard.loadDashboard(app.auth.getCurrentUser().role);
};

window.rejectTask = function(complaintId) {
    const app = window.appInstance;
    app.data.updateComplaintStatus(complaintId, 'pending');
    app.ui.showToast('Task rejected. Complaint moved back to pending.', 'warning');
    app.dashboard.loadDashboard(app.auth.getCurrentUser().role);
};

window.viewDetails = function(complaintId) {
    const app = window.appInstance;
    const complaint = app.data.getComplaint(complaintId);
    if (complaint) {
        alert(`Complaint Details:\n\nType: ${complaint.type}\nLocation: ${complaint.location}\nDescription: ${complaint.description}\nStatus: ${complaint.status}\nSubmitted: ${new Date(complaint.timestamp).toLocaleString()}`);
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.appInstance = new App();
});