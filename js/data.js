export class DataManager {
    constructor() {
        this.initializeData();
    }
    
    initializeData() {
        // Initialize with sample data if not exists
        if (!localStorage.getItem('complaints')) {
            const sampleComplaints = [
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
            localStorage.setItem('complaints', JSON.stringify(sampleComplaints));
        }
        
        if (!localStorage.getItem('workers')) {
            const sampleWorkers = [
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
            localStorage.setItem('workers', JSON.stringify(sampleWorkers));
        }
    }
    
    // Complaint management
    getComplaints() {
        return JSON.parse(localStorage.getItem('complaints') || '[]');
    }
    
    getComplaint(id) {
        const complaints = this.getComplaints();
        return complaints.find(c => c.id === id);
    }
    
    addComplaint(complaintData) {
        const complaints = this.getComplaints();
        const newComplaint = {
            ...complaintData,
            id: `complaint-${Date.now()}`,
            timestamp: new Date().toISOString()
        };
        complaints.push(newComplaint);
        localStorage.setItem('complaints', JSON.stringify(complaints));
        return newComplaint.id;
    }
    
    updateComplaintStatus(id, status) {
        const complaints = this.getComplaints();
        const complaint = complaints.find(c => c.id === id);
        if (complaint) {
            complaint.status = status;
            if (status === 'resolved') {
                complaint.resolvedAt = new Date().toISOString();
            }
            localStorage.setItem('complaints', JSON.stringify(complaints));
        }
    }
    
    assignTask(complaintId, taskData) {
        const complaints = this.getComplaints();
        const complaint = complaints.find(c => c.id === complaintId);
        if (complaint) {
            complaint.status = 'in-progress';
            complaint.assignedTo = taskData.worker;
            complaint.priority = taskData.priority;
            complaint.assignedAt = taskData.assignedAt;
            complaint.assignedBy = taskData.assignedBy;
            complaint.notes = taskData.notes;
            localStorage.setItem('complaints', JSON.stringify(complaints));
        }
    }
    
    // Worker management
    getWorkers() {
        return JSON.parse(localStorage.getItem('workers') || '[]');
    }
    
    getWorker(id) {
        const workers = this.getWorkers();
        return workers.find(w => w.id === id);
    }
    
    // Analytics
    getAnalytics() {
        const complaints = this.getComplaints();
        const workers = this.getWorkers();
        
        const totalComplaints = complaints.length;
        const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
        const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;
        const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
        const urgentComplaints = complaints.filter(c => c.priority === 'urgent').length;
        
        const activeWorkers = workers.filter(w => w.status === 'active').length;
        const avgResolutionTime = this.calculateAverageResolutionTime(complaints);
        const avgRating = this.calculateAverageRating(workers);
        
        return {
            totalComplaints,
            pendingComplaints,
            inProgressComplaints,
            resolvedComplaints,
            urgentComplaints,
            activeWorkers,
            avgResolutionTime,
            avgRating,
            resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0
        };
    }
    
    calculateAverageResolutionTime(complaints) {
        const resolvedComplaints = complaints.filter(c => c.status === 'resolved' && c.resolvedAt);
        if (resolvedComplaints.length === 0) return 0;
        
        const totalTime = resolvedComplaints.reduce((sum, complaint) => {
            const submitTime = new Date(complaint.timestamp);
            const resolveTime = new Date(complaint.resolvedAt);
            return sum + (resolveTime - submitTime);
        }, 0);
        
        return Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60)); // hours
    }
    
    calculateAverageRating(workers) {
        if (workers.length === 0) return 0;
        const totalRating = workers.reduce((sum, worker) => sum + (worker.rating || 0), 0);
        return (totalRating / workers.length).toFixed(1);
    }
    
    // Heat map data
    getHeatMapData() {
        // Generate sample heat map data
        const data = [];
        for (let i = 0; i < 100; i++) {
            const status = Math.random();
            let level;
            if (status > 0.8) level = 'clean';
            else if (status > 0.5) level = 'moderate';
            else if (status > 0.2) level = 'dirty';
            else level = 'neutral';
            
            data.push({
                id: i,
                status: level,
                complaints: Math.floor(Math.random() * 10)
            });
        }
        return data;
    }
}