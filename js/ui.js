export class UIManager {
    constructor() {
        this.toastTimeout = null;
    }
    
    showToast(message, type = 'info') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon ${iconMap[type]} ${type}"></i>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Auto remove after 4 seconds
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
        
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 4000);
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    handleFilePreview(input) {
        const file = input.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                let preview = input.parentNode.querySelector('.file-preview');
                if (!preview) {
                    preview = document.createElement('div');
                    preview.className = 'file-preview';
                    input.parentNode.appendChild(preview);
                }
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    }
    
    createStatCard(title, value, icon, type = 'info', change = null) {
        return `
            <div class="stat-card ${type}">
                <div class="stat-header">
                    <div class="stat-icon ${type}">
                        <i class="${icon}"></i>
                    </div>
                </div>
                <div class="stat-value">${value}</div>
                <div class="stat-label">${title}</div>
                ${change ? `<div class="stat-change ${change > 0 ? 'positive' : 'negative'}">
                    <i class="fas fa-arrow-${change > 0 ? 'up' : 'down'}"></i>
                    ${Math.abs(change)}% from last month
                </div>` : ''}
            </div>
        `;
    }
    
    createComplaintTable(complaints, userRole) {
        if (!complaints.length) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div class="empty-state-title">No complaints found</div>
                    <div class="empty-state-message">There are no complaints to display at the moment.</div>
                </div>
            `;
        }
        
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${complaints.map(complaint => `
                            <tr>
                                <td><code>${complaint.id}</code></td>
                                <td>${this.formatComplaintType(complaint.type)}</td>
                                <td>${complaint.location}</td>
                                <td><span class="badge badge-${complaint.status}">${complaint.status}</span></td>
                                <td>
                                    <div class="priority ${complaint.priority}">
                                        <div class="priority-dot ${complaint.priority}"></div>
                                        ${complaint.priority}
                                    </div>
                                </td>
                                <td>${new Date(complaint.timestamp).toLocaleDateString()}</td>
                                <td>
                                    <div class="action-buttons">
                                        ${this.getActionButtons(complaint, userRole)}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    getActionButtons(complaint, userRole) {
        const buttons = [];
        
        buttons.push(`<button class="action-btn view" onclick="viewDetails('${complaint.id}')">
            <i class="fas fa-eye"></i> View
        </button>`);
        
        if (userRole === 'admin') {
            if (complaint.status === 'pending') {
                buttons.push(`<button class="action-btn assign" onclick="assignTask('${complaint.id}')">
                    <i class="fas fa-user-plus"></i> Assign
                </button>`);
            } else if (complaint.status === 'in-progress') {
                buttons.push(`<button class="action-btn approve" onclick="approveTask('${complaint.id}')">
                    <i class="fas fa-check"></i> Approve
                </button>`);
                buttons.push(`<button class="action-btn reject" onclick="rejectTask('${complaint.id}')">
                    <i class="fas fa-times"></i> Reject
                </button>`);
            }
        }
        
        return buttons.join('');
    }
    
    formatComplaintType(type) {
        return type.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    createHeatMap(data) {
        return `
            <div class="heat-map">
                <div class="heat-map-header">
                    <h3>City Cleanliness Heat Map</h3>
                    <div class="heat-map-legend">
                        <div class="legend-item">
                            <div class="legend-color green"></div>
                            <span>Clean</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color yellow"></div>
                            <span>Moderate</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color red"></div>
                            <span>Needs Attention</span>
                        </div>
                    </div>
                </div>
                <div class="heat-map-grid">
                    ${data.map(cell => `
                        <div class="heat-cell ${cell.status}" title="Area ${cell.id}: ${cell.complaints} complaints"></div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    createProgressBar(percentage, type = 'info') {
        return `
            <div class="progress-bar">
                <div class="progress-fill ${type}" style="width: ${percentage}%"></div>
            </div>
        `;
    }
}