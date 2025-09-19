export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = {
            'superadmin': {
                'admin': { password: 'admin123', role: 'superadmin' }
            },
            'admin': {
                'admin': { password: 'admin123', role: 'admin' }
            },
            'worker': {
                'worker': { password: 'worker123', role: 'worker' }
            },
            'green-champion': {
                'champion': { password: 'champion123', role: 'green-champion' }
            },
            'citizen': {
                'citizen': { password: 'citizen123', role: 'citizen' }
            }
        };
        
        // Load user from localStorage if available
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }
    
    login(role, username, password) {
        if (this.users[role] && 
            this.users[role][username] && 
            this.users[role][username].password === password) {
            
            this.currentUser = {
                username,
                role,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }
    
    hasAnyRole(roles) {
        return this.currentUser && roles.includes(this.currentUser.role);
    }
}