// Internationalization Module - Handles multi-language support
// Supports English and Hindi with extensible architecture

export class I18n {
  constructor() {
    this.currentLanguage = 'en';
    this.fallbackLanguage = 'en';
    this.translations = new Map();
    this.loadedLanguages = new Set();
    
    // Language detection
    this.detectLanguage();
  }

  /**
   * Initialize i18n system
   */
  async init() {
    // Load default language translations
    await this.loadLanguage(this.currentLanguage);
    
    // Apply translations to existing DOM elements
    this.translatePage();
    
    console.log(`✅ I18n initialized with language: ${this.currentLanguage}`);
  }

  /**
   * Detect user's preferred language
   */
  detectLanguage() {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('smart_waste_language');
    if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
      this.currentLanguage = savedLanguage;
      return;
    }
    
    // Check browser language
    const browserLanguage = navigator.language.split('-')[0];
    if (this.isLanguageSupported(browserLanguage)) {
      this.currentLanguage = browserLanguage;
      return;
    }
    
    // Check Accept-Language header languages
    const acceptLanguages = navigator.languages || [navigator.language];
    for (const lang of acceptLanguages) {
      const langCode = lang.split('-')[0];
      if (this.isLanguageSupported(langCode)) {
        this.currentLanguage = langCode;
        return;
      }
    }
    
    // Default to English
    this.currentLanguage = 'en';
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(langCode) {
    return ['en', 'hi'].includes(langCode);
  }

  /**
   * Load language translations
   */
  async loadLanguage(langCode) {
    if (this.loadedLanguages.has(langCode)) {
      return;
    }

    try {
      const translations = await this.getTranslations(langCode);
      this.translations.set(langCode, translations);
      this.loadedLanguages.add(langCode);
      
      console.log(`✅ Loaded translations for: ${langCode}`);
    } catch (error) {
      console.error(`Failed to load translations for ${langCode}:`, error);
      
      // Load fallback language if not already loaded
      if (langCode !== this.fallbackLanguage && !this.loadedLanguages.has(this.fallbackLanguage)) {
        await this.loadLanguage(this.fallbackLanguage);
      }
    }
  }

  /**
   * Get translations for a language
   * In production, this would load from external files or API
   */
  async getTranslations(langCode) {
    // Simulate async loading
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const translations = {
      en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.complaints': 'Complaints',
        'nav.track': 'Track Vehicle',
        'nav.shop': 'Shop',
        'nav.training': 'Training',
        'nav.attendance': 'Attendance',
        'nav.tasks': 'Tasks',
        'nav.heatmap': 'Heatmap',
        'nav.analytics': 'Analytics',
        
        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.warning': 'Warning',
        'common.info': 'Information',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.view': 'View',
        'common.submit': 'Submit',
        'common.close': 'Close',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.clear': 'Clear',
        'common.select': 'Select',
        'common.upload': 'Upload',
        'common.download': 'Download',
        'common.print': 'Print',
        'common.export': 'Export',
        'common.import': 'Import',
        'common.refresh': 'Refresh',
        'common.retry': 'Retry',
        'common.confirm': 'Confirm',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.ok': 'OK',
        
        // Authentication
        'auth.login': 'Login',
        'auth.logout': 'Logout',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.role': 'Role',
        'auth.selectRole': 'Select your role',
        'auth.citizen': 'Citizen',
        'auth.worker': 'Worker',
        'auth.admin': 'Admin',
        'auth.superadmin': 'Super Admin',
        'auth.loginButton': 'Sign In',
        'auth.loginSuccess': 'Login successful',
        'auth.loginError': 'Login failed',
        'auth.logoutSuccess': 'Logged out successfully',
        'auth.invalidCredentials': 'Invalid email or password',
        'auth.sessionExpired': 'Your session has expired',
        'auth.accessDenied': 'Access denied',
        
        // Profile
        'profile': 'Profile',
        'settings': 'Settings',
        
        // Dashboard
        'dashboard.welcome': 'Welcome back',
        'dashboard.overview': 'Overview',
        'dashboard.stats': 'Statistics',
        'dashboard.recentActivity': 'Recent Activity',
        'dashboard.quickActions': 'Quick Actions',
        
        // Complaints
        'complaints.title': 'Waste Management Complaints',
        'complaints.new': 'New Complaint',
        'complaints.submit': 'Submit Complaint',
        'complaints.category': 'Category',
        'complaints.description': 'Description',
        'complaints.location': 'Location',
        'complaints.photo': 'Photo',
        'complaints.status': 'Status',
        'complaints.priority': 'Priority',
        'complaints.assignedTo': 'Assigned To',
        'complaints.createdAt': 'Created At',
        'complaints.updatedAt': 'Updated At',
        'complaints.pending': 'Pending',
        'complaints.inProgress': 'In Progress',
        'complaints.resolved': 'Resolved',
        'complaints.rejected': 'Rejected',
        'complaints.high': 'High',
        'complaints.medium': 'Medium',
        'complaints.low': 'Low',
        'complaints.categories.garbage': 'Garbage Collection',
        'complaints.categories.sewage': 'Sewage',
        'complaints.categories.recycling': 'Recycling',
        'complaints.categories.illegal': 'Illegal Dumping',
        'complaints.categories.other': 'Other',
        'complaints.submitSuccess': 'Complaint submitted successfully',
        'complaints.submitError': 'Failed to submit complaint',
        'complaints.updateSuccess': 'Complaint updated successfully',
        'complaints.deleteSuccess': 'Complaint deleted successfully',
        'complaints.assignSuccess': 'Complaint assigned successfully',
        
        // Vehicle Tracking
        'tracking.title': 'Vehicle Tracking',
        'tracking.liveLocation': 'Live Location',
        'tracking.eta': 'Estimated Arrival',
        'tracking.route': 'Route',
        'tracking.vehicleInfo': 'Vehicle Information',
        'tracking.driverInfo': 'Driver Information',
        'tracking.status': 'Status',
        'tracking.online': 'Online',
        'tracking.offline': 'Offline',
        'tracking.enRoute': 'En Route',
        'tracking.arrived': 'Arrived',
        'tracking.collecting': 'Collecting',
        'tracking.completed': 'Completed',
        
        // Worker
        'worker.attendance': 'Attendance',
        'worker.tasks': 'My Tasks',
        'worker.markAttendance': 'Mark Attendance',
        'worker.biometric': 'Biometric',
        'worker.otp': 'OTP',
        'worker.faceCapture': 'Face Capture',
        'worker.otpSent': 'OTP sent to your phone',
        'worker.enterOtp': 'Enter OTP',
        'worker.attendanceMarked': 'Attendance marked successfully',
        'worker.taskAssigned': 'New task assigned',
        'worker.taskCompleted': 'Task completed',
        'worker.proofRequired': 'Proof of completion required',
        'worker.capturePhoto': 'Capture Photo',
        'worker.locationRequired': 'Location access required',
        
        // Admin
        'admin.manageComplaints': 'Manage Complaints',
        'admin.assignWorker': 'Assign Worker',
        'admin.verifyProof': 'Verify Proof',
        'admin.approvePhoto': 'Approve Photo',
        'admin.rejectPhoto': 'Reject Photo',
        'admin.photoMetadata': 'Photo Metadata',
        'admin.gpsCoordinates': 'GPS Coordinates',
        'admin.timestamp': 'Timestamp',
        'admin.deviceInfo': 'Device Information',
        
        // Analytics
        'analytics.title': 'Analytics Dashboard',
        'analytics.complaintTrends': 'Complaint Trends',
        'analytics.resolutionTime': 'Average Resolution Time',
        'analytics.workerPerformance': 'Worker Performance',
        'analytics.areaAnalysis': 'Area Analysis',
        'analytics.heatmap': 'Complaint Heatmap',
        'analytics.reports': 'Reports',
        'analytics.export': 'Export Data',
        
        // E-commerce
        'shop.title': 'Eco-Friendly Products',
        'shop.categories': 'Categories',
        'shop.cart': 'Shopping Cart',
        'shop.checkout': 'Checkout',
        'shop.addToCart': 'Add to Cart',
        'shop.removeFromCart': 'Remove from Cart',
        'shop.total': 'Total',
        'shop.orderPlaced': 'Order placed successfully',
        'shop.paymentFailed': 'Payment failed',
        
        // Training
        'training.title': 'Environmental Training',
        'training.modules': 'Training Modules',
        'training.progress': 'Progress',
        'training.certificate': 'Certificate',
        'training.completed': 'Completed',
        'training.inProgress': 'In Progress',
        'training.notStarted': 'Not Started',
        'training.startModule': 'Start Module',
        'training.continueModule': 'Continue Module',
        'training.moduleCompleted': 'Module completed successfully',
        
        // Notifications
        'notifications.title': 'Notifications',
        'notifications.markAllRead': 'Mark All as Read',
        'notifications.noNotifications': 'No notifications',
        'notifications.vehicleArriving': 'Vehicle arriving in 5 minutes',
        'notifications.vehicleArrived': 'Vehicle has arrived at your location',
        'notifications.complaintAssigned': 'Your complaint has been assigned',
        'notifications.complaintResolved': 'Your complaint has been resolved',
        'notifications.taskAssigned': 'New task assigned to you',
        'notifications.attendanceReminder': 'Don\'t forget to mark your attendance',
        
        // Errors
        'error.networkError': 'Network error. Please check your connection.',
        'error.serverError': 'Server error. Please try again later.',
        'error.unauthorized': 'You are not authorized to perform this action.',
        'error.notFound': 'The requested resource was not found.',
        'error.validationError': 'Please check your input and try again.',
        'error.fileUploadError': 'Failed to upload file.',
        'error.locationError': 'Failed to get your location.',
        'error.cameraError': 'Failed to access camera.',
        'error.biometricError': 'Biometric authentication failed.',
        'error.otpError': 'Invalid or expired OTP.',
        
        // Success messages
        'success.dataSaved': 'Data saved successfully',
        'success.fileUploaded': 'File uploaded successfully',
        'success.locationUpdated': 'Location updated successfully',
        'success.photoApproved': 'Photo approved successfully',
        'success.taskCompleted': 'Task completed successfully',
        'success.attendanceMarked': 'Attendance marked successfully',
        
        // Offline
        'offline.title': 'You are offline',
        'offline.message': 'Some features may be limited while offline.',
        'offline.dataWillSync': 'Your data will sync when connection is restored.',
        
        // Privacy and Security
        'privacy.biometricConsent': 'Biometric Data Consent',
        'privacy.biometricNotice': 'This app uses biometric authentication for attendance. Your biometric data will be processed locally and not stored permanently.',
        'privacy.gpsConsent': 'Location Access',
        'privacy.gpsNotice': 'This app requires location access to verify task completion and provide accurate services.',
        'privacy.dataProtection': 'Your data is protected according to privacy regulations.',
        'privacy.consentGranted': 'Consent granted',
        'privacy.consentRevoked': 'Consent revoked',
        
        // Developer Panel
        'dev.title': 'Developer Panel',
        'dev.simulateArea': 'Simulate Area',
        'dev.createFakeComplaint': 'Create Fake Complaint',
        'dev.simulateWorkerLocation': 'Simulate Worker Location',
        'dev.triggerNotification': 'Trigger Notification',
        'dev.clearData': 'Clear All Data',
        'dev.exportLogs': 'Export Logs',
        'dev.apiStatus': 'API Status',
        'dev.mockMode': 'Mock Mode',
        'dev.realMode': 'Real Mode'
      },
      
      hi: {
        // Navigation (Hindi)
        'nav.dashboard': 'डैशबोर्ड',
        'nav.complaints': 'शिकायतें',
        'nav.track': 'वाहन ट्रैक करें',
        'nav.shop': 'दुकान',
        'nav.training': 'प्रशिक्षण',
        'nav.attendance': 'उपस्थिति',
        'nav.tasks': 'कार्य',
        'nav.heatmap': 'हीटमैप',
        'nav.analytics': 'विश्लेषण',
        
        // Common (Hindi)
        'common.loading': 'लोड हो रहा है...',
        'common.error': 'त्रुटि',
        'common.success': 'सफलता',
        'common.warning': 'चेतावनी',
        'common.info': 'जानकारी',
        'common.save': 'सेव करें',
        'common.cancel': 'रद्द करें',
        'common.delete': 'हटाएं',
        'common.edit': 'संपादित करें',
        'common.view': 'देखें',
        'common.submit': 'जमा करें',
        'common.close': 'बंद करें',
        'common.back': 'वापस',
        'common.next': 'अगला',
        'common.previous': 'पिछला',
        'common.search': 'खोजें',
        'common.filter': 'फिल्टर',
        'common.clear': 'साफ करें',
        'common.select': 'चुनें',
        'common.upload': 'अपलोड करें',
        'common.download': 'डाउनलोड करें',
        'common.print': 'प्रिंट करें',
        'common.export': 'निर्यात करें',
        'common.import': 'आयात करें',
        'common.refresh': 'रीफ्रेश करें',
        'common.retry': 'पुनः प्रयास करें',
        'common.confirm': 'पुष्टि करें',
        'common.yes': 'हाँ',
        'common.no': 'नहीं',
        'common.ok': 'ठीक है',
        
        // Authentication (Hindi)
        'auth.login': 'लॉगिन',
        'auth.logout': 'लॉगआउट',
        'auth.email': 'ईमेल',
        'auth.password': 'पासवर्ड',
        'auth.role': 'भूमिका',
        'auth.selectRole': 'अपनी भूमिका चुनें',
        'auth.citizen': 'नागरिक',
        'auth.worker': 'कर्मचारी',
        'auth.admin': 'प्रशासक',
        'auth.superadmin': 'सुपर प्रशासक',
        'auth.loginButton': 'साइन इन करें',
        'auth.loginSuccess': 'लॉगिन सफल',
        'auth.loginError': 'लॉगिन असफल',
        'auth.logoutSuccess': 'सफलतापूर्वक लॉगआउट',
        'auth.invalidCredentials': 'गलत ईमेल या पासवर्ड',
        'auth.sessionExpired': 'आपका सत्र समाप्त हो गया है',
        'auth.accessDenied': 'पहुंच अस्वीकृत',
        
        // Profile (Hindi)
        'profile': 'प्रोफाइल',
        'settings': 'सेटिंग्स',
        
        // Dashboard (Hindi)
        'dashboard.welcome': 'वापसी पर स्वागत है',
        'dashboard.overview': 'अवलोकन',
        'dashboard.stats': 'आंकड़े',
        'dashboard.recentActivity': 'हाल की गतिविधि',
        'dashboard.quickActions': 'त्वरित कार्य',
        
        // Complaints (Hindi)
        'complaints.title': 'अपशिष्ट प्रबंधन शिकायतें',
        'complaints.new': 'नई शिकायत',
        'complaints.submit': 'शिकायत दर्ज करें',
        'complaints.category': 'श्रेणी',
        'complaints.description': 'विवरण',
        'complaints.location': 'स्थान',
        'complaints.photo': 'फोटो',
        'complaints.status': 'स्थिति',
        'complaints.priority': 'प्राथमिकता',
        'complaints.assignedTo': 'सौंपा गया',
        'complaints.createdAt': 'बनाया गया',
        'complaints.updatedAt': 'अपडेट किया गया',
        'complaints.pending': 'लंबित',
        'complaints.inProgress': 'प्रगति में',
        'complaints.resolved': 'हल हो गया',
        'complaints.rejected': 'अस्वीकृत',
        'complaints.high': 'उच्च',
        'complaints.medium': 'मध्यम',
        'complaints.low': 'कम',
        'complaints.categories.garbage': 'कचरा संग्रह',
        'complaints.categories.sewage': 'सीवेज',
        'complaints.categories.recycling': 'रीसाइक्लिंग',
        'complaints.categories.illegal': 'अवैध डंपिंग',
        'complaints.categories.other': 'अन्य',
        'complaints.submitSuccess': 'शिकायत सफलतापूर्वक दर्ज की गई',
        'complaints.submitError': 'शिकायत दर्ज करने में असफल',
        'complaints.updateSuccess': 'शिकायत सफलतापूर्वक अपडेट की गई',
        'complaints.deleteSuccess': 'शिकायत सफलतापूर्वक हटाई गई',
        'complaints.assignSuccess': 'शिकायत सफलतापूर्वक सौंपी गई',
        
        // Vehicle Tracking (Hindi)
        'tracking.title': 'वाहन ट्रैकिंग',
        'tracking.liveLocation': 'लाइव लोकेशन',
        'tracking.eta': 'अनुमानित आगमन',
        'tracking.route': 'मार्ग',
        'tracking.vehicleInfo': 'वाहन की जानकारी',
        'tracking.driverInfo': 'ड्राइवर की जानकारी',
        'tracking.status': 'स्थिति',
        'tracking.online': 'ऑनलाइन',
        'tracking.offline': 'ऑफलाइन',
        'tracking.enRoute': 'रास्ते में',
        'tracking.arrived': 'पहुंच गया',
        'tracking.collecting': 'संग्रह कर रहा है',
        'tracking.completed': 'पूर्ण',
        
        // Add more Hindi translations as needed...
        // For brevity, I'm including key translations. In production,
        // all strings would be translated.
      }
    };
    
    return translations[langCode] || translations[this.fallbackLanguage];
  }

  /**
   * Change current language
   */
  async changeLanguage(langCode) {
    if (!this.isLanguageSupported(langCode)) {
      console.warn(`Language ${langCode} is not supported`);
      return false;
    }
    
    // Load language if not already loaded
    await this.loadLanguage(langCode);
    
    // Update current language
    this.currentLanguage = langCode;
    
    // Save to localStorage
    localStorage.setItem('smart_waste_language', langCode);
    
    // Update page translations
    this.translatePage();
    
    // Update document language attribute
    document.documentElement.lang = langCode;
    
    // Dispatch language change event
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: langCode }
    }));
    
    console.log(`✅ Language changed to: ${langCode}`);
    return true;
  }

  /**
   * Get translation for a key
   */
  t(key, params = {}) {
    const translations = this.translations.get(this.currentLanguage) || 
                        this.translations.get(this.fallbackLanguage) || {};
    
    let translation = translations[key];
    
    // If translation not found, try fallback language
    if (!translation && this.currentLanguage !== this.fallbackLanguage) {
      const fallbackTranslations = this.translations.get(this.fallbackLanguage) || {};
      translation = fallbackTranslations[key];
    }
    
    // If still not found, return key
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    
    // Replace parameters in translation
    return this.interpolate(translation, params);
  }

  /**
   * Interpolate parameters in translation string
   */
  interpolate(text, params) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Translate all elements on the page
   */
  translatePage() {
    // Translate elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Update text content
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.type === 'submit' || element.type === 'button') {
          element.value = translation;
        } else {
          element.placeholder = translation;
        }
      } else {
        element.textContent = translation;
      }
    });
    
    // Translate elements with data-i18n-title attribute
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });
    
    // Translate elements with data-i18n-aria-label attribute
    const ariaElements = document.querySelectorAll('[data-i18n-aria-label]');
    ariaElements.forEach(element => {
      const key = element.getAttribute('data-i18n-aria-label');
      element.setAttribute('aria-label', this.t(key));
    });
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
    ];
  }

  /**
   * Get language direction (LTR/RTL)
   */
  getLanguageDirection(langCode = this.currentLanguage) {
    // Hindi is LTR, but this method allows for RTL languages in the future
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(langCode) ? 'rtl' : 'ltr';
  }

  /**
   * Format number according to current locale
   */
  formatNumber(number, options = {}) {
    const locale = this.getLocale();
    return new Intl.NumberFormat(locale, options).format(number);
  }

  /**
   * Format date according to current locale
   */
  formatDate(date, options = {}) {
    const locale = this.getLocale();
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  /**
   * Format currency according to current locale
   */
  formatCurrency(amount, currency = 'INR') {
    const locale = this.getLocale();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Get locale string for current language
   */
  getLocale() {
    const localeMap = {
      'en': 'en-US',
      'hi': 'hi-IN'
    };
    
    return localeMap[this.currentLanguage] || 'en-US';
  }

  /**
   * Pluralization helper
   */
  plural(key, count, params = {}) {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    return this.t(pluralKey, { ...params, count });
  }

  /**
   * Create language switcher component
   */
  createLanguageSwitcher(container) {
    const languages = this.getAvailableLanguages();
    
    const select = document.createElement('select');
    select.className = 'language-switcher';
    select.setAttribute('aria-label', this.t('common.selectLanguage'));
    
    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.nativeName;
      option.selected = lang.code === this.currentLanguage;
      select.appendChild(option);
    });
    
    select.addEventListener('change', (event) => {
      this.changeLanguage(event.target.value);
    });
    
    container.appendChild(select);
    
    return select;
  }
}