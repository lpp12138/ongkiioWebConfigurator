// UI Management and Event Handling

class UIManager {
    constructor() {
        this.currentEditingId = null;
        this.isCapturingKey = false;
        this.captureTargetId = null;
        this.initializeEventListeners();
        this.refreshConfigList();
        this.updateConfigPreview();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Configuration management buttons
        document.getElementById('add-config-btn').addEventListener('click', () => this.showConfigForm());
        document.getElementById('save-config-btn').addEventListener('click', () => this.saveConfiguration());
        document.getElementById('cancel-config-btn').addEventListener('click', () => this.hideConfigForm());

        // Import/Export functionality
        document.getElementById('import-btn').addEventListener('click', () => this.triggerFileImport());
        document.getElementById('export-btn').addEventListener('click', () => this.exportConfiguration());
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileImport(e));

        // Form change handlers
        document.getElementById('io-type').addEventListener('change', () => this.handleIOTypeChange());
        document.getElementById('scope').addEventListener('change', () => this.updateConfigPreview());

        // Form validation on input
        document.getElementById('config-form').addEventListener('input', () => this.validateForm());

        // Global key capture listener
        document.addEventListener('keydown', (e) => this.handleKeyCapture(e));
    }

    // Show the configuration form
    showConfigForm(configItem = null) {
        this.currentEditingId = configItem ? configItem.id : null;

        const formSection = document.getElementById('config-form-section');
        formSection.style.display = 'block';
        formSection.scrollIntoView({ behavior: 'smooth' });

        if (configItem) {
            this.populateForm(configItem);
        } else {
            this.clearForm();
        }

        this.updateParametersSection();
    }

    // Hide the configuration form
    hideConfigForm() {
        document.getElementById('config-form-section').style.display = 'none';
        this.currentEditingId = null;
        this.clearForm();
        this.clearMessages();
    }

    // Populate form with existing configuration
    populateForm(configItem) {
        document.getElementById('io-type').value = configItem.ioType;
        document.getElementById('scope').value = configItem.scope;

        this.updateParametersSection();

        // Populate parameter fields
        if (configItem.parameters) {
            Object.entries(configItem.parameters).forEach(([key, value]) => {
                const field = document.getElementById(`param-${key}`);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = value;
                    } else {
                        field.value = value;
                    }
                }
            });
        }
    }

    // Clear the form
    clearForm() {
        document.getElementById('config-form').reset();
        document.getElementById('parameters-section').innerHTML = '';
    }

    // Handle IO type change
    handleIOTypeChange() {
        this.updateParametersSection();
        this.validateForm();
        this.updateConfigPreview();
    }

    // Update parameters section based on selected IO type
    updateParametersSection() {
        const ioType = document.getElementById('io-type').value;
        const parametersSection = document.getElementById('parameters-section');

        if (!ioType || !ParameterTemplates[ioType]) {
            parametersSection.innerHTML = '<p class="empty-state">Select an IO type to configure parameters</p>';
            return;
        }

        const template = ParameterTemplates[ioType];
        parametersSection.innerHTML = this.generateParameterFields(template);

        // Add event listeners to new parameter fields
        parametersSection.querySelectorAll('input, select').forEach(field => {
            field.addEventListener('input', () => {
                this.validateForm();
                this.updateConfigPreview();
            });
        });

        // Add event listeners to capture buttons
        parametersSection.querySelectorAll('.btn-capture').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.dataset.target;
                this.startKeyCapture(targetId);
            });
        });
    }

    // Start key capture for a specific input field
    startKeyCapture(targetId) {
        if (this.isCapturingKey) {
            this.stopKeyCapture();
            return;
        }

        this.isCapturingKey = true;
        this.captureTargetId = targetId;

        // Update button text and style
        const button = document.querySelector(`[data-target="${targetId}"]`);
        if (button) {
            button.textContent = 'Press any key...';
            button.classList.add('capturing');
            button.disabled = true;
        }

        // Show capture modal/indicator
        this.showCaptureIndicator();
    }

    // Stop key capture
    stopKeyCapture() {
        if (!this.isCapturingKey) return;

        this.isCapturingKey = false;
        const button = document.querySelector(`[data-target="${this.captureTargetId}"]`);
        if (button) {
            button.textContent = 'Capture Key';
            button.classList.remove('capturing');
            button.disabled = false;
        }

        this.hideCaptureIndicator();
        this.captureTargetId = null;
    }

    // Handle key capture
    handleKeyCapture(event) {
        if (!this.isCapturingKey || !this.captureTargetId) return;

        // Prevent default behavior
        event.preventDefault();
        event.stopPropagation();

        // Get the key code
        const keyCode = event.which || event.keyCode;

        // Check for ESC key to cancel
        if (keyCode === 27) {
            this.stopKeyCapture();
            return;
        }

        // Update the target input field
        const targetInput = document.getElementById(this.captureTargetId);
        if (targetInput) {
            targetInput.value = keyCode;
            targetInput.dispatchEvent(new Event('input')); // Trigger validation
        }

        // Show key info
        this.showKeyInfo(event, keyCode);

        // Stop capturing after a short delay
        setTimeout(() => {
            this.stopKeyCapture();
        }, 1000);
    }

    // Show capture indicator
    showCaptureIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'key-capture-indicator';
        indicator.className = 'capture-indicator';
        indicator.innerHTML = `
            <div class="capture-modal">
                <h3>Key Capture Mode</h3>
                <p>Press any key to capture its key code</p>
                <p class="capture-hint">Press ESC to cancel</p>
                <button type="button" class="btn btn-secondary" onclick="uiManager.stopKeyCapture()">Cancel</button>
            </div>
        `;
        document.body.appendChild(indicator);
    }

    // Hide capture indicator
    hideCaptureIndicator() {
        const indicator = document.getElementById('key-capture-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Show key information
    showKeyInfo(event, keyCode) {
        const keyName = event.key || event.code || 'Unknown';
        const indicator = document.getElementById('key-capture-indicator');
        if (indicator) {
            const modal = indicator.querySelector('.capture-modal');
            modal.innerHTML = `
                <h3>Key Captured!</h3>
                <div class="key-info">
                    <p><strong>Key:</strong> ${keyName}</p>
                    <p><strong>Key Code:</strong> ${keyCode}</p>
                </div>
                <p class="success-message">Key code ${keyCode} has been set</p>
            `;
        }
    }

    // Generate parameter input fields
    generateParameterFields(template) {
        let html = '<h3>Parameters</h3><div class="parameter-group">';

        const currentIOType = document.getElementById('io-type').value;

        Object.entries(template).forEach(([key, config]) => {
            html += this.generateStandardField(key, config, currentIOType === 'Keyboard');
        });

        html += '</div>';
        return html;
    }

    // Generate standard input field
    generateStandardField(key, config, isKeyboard = false) {
        const required = config.required ? 'required' : '';
        const tooltip = config.tooltip ? `data-tooltip="${config.tooltip}"` : '';

        let fieldHtml = '';

        switch (config.type) {
            case 'select':
                fieldHtml = `
                    <select id="param-${key}" name="${key}" ${required}>
                        <option value="">Select ${config.label}</option>
                        ${config.options.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                `;
                break;
            case 'checkbox':
                fieldHtml = `
                    <input type="checkbox" id="param-${key}" name="${key}">
                    <label for="param-${key}">${config.label}</label>
                `;
                return `<div class="form-group checkbox-group" ${tooltip}>${fieldHtml}</div>`;
            default:
                const inputField = `
                    <input type="${config.type}" id="param-${key}" name="${key}"
                           placeholder="${config.placeholder || ''}" ${required}
                           ${config.min ? `min="${config.min}"` : ''}
                           ${config.max ? `max="${config.max}"` : ''}>
                `;

                // Add capture button for keyboard parameters
                if (isKeyboard && config.type === 'number') {
                    fieldHtml = `
                        <div class="input-with-capture">
                            ${inputField}
                            <button type="button" class="btn btn-capture" data-target="param-${key}">
                                Capture Key
                            </button>
                        </div>
                    `;
                } else {
                    fieldHtml = inputField;
                }
        }

        return `
            <div class="form-group" ${tooltip}>
                <label for="param-${key}">${config.label}:</label>
                ${fieldHtml}
            </div>
        `;
    }


    // Save configuration
    saveConfiguration() {
        const formData = this.collectFormData();
        const validationErrors = ValidationUtils.validateConfigItem(formData);

        if (validationErrors.length > 0) {
            this.showErrorMessage('Validation failed: ' + validationErrors.join(', '));
            return;
        }

        try {
            if (this.currentEditingId) {
                // Update existing configuration
                gameConfig.updateConfigItem(this.currentEditingId, formData);
                this.showSuccessMessage('Configuration updated successfully');
            } else {
                // Add new configuration
                gameConfig.addConfigItem(formData);
                this.showSuccessMessage('Configuration added successfully');
            }

            this.refreshConfigList();
            this.updateConfigPreview();
            this.hideConfigForm();
        } catch (error) {
            this.showErrorMessage('Failed to save configuration: ' + error.message);
        }
    }

    // Collect form data
    collectFormData() {
        const ioType = document.getElementById('io-type').value;
        const scope = document.getElementById('scope').value;
        const parameters = {};

        // Handle parameter collection based on IO type
        const template = ParameterTemplates[ioType];
        if (template) {
            Object.keys(template).forEach(key => {
                const field = document.getElementById(`param-${key}`);
                if (field) {
                    if (field.type === 'checkbox') {
                        parameters[key] = field.checked;
                    } else {
                        const value = field.value.trim();
                        if (value !== '') {
                            // Convert to appropriate type
                            if (template[key].type === 'number') {
                                parameters[key] = parseInt(value, 10);
                            } else {
                                parameters[key] = value;
                            }
                        } else if (template[key].placeholder) {
                            // Use placeholder as default value
                            if (template[key].type === 'number') {
                                parameters[key] = parseInt(template[key].placeholder, 10);
                            } else {
                                parameters[key] = template[key].placeholder;
                            }
                        }
                    }
                }
            });
        }

        // Sanitize parameters
        const sanitizedParams = ValidationUtils.sanitizeParameters(ioType, parameters);

        return new ConfigItem(ioType, scope, sanitizedParams);
    }

    // Validate form and show real-time feedback
    validateForm() {
        const formData = this.collectFormData();
        const errors = ValidationUtils.validateConfigItem(formData);

        const saveButton = document.getElementById('save-config-btn');
        if (errors.length > 0) {
            saveButton.disabled = true;
            saveButton.title = 'Fix validation errors: ' + errors.join(', ');
        } else {
            saveButton.disabled = false;
            saveButton.title = '';
        }
    }

    // Refresh the configuration list
    refreshConfigList() {
        const configList = document.getElementById('config-list');
        const configs = gameConfig.getAllConfigItems();

        if (configs.length === 0) {
            configList.innerHTML = `
                <div class="empty-state">
                    <h3>No configurations yet</h3>
                    <p>Click "Add Configuration" to get started</p>
                </div>
            `;
            return;
        }

        configList.innerHTML = configs.map(config => this.generateConfigItemHTML(config)).join('');

        // Add event listeners to action buttons
        configList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const config = gameConfig.getConfigItem(id);
                this.showConfigForm(config);
            });
        });

        configList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.deleteConfiguration(id);
            });
        });

        configList.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.toggleConfiguration(id);
            });
        });
    }

    // Generate HTML for a configuration item
    generateConfigItemHTML(config) {
        const status = config.enabled ? 'enabled' : 'disabled';
        const statusIndicator = config.connected ? 'connected' : 'disconnected';

        return `
            <div class="config-item" data-id="${config.id}">
                <div class="config-item-header">
                    <div class="config-item-title">
                        <span class="status-indicator status-${statusIndicator}"></span>
                        ${config.getDisplayName()}
                    </div>
                    <div class="config-item-actions">
                        <button class="btn btn-secondary toggle-btn" data-id="${config.id}">
                            ${config.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button class="btn btn-secondary edit-btn" data-id="${config.id}">Edit</button>
                        <button class="btn btn-danger delete-btn" data-id="${config.id}">Delete</button>
                    </div>
                </div>
                <div class="config-item-details">
                    <div class="config-detail">
                        <div class="config-detail-label">Type</div>
                        <div class="config-detail-value">${config.ioType}</div>
                    </div>
                    <div class="config-detail">
                        <div class="config-detail-label">Scope</div>
                        <div class="config-detail-value">${config.scope}</div>
                    </div>
                    <div class="config-detail">
                        <div class="config-detail-label">Status</div>
                        <div class="config-detail-value">${status}</div>
                    </div>
                    ${this.generateParameterDetails(config)}
                </div>
            </div>
        `;
    }

    // Generate parameter details for display
    generateParameterDetails(config) {
        if (!config.parameters || Object.keys(config.parameters).length === 0) {
            return '';
        }

        let details = '';
        Object.entries(config.parameters).forEach(([key, value]) => {
            if (key === 'keys' && typeof value === 'object') {
                const keyCount = Object.keys(value).length;
                details += `
                    <div class="config-detail">
                        <div class="config-detail-label">Key Mappings</div>
                        <div class="config-detail-value">${keyCount} keys mapped</div>
                    </div>
                `;
            } else {
                details += `
                    <div class="config-detail">
                        <div class="config-detail-label">${this.formatParameterLabel(key)}</div>
                        <div class="config-detail-value">${value}</div>
                    </div>
                `;
            }
        });

        return details;
    }

    // Format parameter labels for display
    formatParameterLabel(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    // Delete a configuration
    deleteConfiguration(id) {
        if (confirm('Are you sure you want to delete this configuration?')) {
            gameConfig.removeConfigItem(id);
            this.refreshConfigList();
            this.updateConfigPreview();
            this.showSuccessMessage('Configuration deleted successfully');
        }
    }

    // Toggle configuration enabled state
    toggleConfiguration(id) {
        const config = gameConfig.getConfigItem(id);
        if (config) {
            config.enabled = !config.enabled;
            gameConfig.updateConfigItem(id, config);
            this.refreshConfigList();
            this.updateConfigPreview();
        }
    }

    // Update configuration preview
    updateConfigPreview() {
        const preview = document.getElementById('config-preview');
        const configs = gameConfig.getAllConfigItems();

        if (configs.length === 0) {
            preview.textContent = '// No configurations to preview\n// Add some configurations to see the JSON output here';
            return;
        }

        try {
            const jsonOutput = gameConfig.exportToJSON();
            preview.textContent = jsonOutput;
        } catch (error) {
            preview.textContent = '// Error generating preview: ' + error.message;
        }
    }

    // File import/export functionality
    triggerFileImport() {
        document.getElementById('file-input').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const success = gameConfig.importFromJSON(e.target.result);
                if (success) {
                    this.refreshConfigList();
                    this.updateConfigPreview();
                    this.showSuccessMessage('Configuration imported successfully');
                } else {
                    this.showErrorMessage('Failed to import configuration. Please check the file format.');
                }
            } catch (error) {
                this.showErrorMessage('Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);

        // Reset the file input
        event.target.value = '';
    }

    exportConfiguration() {
        try {
            const jsonData = gameConfig.exportToJSON();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `ongeki-io-config-${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);
            this.showSuccessMessage('Configuration exported successfully');
        } catch (error) {
            this.showErrorMessage('Failed to export configuration: ' + error.message);
        }
    }

    // Message display functions
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        this.clearMessages();

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;

        const formSection = document.getElementById('config-form-section');
        formSection.insertBefore(messageDiv, formSection.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    clearMessages() {
        document.querySelectorAll('.error-message, .success-message').forEach(msg => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});