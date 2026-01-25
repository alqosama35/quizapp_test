// Custom Modal System - Replace browser alerts, confirms, and prompts

// Helper function for escaping HTML
function escapeHTMLInModal(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

class ModalSystem {
    constructor() {
        this.currentModal = null;
    }

    // Show custom alert dialog
    alert(message, title = 'Alert') {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                buttons: [
                    { text: 'OK', primary: true, action: () => resolve() }
                ]
            });
        });
    }

    // Show custom confirm dialog
    confirm(message, title = 'Confirm', options = {}) {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                buttons: [
                    { 
                        text: options.cancelText || 'Cancel', 
                        action: () => resolve(false) 
                    },
                    { 
                        text: options.confirmText || 'OK', 
                        primary: true, 
                        danger: options.danger || false,
                        action: () => resolve(true) 
                    }
                ]
            });
        });
    }

    // Show custom prompt dialog
    prompt(message, title = 'Input', defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const inputId = 'modal-input-' + Date.now();
            
            this.show({
                title,
                message,
                input: {
                    id: inputId,
                    type: options.type || 'text',
                    placeholder: options.placeholder || '',
                    value: defaultValue,
                    required: options.required !== false
                },
                buttons: [
                    { 
                        text: 'Cancel', 
                        action: () => resolve(null) 
                    },
                    { 
                        text: 'OK', 
                        primary: true, 
                        action: () => {
                            const input = document.getElementById(inputId);
                            resolve(input ? input.value : null);
                        }
                    }
                ]
            });
        });
    }

    // Show custom modal with configuration
    show(config) {
        // Remove existing modal if any
        this.close();

        const modal = document.createElement('div');
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal">
                <div class="custom-modal-header">
                    <h3>${escapeHTMLInModal(config.title)}</h3>
                    ${!config.hideClose ? '<button class="modal-close" onclick="window.Modal.close()">×</button>' : ''}
                </div>
                <div class="custom-modal-body">
                    <p>${config.message.replace(/\n/g, '<br>')}</p>
                    ${config.input ? `
                        <input 
                            type="${config.input.type}" 
                            id="${config.input.id}"
                            class="modal-input"
                            placeholder="${escapeHTMLInModal(config.input.placeholder || '')}"
                            value="${escapeHTMLInModal(config.input.value || '')}"
                            ${config.input.required ? 'required' : ''}
                        >
                    ` : ''}
                </div>
                <div class="custom-modal-footer">
                    ${config.buttons.map((btn, idx) => `
                        <button 
                            class="btn ${btn.primary ? 'btn-primary' : 'btn-secondary'} ${btn.danger ? 'btn-danger' : ''}"
                            data-action="${idx}"
                        >
                            ${escapeHTMLInModal(btn.text)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add click handlers
        config.buttons.forEach((btn, idx) => {
            const btnEl = modal.querySelector(`[data-action="${idx}"]`);
            btnEl.addEventListener('click', () => {
                btn.action();
                this.close();
            });
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal && !config.preventClose) {
                if (config.buttons[0]) {
                    config.buttons[0].action();
                }
                this.close();
            }
        });

        // Handle Enter key for input
        if (config.input) {
            setTimeout(() => {
                const input = document.getElementById(config.input.id);
                if (input) {
                    input.focus();
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && config.buttons[1]) {
                            e.preventDefault();
                            config.buttons[1].action();
                            this.close();
                        }
                    });
                }
            }, 100);
        }

        // Handle Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && !config.preventClose) {
                if (config.buttons[0]) {
                    config.buttons[0].action();
                }
                this.close();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        document.body.appendChild(modal);
        this.currentModal = modal;

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    // Close current modal
    close() {
        if (this.currentModal) {
            this.currentModal.classList.remove('active');
            setTimeout(() => {
                if (this.currentModal && this.currentModal.parentNode) {
                    this.currentModal.parentNode.removeChild(this.currentModal);
                }
                this.currentModal = null;
            }, 300);
        }
    }

    // Show loading modal
    showLoading(message = 'Loading...') {
        this.show({
            title: '',
            message: `<div class="loading-spinner"></div><p>${message}</p>`,
            buttons: [],
            hideClose: true,
            preventClose: true
        });
    }

    // Show success message
    success(message, title = 'Success') {
        return this.alert(`✅ ${message}`, title);
    }

    // Show error message
    error(message, title = 'Error') {
        return this.alert(`❌ ${message}`, title);
    }

    // Show info message
    info(message, title = 'Info') {
        return this.alert(`ℹ️ ${message}`, title);
    }

    // Show warning message
    warning(message, title = 'Warning') {
        return this.alert(`⚠️ ${message}`, title);
    }
}

// Create and expose global Modal instance
window.Modal = new ModalSystem();
console.log('Modal system initialized:', window.Modal);
