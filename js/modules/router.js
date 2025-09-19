// Router Module - Client-side routing for SPA functionality
// Handles navigation, route guards, and dynamic content loading

export class Router {
  constructor(auth, i18n, toast, modal) {
    this.auth = auth;
    this.i18n = i18n;
    this.toast = toast;
    this.modal = modal;
    this.routes = new Map();
    this.currentRoute = null;
    this.isNavigating = false;
    
    // Bind methods
    this.handlePopState = this.handlePopState.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
  }

  /**
   * Initialize router
   */
  async init() {
    // Register routes
    this.registerRoutes();
    
    // Setup event listeners
    window.addEventListener('popstate', this.handlePopState);
    document.addEventListener('click', this.handleLinkClick);
    
    // Handle initial route
    await this.handleRoute(window.location.pathname);
    
    console.log('✅ Router initialized');
  }

  /**
   * Register all application routes
   */
  registerRoutes() {
    // Public routes
    this.routes.set('/', {
      component: () => import('../pages/login.js'),
      requiresAuth: false,
      roles: []
    });
    
    this.routes.set('/login', {
      component: () => import('../pages/login.js'),
      requiresAuth: false,
      roles: []
    });
    
    // Citizen routes
    this.routes.set('/citizen/dashboard', {
      component: () => import('../pages/citizen-dashboard.js'),
      requiresAuth: true,
      roles: ['citizen']
    });
    
    this.routes.set('/citizen/complaints', {
      component: () => import('../pages/citizen-complaints.js'),
      requiresAuth: true,
      roles: ['citizen']
    });
    
    this.routes.set('/citizen/track', {
      component: () => import('../pages/citizen-track.js'),
      requiresAuth: true,
      roles: ['citizen']
    });
    
    this.routes.set('/citizen/shop', {
      component: () => import('../pages/citizen-shop.js'),
      requiresAuth: true,
      roles: ['citizen']
    });
    
    this.routes.set('/citizen/training', {
      component: () => import('../pages/citizen-training.js'),
      requiresAuth: true,
      roles: ['citizen']
    });
    
    // Worker routes
    this.routes.set('/worker/dashboard', {
      component: () => import('../pages/worker-dashboard.js'),
      requiresAuth: true,
      roles: ['worker']
    });
    
    this.routes.set('/worker/attendance', {
      component: () => import('../pages/worker-attendance.js'),
      requiresAuth: true,
      roles: ['worker']
    });
    
    this.routes.set('/worker/tasks', {
      component: () => import('../pages/worker-tasks.js'),
      requiresAuth: true,
      roles: ['worker']
    });
    
    // Admin routes
    this.routes.set('/admin/dashboard', {
      component: () => import('../pages/admin-dashboard.js'),
      requiresAuth: true,
      roles: ['admin', 'superadmin']
    });
    
    this.routes.set('/admin/complaints', {
      component: () => import('../pages/admin-complaints.js'),
      requiresAuth: true,
      roles: ['admin', 'superadmin']
    });
    
    this.routes.set('/admin/heatmap', {
      component: () => import('../pages/admin-heatmap.js'),
      requiresAuth: true,
      roles: ['admin', 'superadmin']
    });
    
    // Superadmin routes
    this.routes.set('/superadmin/dashboard', {
      component: () => import('../pages/superadmin-dashboard.js'),
      requiresAuth: true,
      roles: ['superadmin']
    });
    
    this.routes.set('/superadmin/analytics', {
      component: () => import('../pages/superadmin-analytics.js'),
      requiresAuth: true,
      roles: ['superadmin']
    });
    
    // Developer panel (for testing)
    this.routes.set('/dev', {
      component: () => import('../pages/dev-panel.js'),
      requiresAuth: false,
      roles: []
    });
  }

  /**
   * Navigate to a route
   */
  async navigate(path, replace = false) {
    if (this.isNavigating) {
      return;
    }
    
    this.isNavigating = true;
    
    try {
      // Update browser history
      if (replace) {
        window.history.replaceState(null, '', path);
      } else {
        window.history.pushState(null, '', path);
      }
      
      // Handle the route
      await this.handleRoute(path);
      
    } catch (error) {
      console.error('Navigation error:', error);
      this.toast.show('Navigation Error', 'Failed to navigate to the requested page', 'error');
    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * Handle route changes
   */
  async handleRoute(path) {
    const route = this.routes.get(path) || this.routes.get('/404');
    
    if (!route) {
      console.error('Route not found:', path);
      return this.navigate('/login', true);
    }
    
    // Check authentication
    if (route.requiresAuth && !this.auth.isAuthenticated()) {
      this.toast.show('Authentication Required', 'Please log in to access this page', 'warning');
      return this.navigate('/login', true);
    }
    
    // Check role authorization
    if (route.roles.length > 0 && !this.hasRequiredRole(route.roles)) {
      this.toast.show('Access Denied', 'You do not have permission to access this page', 'error');
      return this.navigate(this.getDefaultRouteForRole(), true);
    }
    
    try {
      // Load and render the component
      const module = await route.component();
      const component = new module.default(this.auth, this.i18n, this.toast, this.modal, this);
      
      // Update navigation
      this.updateNavigation(path);
      
      // Render the component
      await component.render();
      
      this.currentRoute = path;
      
    } catch (error) {
      console.error('Error loading route component:', error);
      this.toast.show('Loading Error', 'Failed to load the requested page', 'error');
    }
  }

  /**
   * Check if user has required role
   */
  hasRequiredRole(requiredRoles) {
    const userRole = this.auth.getUserRole();
    return requiredRoles.includes(userRole);
  }

  /**
   * Get default route for user role
   */
  getDefaultRouteForRole() {
    const role = this.auth.getUserRole();
    
    switch (role) {
      case 'citizen':
        return '/citizen/dashboard';
      case 'worker':
        return '/worker/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'superadmin':
        return '/superadmin/dashboard';
      default:
        return '/login';
    }
  }

  /**
   * Update navigation UI
   */
  updateNavigation(currentPath) {
    const sidebar = document.getElementById('sidebar');
    const navMenu = sidebar.querySelector('.nav-menu');
    
    // Clear existing navigation
    navMenu.innerHTML = '';
    
    // Get navigation items for current user role
    const navItems = this.getNavigationItems();
    
    // Render navigation items
    navItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'nav-item';
      
      const a = document.createElement('a');
      a.href = item.path;
      a.className = `nav-link ${currentPath === item.path ? 'active' : ''}`;
      a.setAttribute('data-route', item.path);
      a.innerHTML = `
        ${item.icon}
        <span data-i18n="${item.labelKey}">${item.label}</span>
      `;
      
      li.appendChild(a);
      navMenu.appendChild(li);
    });
    
    // Update page title
    document.title = this.getPageTitle(currentPath);
  }

  /**
   * Get navigation items based on user role
   */
  getNavigationItems() {
    const role = this.auth.getUserRole();
    
    const navigationMap = {
      citizen: [
        {
          path: '/citizen/dashboard',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
          label: 'Dashboard',
          labelKey: 'nav.dashboard'
        },
        {
          path: '/citizen/complaints',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>',
          label: 'Complaints',
          labelKey: 'nav.complaints'
        },
        {
          path: '/citizen/track',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
          label: 'Track Vehicle',
          labelKey: 'nav.track'
        },
        {
          path: '/citizen/shop',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
          label: 'Shop',
          labelKey: 'nav.shop'
        },
        {
          path: '/citizen/training',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
          label: 'Training',
          labelKey: 'nav.training'
        }
      ],
      worker: [
        {
          path: '/worker/dashboard',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
          label: 'Dashboard',
          labelKey: 'nav.dashboard'
        },
        {
          path: '/worker/attendance',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
          label: 'Attendance',
          labelKey: 'nav.attendance'
        },
        {
          path: '/worker/tasks',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>',
          label: 'Tasks',
          labelKey: 'nav.tasks'
        }
      ],
      admin: [
        {
          path: '/admin/dashboard',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
          label: 'Dashboard',
          labelKey: 'nav.dashboard'
        },
        {
          path: '/admin/complaints',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>',
          label: 'Complaints',
          labelKey: 'nav.complaints'
        },
        {
          path: '/admin/heatmap',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
          label: 'Heatmap',
          labelKey: 'nav.heatmap'
        }
      ],
      superadmin: [
        {
          path: '/superadmin/dashboard',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
          label: 'Dashboard',
          labelKey: 'nav.dashboard'
        },
        {
          path: '/superadmin/analytics',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>',
          label: 'Analytics',
          labelKey: 'nav.analytics'
        },
        {
          path: '/admin/complaints',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>',
          label: 'Complaints',
          labelKey: 'nav.complaints'
        },
        {
          path: '/admin/heatmap',
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
          label: 'Heatmap',
          labelKey: 'nav.heatmap'
        }
      ]
    };
    
    return navigationMap[role] || [];
  }

  /**
   * Get page title for route
   */
  getPageTitle(path) {
    const titleMap = {
      '/': 'Smart Waste Management System',
      '/login': 'Login - Smart Waste Management',
      '/citizen/dashboard': 'Citizen Dashboard - Smart Waste Management',
      '/citizen/complaints': 'My Complaints - Smart Waste Management',
      '/citizen/track': 'Track Vehicle - Smart Waste Management',
      '/citizen/shop': 'Shop - Smart Waste Management',
      '/citizen/training': 'Training - Smart Waste Management',
      '/worker/dashboard': 'Worker Dashboard - Smart Waste Management',
      '/worker/attendance': 'Attendance - Smart Waste Management',
      '/worker/tasks': 'My Tasks - Smart Waste Management',
      '/admin/dashboard': 'Admin Dashboard - Smart Waste Management',
      '/admin/complaints': 'Manage Complaints - Smart Waste Management',
      '/admin/heatmap': 'Heatmap - Smart Waste Management',
      '/superadmin/dashboard': 'Super Admin Dashboard - Smart Waste Management',
      '/superadmin/analytics': 'Analytics - Smart Waste Management',
      '/dev': 'Developer Panel - Smart Waste Management'
    };
    
    return titleMap[path] || 'Smart Waste Management System';
  }

  /**
   * Handle browser back/forward buttons
   */
  async handlePopState(event) {
    await this.handleRoute(window.location.pathname);
  }

  /**
   * Handle link clicks for SPA navigation
   */
  handleLinkClick(event) {
    const link = event.target.closest('a[data-route]');
    
    if (link) {
      event.preventDefault();
      const path = link.getAttribute('data-route') || link.getAttribute('href');
      this.navigate(path);
    }
  }

  /**
   * Get current route
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Check if route exists
   */
  routeExists(path) {
    return this.routes.has(path);
  }
}