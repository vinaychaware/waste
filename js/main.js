// Smart Waste Management System - Main Application Entry Point

import { Router } from './modules/router.js';
import { AuthManager } from './modules/auth.js';
import { I18n } from './modules/i18n.js';
import { ToastManager } from './components/toast.js';
import { ModalManager } from './components/modal.js';
import { Utils } from './modules/utils.js';

/**
 * Main Application Class
 * Handles application initialization, service worker registration,
 * and global event management
 */
class SmartWasteApp {
  constructor() {
    this.router = null;
    this.auth = null;
    this.i18n = null;
    this.toast = null;
    this.modal = null;
    this.isInitialized = false;
    
    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing Smart Waste Management System...');
      
      // Show loading screen
      this.showLoadingScreen();
      
      // Initialize core services
      await this.initializeServices();
      
      // Register service worker for PWA functionality
      await this.registerServiceWorker();
      
      // Setup global event listeners
      this.setupEventListeners();
      
      // Initialize UI components
      this.initializeUI();
      
      // Initialize router and handle initial route
      await this.initializeRouter();
      
      // Hide loading screen
      this.hideLoadingScreen();
      
      this.isInitialized = true;
      console.log('✅ Application initialized successfully');
      
      // Show welcome message for first-time users
      this.showWelcomeMessage();
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize core services
   */
  async initializeServices() {
    // Initialize internationalization
    this.i18n = new I18n();
    await this.i18n.init();
    
    // Initialize authentication manager
    this.auth = new AuthManager();
    await this.auth.init();
    
    // Initialize toast notifications
    this.toast = new ToastManager();
    
    // Initialize modal manager
    this.modal = new ModalManager();
    
    console.log('✅ Core services initialized');
  }

  /**
   * Register service worker for PWA functionality
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailableNotification();
            }
          });
        });
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event);
        });
        
      } catch (error) {
        console.warn('⚠️ Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Window events
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    
    // Handle errors
    window.addEventListener('error', this.handleGlobalError.bind(this));
    
    console.log('✅ Global event listeners setup');
  }

  /**
   * Initialize UI components
   */
  initializeUI() {
    // Setup mobile menu toggle
    this.setupMobileMenu();
    
    // Setup user menu
    this.setupUserMenu();
    
    // Setup notifications
    this.setupNotifications();
    
    // Apply initial theme
    this.applyTheme();
    
    console.log('✅ UI components initialized');
  }

  /**
   * Initialize router
   */
  async initializeRouter() {
    this.router = new Router(this.auth, this.i18n, this.toast, this.modal);
    await this.router.init();
    console.log('✅ Router initialized');
  }

  /**
   * Setup mobile menu functionality
   */
  setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        const isOpen = sidebar.classList.contains('mobile-open');
        
        if (isOpen) {
          this.closeMobileMenu();
        } else {
          this.openMobileMenu();
        }
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('mobile-open') &&
            !sidebar.contains(event.target) &&
            !menuToggle.contains(event.target)) {
          this.closeMobileMenu();
        }
      });
    }
  }

  /**
   * Open mobile menu
   */
  openMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    
    menuToggle?.classList.add('active');
    sidebar?.classList.add('mobile-open');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay show';
    overlay.addEventListener('click', () => this.closeMobileMenu());
    document.body.appendChild(overlay);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    menuToggle?.classList.remove('active');
    sidebar?.classList.remove('mobile-open');
    overlay?.remove();
    
    // Restore body scroll
    document.body.style.overflow = '';
  }

  /**
   * Setup user menu functionality
   */
  setupUserMenu() {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        userDropdown.classList.toggle('hidden');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        userDropdown.classList.add('hidden');
      });
      
      // Prevent dropdown from closing when clicking inside
      userDropdown.addEventListener('click', (event) => {
        event.stopPropagation();
      });
    }
    
    // Handle logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleLogout();
      });
    }
  }

  /**
   * Setup notifications
   */
  setupNotifications() {
    const notificationsBtn = document.getElementById('notifications-btn');
    
    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', () => {
        this.showNotificationsPanel();
      });
    }
    
    // Request notification permission
    this.requestNotificationPermission();
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      } catch (error) {
        console.warn('Failed to request notification permission:', error);
      }
    }
  }

  /**
   * Apply theme
   */
  applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Close mobile menu on desktop
    if (window.innerWidth > 768) {
      this.closeMobileMenu();
    }
    
    // Trigger resize event for charts and maps
    window.dispatchEvent(new Event('app:resize'));
  }

  /**
   * Handle online status
   */
  handleOnline() {
    console.log('📶 Connection restored');
    this.toast.show('Connection restored', 'You are back online', 'success');
    
    // Trigger sync for offline data
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('complaint-sync');
        registration.sync.register('attendance-sync');
      });
    }
    
    // Update UI to reflect online status
    document.body.classList.remove('offline');
    window.dispatchEvent(new Event('app:online'));
  }

  /**
   * Handle offline status
   */
  handleOffline() {
    console.log('📵 Connection lost');
    this.toast.show('Connection lost', 'You are now offline. Some features may be limited.', 'warning');
    
    // Update UI to reflect offline status
    document.body.classList.add('offline');
    window.dispatchEvent(new Event('app:offline'));
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      console.log('📱 App hidden');
    } else {
      console.log('📱 App visible');
      // Refresh data when app becomes visible
      window.dispatchEvent(new Event('app:visible'));
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.openGlobalSearch();
    }
    
    // Escape key to close modals/dropdowns
    if (event.key === 'Escape') {
      this.closeAllOverlays();
    }
    
    // Alt + M for mobile menu toggle
    if (event.altKey && event.key === 'm') {
      event.preventDefault();
      const menuToggle = document.getElementById('menu-toggle');
      menuToggle?.click();
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Show user-friendly error message
    this.toast.show(
      'Something went wrong',
      'An unexpected error occurred. Please try again.',
      'error'
    );
    
    // Prevent default browser error handling
    event.preventDefault();
  }

  /**
   * Handle global errors
   */
  handleGlobalError(event) {
    console.error('Global error:', event.error);
    
    // Show user-friendly error message
    this.toast.show(
      'Application Error',
      'An error occurred. Please refresh the page if the problem persists.',
      'error'
    );
  }

  /**
   * Handle service worker messages
   */
  handleServiceWorkerMessage(event) {
    const { type, data } = event.data;
    
    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated');
        break;
      case 'BACKGROUND_SYNC':
        console.log('Background sync completed');
        this.toast.show('Sync Complete', 'Your offline data has been synchronized', 'success');
        break;
      case 'PUSH_NOTIFICATION':
        this.handlePushNotification(data);
        break;
      default:
        console.log('Unknown service worker message:', event.data);
    }
  }

  /**
   * Handle push notifications
   */
  handlePushNotification(data) {
    // Update notification badge
    const badge = document.getElementById('notification-badge');
    if (badge) {
      const count = parseInt(badge.textContent) + 1;
      badge.textContent = count;
      badge.classList.remove('hidden');
    }
    
    // Show in-app notification
    this.toast.show(data.title || 'Notification', data.body || 'You have a new notification', 'info');
  }

  /**
   * Show loading screen
   */
  showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.remove('hidden');
    }
  }

  /**
   * Hide loading screen
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 500);
    }
  }

  /**
   * Show welcome message for first-time users
   */
  showWelcomeMessage() {
    const isFirstVisit = !localStorage.getItem('hasVisited');
    
    if (isFirstVisit) {
      setTimeout(() => {
        this.toast.show(
          'Welcome to Smart Waste Management!',
          'Explore the features and start managing waste efficiently.',
          'info',
          5000
        );
        localStorage.setItem('hasVisited', 'true');
      }, 1000);
    }
  }

  /**
   * Show update available notification
   */
  showUpdateAvailableNotification() {
    const updateToast = this.toast.show(
      'Update Available',
      'A new version is available. Click to update.',
      'info',
      0, // Don't auto-hide
      () => {
        // Reload to activate new service worker
        window.location.reload();
      }
    );
  }

  /**
   * Handle logout
   */
  async handleLogout() {
    try {
      await this.auth.logout();
      this.toast.show('Logged out', 'You have been successfully logged out', 'success');
      this.router.navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      this.toast.show('Logout failed', 'Failed to logout. Please try again.', 'error');
    }
  }

  /**
   * Open global search
   */
  openGlobalSearch() {
    // Implementation for global search functionality
    console.log('Opening global search...');
    // This would open a search modal or focus search input
  }

  /**
   * Close all overlays (modals, dropdowns, etc.)
   */
  closeAllOverlays() {
    // Close user dropdown
    const userDropdown = document.getElementById('user-dropdown');
    userDropdown?.classList.add('hidden');
    
    // Close mobile menu
    this.closeMobileMenu();
    
    // Close any open modals
    this.modal.closeAll();
    
    // Close any open dropdowns
    document.querySelectorAll('.dropdown.open').forEach(dropdown => {
      dropdown.classList.remove('open');
    });
  }

  /**
   * Show notifications panel
   */
  showNotificationsPanel() {
    // Implementation for notifications panel
    console.log('Opening notifications panel...');
    // This would show a notifications sidebar or modal
  }

  /**
   * Handle initialization error
   */
  handleInitializationError(error) {
    // Hide loading screen
    this.hideLoadingScreen();
    
    // Show error message
    const errorHtml = `
      <div class="error-container">
        <div class="error-content">
          <h1>Failed to Load Application</h1>
          <p>We're sorry, but the application failed to initialize properly.</p>
          <p class="error-details">${error.message}</p>
          <button onclick="window.location.reload()" class="btn btn-primary">
            Reload Application
          </button>
        </div>
      </div>
    `;
    
    document.body.innerHTML = errorHtml;
  }

  /**
   * Get application instance (singleton pattern)
   */
  static getInstance() {
    if (!SmartWasteApp.instance) {
      SmartWasteApp.instance = new SmartWasteApp();
    }
    return SmartWasteApp.instance;
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = SmartWasteApp.getInstance();
  await app.init();
});

// Export for use in other modules
export { SmartWasteApp };