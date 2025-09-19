export class DashboardManager {
    constructor(dataManager, uiManager) {
        this.data = dataManager;
        this.ui = uiManager;
    }
    
    loadDashboard(userRole) {
        this.setupSidebar(userRole);
        this.loadDashboardContent(userRole);
    }
    
    setupSidebar(userRole) {
        const sidebar = document.getElementById('sidebarMenu');
        const menuItems = this.getMenuItems(userRole);
        
        sidebar.innerHTML = menuItems.map(item => `
            <li>
                <a href="#" onclick="window.appInstance.dashboard.loadDashboardContent('${userRole}', '${item.key}')" 
                   class="${item.key === 'overview' ? 'active' : ''}">
                    <i class="${item.icon}"></i>
                    <span>${item.label}</span>
                </a>
            </li>
        `).join('');
    }
    
    getMenuItems(userRole) {
        const commonItems = [
            { key: 'overview', label: 'Overview', icon: 'fas fa-tachometer-alt' }
        ];
        
        const roleSpecificItems = {
            'superadmin': [
                ...commonItems,
                { key: 'analytics', label: 'System Analytics', icon: 'fas fa-chart-bar' },
                { key: 'heat-map', label: 'Heat Map', icon: 'fas fa-map' },
                { key: 'users', label: 'User Management', icon: 'fas fa-users' },
                { key: 'reports', label: 'Reports', icon: 'fas fa-file-alt' }
            ],
            'admin': [
                ...commonItems,
                { key: 'complaints', label: 'Complaints', icon: 'fas fa-exclamation-triangle' },
                { key: 'tasks', label: 'Task Management', icon: 'fas fa-tasks' },
                { key: 'workers', label: 'Workers', icon: 'fas fa-hard-hat' },
                { key: 'heat-map', label: 'Heat Map', icon: 'fas fa-map' }
            ],
            'worker': [
                ...commonItems,
                { key: 'my-tasks', label: 'My Tasks', icon: 'fas fa-clipboard-list' },
                { key: 'training', label: 'Training', icon: 'fas fa-graduation-cap' },
                { key: 'attendance', label: 'Attendance', icon: 'fas fa-clock' }
            ],
            'green-champion': [
                ...commonItems,
                { key: 'complaints', label: 'My Complaints', icon: 'fas fa-exclamation-triangle' },
                { key: 'points', label: 'Green Points', icon: 'fas fa-leaf' },
                { key: 'training', label: 'Training', icon: 'fas fa-graduation-cap' },
                { key: 'leaderboard', label: 'Leaderboard', icon: 'fas fa-trophy' }
            ],
            'citizen': [
                ...commonItems,
                { key: 'complaints', label: 'My Complaints', icon: 'fas fa-exclamation-triangle' },
                { key: 'tracking', label: 'Vehicle Tracking', icon: 'fas fa-truck' },
                { key: 'training', label: 'Training', icon: 'fas fa-graduation-cap' },
                { key: 'shop', label: 'E-Commerce', icon: 'fas fa-shopping-cart' }
            ]
        };
        
        return roleSpecificItems[userRole] || commonItems;
    }
    
    loadDashboardContent(userRole, section = 'overview') {
        const content = document.getElementById('dashboardContent');
        
        // Update active sidebar item
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[onclick*="'${section}'"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Load content based on role and section
        switch (section) {
            case 'overview':
                content.innerHTML = this.generateOverview(userRole);
                break;
            case 'complaints':
                content.innerHTML = this.generateComplaints(userRole);
                break;
            case 'analytics':
                content.innerHTML = this.generateAnalytics();
                break;
            case 'heat-map':
                content.innerHTML = this.generateHeatMap();
                break;
            case 'tasks':
            case 'my-tasks':
                content.innerHTML = this.generateTasks(userRole);
                break;
            case 'workers':
                content.innerHTML = this.generateWorkers();
                break;
            case 'training':
                content.innerHTML = this.generateTraining(userRole);
                break;
            case 'tracking':
                content.innerHTML = this.generateTracking();
                break;
            case 'points':
                content.innerHTML = this.generateGreenPoints();
                break;
            case 'shop':
                content.innerHTML = this.generateShop();
                break;
            case 'reports':
                content.innerHTML = this.generateReports();
                break;
            default:
                content.innerHTML = this.generateOverview(userRole);
        }
    }
    
    generateOverview(userRole) {
        const analytics = this.data.getAnalytics();
        const complaints = this.data.getComplaints();
        
        let overview = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Dashboard Overview</h1>
                <p class="dashboard-subtitle">Welcome to the Smart Waste Management System</p>
            </div>
            
            <div class="stats-grid">
        `;
        
        // Role-specific stats
        if (userRole === 'superadmin' || userRole === 'admin') {
            overview += `
                ${this.ui.createStatCard('Total Complaints', analytics.totalComplaints, 'fas fa-clipboard-list', 'info')}
                ${this.ui.createStatCard('Pending', analytics.pendingComplaints, 'fas fa-clock', 'warning')}
                ${this.ui.createStatCard('In Progress', analytics.inProgressComplaints, 'fas fa-spinner', 'info')}
                ${this.ui.createStatCard('Resolved', analytics.resolvedComplaints, 'fas fa-check-circle', 'success')}
                ${this.ui.createStatCard('Active Workers', analytics.activeWorkers, 'fas fa-users', 'info')}
                ${this.ui.createStatCard('Avg Resolution', analytics.avgResolutionTime + 'h', 'fas fa-clock', 'info')}
            `;
        } else if (userRole === 'citizen') {
            const myComplaints = complaints.filter(c => c.citizenId === 'citizen');
            overview += `
                ${this.ui.createStatCard('My Complaints', myComplaints.length, 'fas fa-exclamation-triangle', 'info')}
                ${this.ui.createStatCard('Resolved', myComplaints.filter(c => c.status === 'resolved').length, 'fas fa-check-circle', 'success')}
                ${this.ui.createStatCard('Pending', myComplaints.filter(c => c.status === 'pending').length, 'fas fa-clock', 'warning')}
            `;
        } else if (userRole === 'worker') {
            const myTasks = complaints.filter(c => c.assignedTo === 'john-doe'); // Sample worker
            overview += `
                ${this.ui.createStatCard('My Tasks', myTasks.length, 'fas fa-tasks', 'info')}
                ${this.ui.createStatCard('Completed', myTasks.filter(c => c.status === 'resolved').length, 'fas fa-check-circle', 'success')}
                ${this.ui.createStatCard('In Progress', myTasks.filter(c => c.status === 'in-progress').length, 'fas fa-spinner', 'warning')}
            `;
        } else if (userRole === 'green-champion') {
            overview += `
                ${this.ui.createStatCard('Green Points', '1,250', 'fas fa-leaf', 'success')}
                ${this.ui.createStatCard('Complaints Filed', '8', 'fas fa-exclamation-triangle', 'info')}
                ${this.ui.createStatCard('Rank', '#3', 'fas fa-trophy', 'warning')}
            `;
        }
        
        overview += `
            </div>
            
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Recent Activity</h2>
                </div>
                ${this.ui.createComplaintTable(complaints.slice(0, 5), userRole)}
            </div>
        `;
        
        return overview;
    }
    
    generateComplaints(userRole) {
        const complaints = this.data.getComplaints();
        let filteredComplaints = complaints;
        
        if (userRole === 'citizen') {
            filteredComplaints = complaints.filter(c => c.citizenId === 'citizen');
        } else if (userRole === 'green-champion') {
            filteredComplaints = complaints.filter(c => c.citizenId === 'champion');
        }
        
        return `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Complaints Management</h1>
                <p class="dashboard-subtitle">Manage and track complaint resolution</p>
            </div>
            
            ${userRole === 'citizen' || userRole === 'green-champion' ? `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title">Submit New Complaint</h2>
                        <button class="btn btn-primary" onclick="openModal('complaintModal')">
                            <i class="fas fa-plus"></i> New Complaint
                        </button>
                    </div>
                </div>
            ` : ''}
            
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">All Complaints</h2>
                </div>
                ${this.ui.createComplaintTable(filteredComplaints, userRole)}
            </div>
        `;
    }
    
    generateAnalytics() {
        const analytics = this.data.getAnalytics();
        
        return `
            <div class="dashboard-header">
                <h1 class="dashboard-title">System Analytics</h1>
                <p class="dashboard-subtitle">Comprehensive system performance metrics</p>
            </div>
            
            <div class="stats-grid">
                ${this.ui.createStatCard('Total Complaints', analytics.totalComplaints, 'fas fa-clipboard-list', 'info', 12)}
                ${this.ui.createStatCard('Resolution Rate', analytics.resolutionRate + '%', 'fas fa-percentage', 'success', 8)}
                ${this.ui.createStatCard('Avg Resolution Time', analytics.avgResolutionTime + 'h', 'fas fa-clock', 'info', -5)}
                ${this.ui.createStatCard('Worker Rating', analytics.avgRating, 'fas fa-star', 'warning', 3)}
                ${this.ui.createStatCard('Urgent Cases', analytics.urgentComplaints, 'fas fa-exclamation-circle', 'error', 15)}
                ${this.ui.createStatCard('Active Workers', analytics.activeWorkers, 'fas fa-users', 'info', 0)}
            </div>
            
            <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title">Resolution Progress</h3>
                    </div>
                    <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--gray-500);">
                        📊 Chart visualization would be implemented here
                    </div>
                </div>
                
                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title">Complaint Types Distribution</h3>
                    </div>
                    <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: var(--gray-500);">
                        🥧 Pie chart would be implemented here
                    </div>
                </div>
            </div>
        `;
    }
    
    generateHeatMap() {
        const heatMapData = this.data.getHeatMapData();
        
        return `
            <div class="dashboard-header">
                <h1 class="dashboard-title">City Cleanliness Heat Map</h1>
                <p class="dashboard-subtitle">Visual representation of cleanliness across the city</p>
            </div>
            
            ${this.ui.createHeatMap(heatMapData)}
        `;
    }
    
    generateTasks(userRole) {
        const complaints = this.data.getComplaints();
        let tasks = complaints.filter(c => c.status === 'in-progress');
        
        if (userRole === 'worker') {
            tasks = complaints.filter(c => c.assignedTo === 'john-doe'); // Sample worker tasks
        }
        
        return `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Task Management</h1>
                <p class="dashboard-subtitle">Assign and track task completion</p>
            </div>
            
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">${userRole === 'worker' ? 'My Tasks' : 'Active Tasks'}</h2>
                </div>
                ${this.ui.createComplaintTable(tasks, userRole)}
            </div>
        `;
    }
    
    generateWorkers() {
        const workers = this.data.getWorkers();
        
        return `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Worker Management</h1>
                <p class="dashboard-subtitle">Manage workforce and track performance</p>
            </div>
            
            <div class="stats-grid">
                ${this.ui.createStatCard('Total Workers', workers.length, 'fas fa-users', 'info')}
                ${this.ui.createStatCard('Active', workers.filter(w => w.status === 'active').length, 'fas fa-user-check', 'success')}
                ${this.ui.createStatCard('Inactive', workers.filter(w => w.status === 'inactive').length, 'fas fa-user-times', 'warning')}
            </div>
            
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Worker Status</h2>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Tasks Completed</th>
                                <th>Rating</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${workers.map(worker => `
                                <tr>
                                    <td>${worker.name}</td>
                                    <td><span class="badge badge-${worker.status === 'active' ? 'resolved' : 'pending'}">${worker.status}</span></td>
                                    <td>${worker.tasksCompleted}</td>
                                    <td>⭐ ${worker.rating}</td>
                                    <td>📍 ${worker.location.lat.toFixed(4)}, ${worker.location.lng.toFixed(4)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    generateTraining(userRole) {
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
        
        const userModules = modules[userRole] || modules.citizen;
        
        return `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Training Modules</h1>
                <p class="dashboard-subtitle">Gamified learning experience</p>
            </div>
            
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Your Progress</h2>
                </div>
                <div class="cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    ${userModules.map(module => `
                        <div class="card">
                            <div class="card-body">
                                <h3>${module.title}</h3>
                                <p>Progress: ${module.progress}%</p>
                                ${this.ui.createProgressBar(module.progress, module.status === 'completed' ? 'success' : module.status === 'in-progress' ? 'warning' : 'info')}
                                <button class="btn ${module.status === 'completed' ? 'btn-success' : 'btn-primary'}" style="margin-top: 1rem;">
                                    ${module.status === 'completed' ? '✅ Completed' : module.status === 'in-progress' ? '▶️ Continue' : '🚀 Start'}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    generateTracking() {
        return `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Vehicle Tracking</h1>
                <p class="dashboard-subtitle">Real-time garbage collection vehicle locations</p>
            </div>
            
            <div class="card" style="margin-bottom: 2rem;">
                <div class="card-body">
                    <div style="height: 400px; background: var(--gray-100); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--gray-500);">
                        🗺️ Interactive map with vehicle locations would be implemented here
                        <br>
                        📍 Real-time GPS tracking integration
                    </div>
                </div>
            </div>
            
            <div class="content-section">
                <h2 class="section-title">Vehicle Status</h2>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Vehicle ID</th>
                                <th>Driver</th>
                                <th>Status</th>
                                <th>Current Location</th>
                                <th>ETA</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>GV-001</td>
                                <td>John Doe</td>
                                <td><span class="badge badge-in-progress">En Route</span></td>
                                <td>Main Street</td>
                                <td>5 minutes</td>
                            </tr>
                            <tr>
                                <td>GV-002</td>
                                <td>Jane Smith</td>
                                <td><span class="badge badge-resolved">Completed</span></td>
                                <td>Park Avenue</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    generateGreenPoints() {
        return `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Green Points</h1>
                <p class="dashboard-subtitle">Your environmental impact rewards</p>
            </div>
            
            <div class="stats-grid">
                ${this.ui.createStatCard('Total Points', '1,250', 'fas fa-leaf', 'success')}
                ${this.ui.createStatCard('This Month', '180', 'fas fa-calendar-month', 'info')}
                ${this.ui.createStatCard('Rank', '#3', 'fas fa-trophy', 'warning')}
                ${this.ui.createStatCard('Redeemable', '500', 'fas fa-coins', 'success')}
            </div>
            
            <div class="content-section">
                <h2 class="section-title">Recent Activities</h2>
                <div class="card">
                    <div class="card-body">
                        <div class="status-timeline">
                            <div class="timeline-item completed">
                                <div class="timeline-content">
                                    <strong>Complaint Verified</strong> - Overflowing bin report
                                    <div class="timeline-time">+50 points • 2 hours ago</div>
                                </div>
                            </div>
                            <div class="timeline-item completed">
                                <div class="timeline-content">
                                    <strong>Training Completed</strong> - Waste segregation module
                                    <div class="timeline-time">+100 points • 1 day ago</div>
                                </div>
                            </div>
                            <div class="timeline-item completed">
                                <div class="timeline-content">
                                    <strong>Community Event</strong> - Participated in cleanup drive
                                    <div class="timeline-time">+200 points • 3 days ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateShop() {
        const products = [
            { id: 1, name: 'Segregation Dustbin Set', price: '₹299', image: '🗑️' },
            { id: 2, name: 'Compost Bin', price: '₹199', image: '♻️' },
            { id: 3, name: 'Recycling Guide Book', price: '₹99', image: '📚' },
            { id: 4, name: 'Eco-friendly Bags', price: '₹149', image: '🛍️' }
        ];
        
        return `
            <div class="dashboard-header">
                <h1 class="dashboard-title">E-Commerce Store</h1>
                <p class="dashboard-subtitle">Essential waste management utilities</p>
            </div>
            
            <div class="cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                ${products.map(product => `
                    <div class="card">
                        <div class="card-body text-center">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">${product.image}</div>
                            <h3>${product.name}</h3>
                            <p style="font-size: 1.25rem; font-weight: 600; color: var(--primary-color); margin: 1rem 0;">
                                ${product.price}
                            </p>
                            <button class="btn btn-primary" style="width: 100%;">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    generateReports() {
        return `
            <div class="dashboard-header">
                <h1 class="dashboard-title">System Reports</h1>
                <p class="dashboard-subtitle">Comprehensive reporting and analytics</p>
            </div>
            
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Generate Reports</h2>
                </div>
                <div class="cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    <div class="card">
                        <div class="card-body">
                            <h3>📊 Performance Report</h3>
                            <p>Overall system performance and resolution metrics</p>
                            <button class="btn btn-primary">Generate Report</button>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h3>👥 Worker Performance</h3>
                            <p>Individual worker statistics and ratings</p>
                            <button class="btn btn-primary">Generate Report</button>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h3>🗺️ Area Analysis</h3>
                            <p>Geographical breakdown of complaints and resolutions</p>
                            <button class="btn btn-primary">Generate Report</button>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h3>📈 Trend Analysis</h3>
                            <p>Historical data trends and predictions</p>
                            <button class="btn btn-primary">Generate Report</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}