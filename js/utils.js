// Utility functions

// Format date to human-readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Default format
    return date.toLocaleDateString();
}

// Format time in seconds to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format time in seconds to human-readable
function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins < 60) {
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Parse and validate JSON quiz data
function validateQuizJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        if (!Array.isArray(data)) {
            return { valid: false, error: 'Quiz data must be an array' };
        }
        
        for (let i = 0; i < data.length; i++) {
            const q = data[i];
            
            if (!q.question || typeof q.question !== 'string') {
                return { valid: false, error: `Question ${i + 1}: Missing or invalid question text` };
            }
            
            if (!Array.isArray(q.options) || q.options.length < 2) {
                return { valid: false, error: `Question ${i + 1}: Must have at least 2 options` };
            }
            
            if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= q.options.length) {
                return { valid: false, error: `Question ${i + 1}: Invalid correct answer index` };
            }
            
            if (q.explanation && typeof q.explanation !== 'string') {
                return { valid: false, error: `Question ${i + 1}: Explanation must be a string` };
            }
        }
        
        return { valid: true, data };
    } catch (e) {
        return { valid: false, error: `JSON Parse Error: ${e.message}` };
    }
}

// Download data as JSON file
function downloadJSON(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get score color based on percentage
function getScoreColor(percentage) {
    if (percentage >= 90) return '#4CAF50'; // Green
    if (percentage >= 70) return '#2196F3'; // Blue
    if (percentage >= 50) return '#FF9800'; // Orange
    return '#F44336'; // Red
}

// Get motivational message based on score
function getMotivationalMessage(percentage) {
    if (percentage === 100) return '🎉 Perfect score! You\'re amazing!';
    if (percentage >= 90) return '🌟 Excellent work! Almost perfect!';
    if (percentage >= 80) return '👏 Great job! You\'re doing very well!';
    if (percentage >= 70) return '👍 Good work! Keep it up!';
    if (percentage >= 50) return '💪 Not bad! Keep practicing!';
    return '📚 Keep studying! You\'ll improve!';
}

// Calculate statistics from results array
function calculateStats(results) {
    if (results.length === 0) {
        return {
            total: 0,
            average: 0,
            best: 0,
            worst: 0,
            totalTime: 0
        };
    }
    
    const scores = results.map(r => r.percentage);
    const times = results.map(r => r.timeTaken || 0);
    
    return {
        total: results.length,
        average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        best: Math.max(...scores),
        worst: Math.min(...scores),
        totalTime: times.reduce((a, b) => a + b, 0)
    };
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy to clipboard', 'error');
        return false;
    }
}

// Confirm dialog with custom message
function confirmDialog(message) {
    return confirm(message);
}

// Escape HTML for safe insertion
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
// Confetti animation for perfect score
function showConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#3B82F6', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];
    
    function frame() {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) return;
        
        const particleCount = 2;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: confetti-fall ${1 + Math.random() * 2}s linear forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 3000);
        }
        
        requestAnimationFrame(frame);
    }
    
    // Add confetti animation CSS if not already present
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confetti-fall {
                to {
                    transform: translateY(100vh) rotate(${Math.random() * 360}deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    frame();
}