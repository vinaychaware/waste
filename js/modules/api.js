// API Module - Handles all API communications with retry logic and error handling
// Implements fetch wrappers with exponential backoff and offline support

export class ApiManager {
  constructor(auth) {
    this.auth = auth;
    this.baseURL = this.getBaseURL();
    this.defaultTimeout = 10000;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    
    // Request interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    
    // Offline queue for failed requests
    this.offlineQueue = [];
    
    // Setup online/offline listeners
    this.setupNetworkListeners();
  }

  /**
   * Get base URL from config or environment
   */
  getBaseURL() {
    // In production, this would come from environment variables or config
    return window.location.origin + '/api';
  }

  /**
   * Setup network status listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('📶 Network restored, processing offline queue');
      this.processOfflineQueue();
    });
    
    window.addEventListener('offline', () => {
      console.log('📵 Network lost, requests will be queued');
    });
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Process request through interceptors
   */
  async processRequestInterceptors(config) {
    let processedConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    
    return processedConfig;
  }

  /**
   * Process response through interceptors
   */
  async processResponseInterceptors(response) {
    let processedResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    
    return processedResponse;
  }

  /**
   * Make HTTP request with retry logic
   */
  async request(url, options = {}) {
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: options.timeout || this.defaultTimeout,
      ...options
    };

    // Add authentication header if available
    const authHeader = this.auth?.getAuthHeader();
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }

    // Process through request interceptors
    const processedConfig = await this.processRequestInterceptors(config);

    // Build full URL
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // Attempt request with retries
    return this.requestWithRetry(fullURL, processedConfig);
  }

  /**
   * Request with exponential backoff retry logic
   */
  async requestWithRetry(url, config, attempt = 1) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Process through response interceptors
      const processedResponse = await this.processResponseInterceptors(response);

      // Handle HTTP errors
      if (!processedResponse.ok) {
        throw new HttpError(
          processedResponse.status,
          processedResponse.statusText,
          await this.parseResponseBody(processedResponse)
        );
      }

      return processedResponse;

    } catch (error) {
      console.error(`Request attempt ${attempt} failed:`, error);

      // Don't retry for certain error types
      if (this.shouldNotRetry(error) || attempt >= this.maxRetries) {
        // Queue for offline retry if network error
        if (this.isNetworkError(error)) {
          this.queueOfflineRequest(url, config);
        }
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying request in ${delay}ms...`);

      await this.sleep(delay);
      return this.requestWithRetry(url, config, attempt + 1);
    }
  }

  /**
   * Check if error should not be retried
   */
  shouldNotRetry(error) {
    if (error instanceof HttpError) {
      // Don't retry client errors (4xx)
      return error.status >= 400 && error.status < 500;
    }
    return false;
  }

  /**
   * Check if error is network-related
   */
  isNetworkError(error) {
    return error.name === 'TypeError' || 
           error.name === 'AbortError' ||
           error.message.includes('fetch');
  }

  /**
   * Queue request for offline retry
   */
  queueOfflineRequest(url, config) {
    this.offlineQueue.push({
      url,
      config,
      timestamp: Date.now()
    });

    // Limit queue size
    if (this.offlineQueue.length > 50) {
      this.offlineQueue.shift();
    }
  }

  /**
   * Process offline queue when network is restored
   */
  async processOfflineQueue() {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const request of queue) {
      try {
        await this.requestWithRetry(request.url, request.config);
        console.log('✅ Offline request processed:', request.url);
      } catch (error) {
        console.error('❌ Failed to process offline request:', error);
        // Re-queue if still failing
        this.offlineQueue.push(request);
      }
    }
  }

  /**
   * Parse response body safely
   */
  async parseResponseBody(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (error) {
        console.warn('Failed to parse JSON response:', error);
        return null;
      }
    }
    
    return await response.text();
  }

  /**
   * Sleep utility for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP method shortcuts

  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  // Specialized API methods

  /**
   * Upload file with progress tracking
   */
  async uploadFile(url, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional fields
    if (options.fields) {
      Object.entries(options.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const config = {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...options.headers
      }
    };

    // Remove Content-Type to let browser set boundary
    delete config.headers['Content-Type'];

    return this.request(url, config);
  }

  /**
   * Upload with GPS signature for proof verification
   */
  async uploadWithGPSProof(url, file, gpsData, options = {}) {
    // Generate GPS signature for verification
    const gpsSignature = await this.generateGPSSignature(gpsData);
    
    const fields = {
      clientGps: JSON.stringify(gpsData),
      clientGpsSignature: gpsSignature,
      timestamp: new Date().toISOString(),
      ...options.fields
    };

    return this.uploadFile(url, file, { ...options, fields });
  }

  /**
   * Generate GPS signature for verification
   * In production, this would use proper cryptographic signing
   */
  async generateGPSSignature(gpsData) {
    // Mock signature generation for demo
    const dataString = JSON.stringify(gpsData);
    const signature = btoa(dataString + '-signed-' + Date.now());
    return signature;
  }

  // Mock API endpoints for demo

  /**
   * Authentication endpoints
   */
  async login(credentials) {
    // Mock login - in production, this would call real API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            token: 'mock-jwt-token',
            user: { id: 1, email: credentials.email, role: credentials.role }
          })
        });
      }, 1000);
    });
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async refreshToken(refreshToken) {
    return this.post('/auth/refresh', { refreshToken });
  }

  /**
   * Complaint endpoints
   */
  async getComplaints(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.get(`/complaints?${queryParams}`);
  }

  async createComplaint(complaintData) {
    return this.post('/complaints', complaintData);
  }

  async updateComplaint(id, updates) {
    return this.patch(`/complaints/${id}`, updates);
  }

  async deleteComplaint(id) {
    return this.delete(`/complaints/${id}`);
  }

  async assignComplaint(id, workerId) {
    return this.post(`/complaints/${id}/assign`, { workerId });
  }

  /**
   * Worker endpoints
   */
  async getWorkers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.get(`/workers?${queryParams}`);
  }

  async getWorkerTasks(workerId) {
    return this.get(`/workers/${workerId}/tasks`);
  }

  async updateTaskStatus(taskId, status, proofData = null) {
    return this.patch(`/tasks/${taskId}`, { status, proofData });
  }

  async submitAttendance(attendanceData) {
    return this.post('/attendance', attendanceData);
  }

  /**
   * Vehicle tracking endpoints
   */
  async getVehicles() {
    return this.get('/vehicles');
  }

  async getVehicleLocation(vehicleId) {
    return this.get(`/vehicles/${vehicleId}/location`);
  }

  async updateVehicleLocation(vehicleId, locationData) {
    return this.post(`/vehicles/${vehicleId}/location`, locationData);
  }

  /**
   * Analytics endpoints
   */
  async getAnalytics(type, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.get(`/analytics/${type}?${queryParams}`);
  }

  async getHeatmapData(bounds, filters = {}) {
    return this.post('/analytics/heatmap', { bounds, filters });
  }

  /**
   * E-commerce endpoints
   */
  async getProducts(category = null) {
    const url = category ? `/products?category=${category}` : '/products';
    return this.get(url);
  }

  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async getOrders(userId) {
    return this.get(`/orders?userId=${userId}`);
  }

  /**
   * Training endpoints
   */
  async getTrainingModules() {
    return this.get('/training/modules');
  }

  async getTrainingProgress(userId) {
    return this.get(`/training/progress/${userId}`);
  }

  async updateTrainingProgress(userId, moduleId, progress) {
    return this.post(`/training/progress`, { userId, moduleId, progress });
  }
}

/**
 * Custom HTTP Error class
 */
class HttpError extends Error {
  constructor(status, statusText, body) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}