// Authentication Module - Handles user authentication and authorization
// Implements JWT-based authentication with role-based access control

export class AuthManager {
  constructor() {
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.refreshTimer = null;
    
    // Security note: In production, tokens should be stored in httpOnly cookies
    // or secure in-memory storage. localStorage is used here for demo purposes only.
    // For biometric data and sensitive information, implement proper encryption
    // and follow GDPR/Indian privacy regulations.
  }

  /**
   * Initialize authentication manager
   */
  async init() {
    // Load stored authentication data
    this.loadStoredAuth();
    
    // Setup automatic token refresh
    this.setupTokenRefresh();
    
    console.log('✅ Auth manager initialized');
  }

  /**
   * Load stored authentication data from localStorage
   * Security note: This is for demo purposes only. In production,
   * use secure storage mechanisms and implement proper token validation.
   */
  loadStoredAuth() {
    try {
      const storedAuth = localStorage.getItem('smart_waste_auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        
        // Validate token expiry
        if (authData.tokenExpiry && new Date(authData.tokenExpiry) > new Date()) {
          this.user = authData.user;
          this.token = authData.token;
          this.refreshToken = authData.refreshToken;
          this.tokenExpiry = new Date(authData.tokenExpiry);
          
          console.log('✅ Restored authentication session');
        } else {
          // Token expired, clear stored data
          this.clearStoredAuth();
          console.log('⚠️ Stored token expired, cleared session');
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      this.clearStoredAuth();
    }
  }

  /**
   * Store authentication data
   * Security note: In production, implement proper encryption for sensitive data
   */
  storeAuth() {
    try {
      const authData = {
        user: this.user,
        token: this.token,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry?.toISOString()
      };
      
      localStorage.setItem('smart_waste_auth', JSON.stringify(authData));
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }

  /**
   * Clear stored authentication data
   */
  clearStoredAuth() {
    localStorage.removeItem('smart_waste_auth');
    
    // Clear biometric data if stored (following privacy regulations)
    localStorage.removeItem('smart_waste_biometric_consent');
    
    // Clear any cached sensitive data
    if ('caches' in window) {
      caches.delete('smart-waste-user-data');
    }
  }

  /**
   * Login with email and password
   */
  async login(email, password, role) {
    try {
      // For demo purposes, simulate API call with mock authentication
      const mockResponse = await this.mockLogin(email, password, role);
      
      if (mockResponse.success) {
        // Set authentication data
        this.user = mockResponse.user;
        this.token = mockResponse.token;
        this.refreshToken = mockResponse.refreshToken;
        this.tokenExpiry = new Date(Date.now() + (mockResponse.expiresIn * 1000));
        
        // Store authentication data
        this.storeAuth();
        
        // Setup token refresh
        this.setupTokenRefresh();
        
        console.log('✅ Login successful:', this.user);
        return { success: true, user: this.user };
        
      } else {
        throw new Error(mockResponse.message || 'Login failed');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Mock login for demo purposes
   * In production, this would make an actual API call to your backend
   */
  async mockLogin(email, password, role) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user database
    const mockUsers = {
      'citizen@example.com': {
        id: '1',
        email: 'citizen@example.com',
        name: 'John Citizen',
        role: 'citizen',
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
      },
      'worker@example.com': {
        id: '2',
        email: 'worker@example.com',
        name: 'Jane Worker',
        role: 'worker',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
      },
      'admin@example.com': {
        id: '3',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
      },
      'superadmin@example.com': {
        id: '4',
        email: 'superadmin@example.com',
        name: 'Super Admin',
        role: 'superadmin',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'
      }
    };
    
    const user = mockUsers[email];
    
    if (!user || password !== 'password123') {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    if (role && user.role !== role) {
      return {
        success: false,
        message: 'Invalid role for this user'
      };
    }
    
    // Generate mock JWT token
    const token = this.generateMockJWT(user);
    const refreshToken = this.generateMockRefreshToken(user);
    
    return {
      success: true,
      user,
      token,
      refreshToken,
      expiresIn: 3600 // 1 hour
    };
  }

  /**
   * Generate mock JWT token for demo
   * In production, tokens are generated and signed by your backend
   */
  generateMockJWT(user) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    const signature = btoa('mock-signature-' + user.id);
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Generate mock refresh token
   */
  generateMockRefreshToken(user) {
    return btoa(`refresh-${user.id}-${Date.now()}`);
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
      
      // In production, make API call to invalidate token on server
      // await this.api.post('/auth/logout', { refreshToken: this.refreshToken });
      
      // Clear authentication data
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      
      // Clear stored data
      this.clearStoredAuth();
      
      console.log('✅ Logout successful');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if server call fails
      this.clearStoredAuth();
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshAuthToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // In production, make API call to refresh token
      // const response = await this.api.post('/auth/refresh', { 
      //   refreshToken: this.refreshToken 
      // });
      
      // Mock refresh for demo
      const mockResponse = await this.mockRefreshToken();
      
      if (mockResponse.success) {
        this.token = mockResponse.token;
        this.tokenExpiry = new Date(Date.now() + (mockResponse.expiresIn * 1000));
        
        // Update stored data
        this.storeAuth();
        
        // Setup next refresh
        this.setupTokenRefresh();
        
        console.log('✅ Token refreshed successfully');
        return true;
        
      } else {
        throw new Error('Token refresh failed');
      }
      
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // If refresh fails, logout user
      await this.logout();
      
      // Redirect to login
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
      
      return false;
    }
  }

  /**
   * Mock token refresh for demo
   */
  async mockRefreshToken() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.user) {
      return { success: false, message: 'No user session' };
    }
    
    const newToken = this.generateMockJWT(this.user);
    
    return {
      success: true,
      token: newToken,
      expiresIn: 3600
    };
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    if (!this.tokenExpiry) {
      return;
    }
    
    // Refresh token 5 minutes before expiry
    const refreshTime = this.tokenExpiry.getTime() - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAuthToken();
      }, refreshTime);
      
      console.log(`Token refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!(this.user && this.token && this.tokenExpiry && this.tokenExpiry > new Date());
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Get user role
   */
  getUserRole() {
    return this.user?.role || null;
  }

  /**
   * Get authentication token
   */
  getToken() {
    return this.token;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles) {
    return roles.includes(this.user?.role);
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader() {
    return this.token ? `Bearer ${this.token}` : null;
  }

  /**
   * Biometric authentication for worker attendance
   * Security note: Biometric data should be processed locally and never stored permanently.
   * Follow GDPR Article 9 and Indian Personal Data Protection Bill guidelines.
   */
  async authenticateWithBiometric(imageData) {
    try {
      // Security note: In production, implement proper biometric verification
      // - Use secure local processing (WebAssembly or secure enclave)
      // - Never store raw biometric data
      // - Implement proper consent management
      // - Follow privacy regulations (GDPR, Indian PDPB)
      
      console.log('🔐 Processing biometric authentication...');
      
      // Mock biometric verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would:
      // 1. Extract biometric features locally
      // 2. Compare with stored template (hashed/encrypted)
      // 3. Return only verification result (not raw data)
      
      const mockVerificationResult = {
        success: true,
        confidence: 0.95,
        timestamp: new Date().toISOString()
      };
      
      // Log attendance with biometric verification
      if (mockVerificationResult.success && mockVerificationResult.confidence > 0.8) {
        await this.logAttendance('biometric', mockVerificationResult);
        return { success: true, method: 'biometric' };
      } else {
        throw new Error('Biometric verification failed');
      }
      
    } catch (error) {
      console.error('Biometric authentication error:', error);
      throw error;
    }
  }

  /**
   * Alternative OTP-based attendance for accessibility
   */
  async authenticateWithOTP(phoneNumber) {
    try {
      console.log('📱 Sending OTP to:', phoneNumber);
      
      // Mock OTP generation and sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, integrate with SMS service
      const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP temporarily (in production, use secure server-side storage)
      sessionStorage.setItem('attendance_otp', mockOTP);
      sessionStorage.setItem('attendance_otp_expiry', (Date.now() + 300000).toString()); // 5 minutes
      
      console.log('📱 Mock OTP sent:', mockOTP); // Remove in production
      
      return { success: true, message: 'OTP sent successfully' };
      
    } catch (error) {
      console.error('OTP authentication error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP for attendance
   */
  async verifyAttendanceOTP(otp) {
    try {
      const storedOTP = sessionStorage.getItem('attendance_otp');
      const otpExpiry = parseInt(sessionStorage.getItem('attendance_otp_expiry'));
      
      if (!storedOTP || !otpExpiry || Date.now() > otpExpiry) {
        throw new Error('OTP expired or not found');
      }
      
      if (otp !== storedOTP) {
        throw new Error('Invalid OTP');
      }
      
      // Clear OTP after successful verification
      sessionStorage.removeItem('attendance_otp');
      sessionStorage.removeItem('attendance_otp_expiry');
      
      // Log attendance
      await this.logAttendance('otp', { timestamp: new Date().toISOString() });
      
      return { success: true, method: 'otp' };
      
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  /**
   * Log attendance record
   */
  async logAttendance(method, verificationData) {
    try {
      const attendanceRecord = {
        userId: this.user.id,
        timestamp: new Date().toISOString(),
        method: method,
        location: await this.getCurrentLocation(),
        verificationData: verificationData
      };
      
      // In production, send to backend API
      console.log('📝 Attendance logged:', attendanceRecord);
      
      // Store locally for offline support
      const storedAttendance = JSON.parse(localStorage.getItem('attendance_records') || '[]');
      storedAttendance.push(attendanceRecord);
      localStorage.setItem('attendance_records', JSON.stringify(storedAttendance));
      
    } catch (error) {
      console.error('Error logging attendance:', error);
      throw error;
    }
  }

  /**
   * Get current location for attendance
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  /**
   * Check biometric consent status
   * Privacy compliance: Always check user consent before biometric processing
   */
  hasBiometricConsent() {
    return localStorage.getItem('smart_waste_biometric_consent') === 'granted';
  }

  /**
   * Request biometric consent
   */
  async requestBiometricConsent() {
    return new Promise((resolve) => {
      // In production, show proper consent dialog with privacy policy
      const consent = confirm(
        'This app would like to use biometric authentication for attendance. ' +
        'Your biometric data will be processed locally and not stored permanently. ' +
        'Do you consent to biometric processing?'
      );
      
      if (consent) {
        localStorage.setItem('smart_waste_biometric_consent', 'granted');
        localStorage.setItem('smart_waste_biometric_consent_date', new Date().toISOString());
      }
      
      resolve(consent);
    });
  }

  /**
   * Revoke biometric consent
   */
  revokeBiometricConsent() {
    localStorage.removeItem('smart_waste_biometric_consent');
    localStorage.removeItem('smart_waste_biometric_consent_date');
    
    // Clear any stored biometric templates
    // In production, also notify backend to delete server-side data
    console.log('🔐 Biometric consent revoked, data cleared');
  }
}