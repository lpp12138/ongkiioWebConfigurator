// Configuration Management System
// Based on the ongeki-io IOConfig structure

class Config {
    constructor() {
        this.configItems = [];
        this.loadFromLocalStorage();
    }

    // Add a new configuration item
    addConfigItem(configItem) {
        configItem.id = this.generateId();
        this.configItems.push(configItem);
        this.saveToLocalStorage();
        return configItem;
    }

    // Update an existing configuration item
    updateConfigItem(id, updatedItem) {
        const index = this.configItems.findIndex(item => item.id === id);
        if (index !== -1) {
            this.configItems[index] = { ...updatedItem, id };
            this.saveToLocalStorage();
            return this.configItems[index];
        }
        return null;
    }

    // Remove a configuration item
    removeConfigItem(id) {
        const index = this.configItems.findIndex(item => item.id === id);
        if (index !== -1) {
            this.configItems.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Get all configuration items
    getAllConfigItems() {
        return [...this.configItems];
    }

    // Get a specific configuration item
    getConfigItem(id) {
        return this.configItems.find(item => item.id === id);
    }

    // Export configuration to JSON
    exportToJSON() {
        const exportData = {
            IO: this.configItems.map(item => {
                const ioItem = {
                    Type: item.ioType,
                    Scope: item.scope
                };

                // Handle Param based on the type - match original IOConfig structure
                if (item.ioType === 'Udp' || item.ioType === 'Tcp' || item.ioType === 'Usbmux') {
                    // These types use ushort (port number) as Param
                    ioItem.Param = item.parameters.port || 4354;
                } else if (item.ioType === 'Hid') {
                    // HID uses HidParam object as Param
                    ioItem.Param = {
                        Vid: item.parameters.vid || 9025,
                        Pid: item.parameters.pid || 32822,
                        UsagePage: item.parameters.usagePage || -1,
                        Usage: item.parameters.usage || -1
                    };
                } else if (item.ioType === 'Keyboard') {
                    // Keyboard uses KeyboardParam object as Param
                    ioItem.Param = {
                        L1: item.parameters.l1 || -1,
                        L2: item.parameters.l2 || -1,
                        L3: item.parameters.l3 || -1,
                        LSide: item.parameters.lSide || -1,
                        LMenu: item.parameters.lMenu || -1,
                        R1: item.parameters.r1 || -1,
                        R2: item.parameters.r2 || -1,
                        R3: item.parameters.r3 || -1,
                        RSide: item.parameters.rSide || -1,
                        RMenu: item.parameters.rMenu || -1,
                        Test: item.parameters.test || -1,
                        Service: item.parameters.service || -1,
                        Coin: item.parameters.coin || -1,
                        Scan: item.parameters.scan || -1
                    };
                } else {
                    ioItem.Param = item.parameters;
                }

                return ioItem;
            })
        };
        return JSON.stringify(exportData, null, 2);
    }

    // Import configuration from JSON
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // Handle IOConfig format with IO array
            if (data.IO && Array.isArray(data.IO)) {
                this.configItems = data.IO.map(item => {
                    const configItem = {
                        id: this.generateId(),
                        ioType: item.Type,
                        scope: item.Scope,
                        enabled: true,
                        connected: false,
                        parameters: {}
                    };

                    // Convert Param back to parameters based on type
                    if (item.Type === 'Udp' || item.Type === 'Tcp' || item.Type === 'Usbmux') {
                        // These types use ushort (port number) as Param
                        configItem.parameters = {
                            port: item.Param || 4354
                        };
                    } else if (item.Type === 'Hid') {
                        // HID uses HidParam object as Param
                        const hidParam = item.Param || {};
                        configItem.parameters = {
                            vid: hidParam.Vid || 9025,
                            pid: hidParam.Pid || 32822,
                            usagePage: hidParam.UsagePage || -1,
                            usage: hidParam.Usage || -1
                        };
                    } else if (item.Type === 'Keyboard') {
                        // Keyboard uses KeyboardParam object as Param
                        const keyParam = item.Param || {};
                        configItem.parameters = {
                            l1: keyParam.L1 || -1,
                            l2: keyParam.L2 || -1,
                            l3: keyParam.L3 || -1,
                            lSide: keyParam.LSide || -1,
                            lMenu: keyParam.LMenu || -1,
                            r1: keyParam.R1 || -1,
                            r2: keyParam.R2 || -1,
                            r3: keyParam.R3 || -1,
                            rSide: keyParam.RSide || -1,
                            rMenu: keyParam.RMenu || -1,
                            test: keyParam.Test || -1,
                            service: keyParam.Service || -1,
                            coin: keyParam.Coin || -1,
                            scan: keyParam.Scan || -1
                        };
                    } else {
                        configItem.parameters = item.Param || {};
                    }

                    const newConfigItem = new ConfigItem(configItem.ioType, configItem.scope, configItem.parameters);
                    newConfigItem.id = configItem.id;
                    newConfigItem.enabled = configItem.enabled;
                    newConfigItem.connected = configItem.connected;
                    return newConfigItem;
                });
                this.saveToLocalStorage();
                return true;
            }

            // Handle old format for backwards compatibility
            if (data.configItems && Array.isArray(data.configItems)) {
                this.configItems = data.configItems.map(item => ({
                    ...item,
                    id: this.generateId()
                }));
                this.saveToLocalStorage();
                return true;
            }

            throw new Error("Invalid configuration format");
        } catch (error) {
            console.error("Import failed:", error);
            return false;
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Save to localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('mu3input_config', JSON.stringify(this.configItems));
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
        }
    }

    // Load from localStorage
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('mu3input_config');
            if (saved) {
                this.configItems = JSON.parse(saved);
            }
        } catch (error) {
            console.error("Failed to load from localStorage:", error);
            this.configItems = [];
        }
    }

    // Clear all configurations
    clearAll() {
        this.configItems = [];
        this.saveToLocalStorage();
    }
}

// Configuration Item Factory
class ConfigItem {
    constructor(ioType, scope, parameters = {}) {
        this.id = null; // Will be set when added to config
        this.ioType = ioType;
        this.scope = scope;
        this.parameters = parameters;
        this.enabled = true;
        this.connected = false;
    }

    // Validate the configuration item
    validate() {
        const errors = [];

        if (!this.ioType) {
            errors.push("IO Type is required");
        }

        if (!this.scope) {
            errors.push("Scope is required");
        }

        // Validate parameters based on IO type
        const paramValidation = this.validateParameters();
        if (paramValidation.length > 0) {
            errors.push(...paramValidation);
        }

        return errors;
    }

    // Validate parameters based on IO type
    validateParameters() {
        const errors = [];

        switch (this.ioType) {
            case 'Hid':
                if (!this.parameters.vendorId || !this.parameters.productId) {
                    errors.push("HID requires Vendor ID and Product ID");
                }
                break;
            case 'Udp':
            case 'Tcp':
                if (!this.parameters.host || !this.parameters.port) {
                    errors.push(`${this.ioType} requires Host and Port`);
                }
                if (this.parameters.port && (this.parameters.port < 1 || this.parameters.port > 65535)) {
                    errors.push("Port must be between 1 and 65535");
                }
                break;
            case 'Keyboard':
                if (!this.parameters.keys || Object.keys(this.parameters.keys).length === 0) {
                    errors.push("Keyboard requires key mappings");
                }
                break;
            case 'Usbmux':
                if (!this.parameters.device) {
                    errors.push("USB Multiplexer requires device specification");
                }
                break;
        }

        return errors;
    }

    // Get display name for the configuration
    getDisplayName() {
        switch (this.ioType) {
            case 'Hid':
                return `HID Device (${this.parameters.vendorId}:${this.parameters.productId})`;
            case 'Udp':
                return `UDP (${this.parameters.host}:${this.parameters.port})`;
            case 'Tcp':
                return `TCP (${this.parameters.host}:${this.parameters.port})`;
            case 'Keyboard':
                return `Keyboard Mapping`;
            case 'Usbmux':
                return `USB Multiplexer (${this.parameters.device})`;
            default:
                return this.ioType;
        }
    }
}

// Parameter Templates for different IO types (matching original IOConfig structure)
const ParameterTemplates = {
    Hid: {
        vid: { type: 'number', label: 'Vendor ID', placeholder: '9025', required: true, min: 0, max: 65535 },
        pid: { type: 'number', label: 'Product ID', placeholder: '32822', required: true, min: 0, max: 65535 },
        usagePage: { type: 'number', label: 'Usage Page', placeholder: '-1', required: false },
        usage: { type: 'number', label: 'Usage', placeholder: '-1', required: false }
    },
    Udp: {
        port: { type: 'number', label: 'Port', placeholder: '4354', required: true, min: 1, max: 65535 }
    },
    Tcp: {
        port: { type: 'number', label: 'Port', placeholder: '4354', required: true, min: 1, max: 65535 }
    },
    Keyboard: {
        l1: { type: 'number', label: 'L1 Key Code', placeholder: '-1', required: false },
        l2: { type: 'number', label: 'L2 Key Code', placeholder: '-1', required: false },
        l3: { type: 'number', label: 'L3 Key Code', placeholder: '-1', required: false },
        lSide: { type: 'number', label: 'LSide Key Code', placeholder: '-1', required: false },
        lMenu: { type: 'number', label: 'LMenu Key Code', placeholder: '-1', required: false },
        r1: { type: 'number', label: 'R1 Key Code', placeholder: '-1', required: false },
        r2: { type: 'number', label: 'R2 Key Code', placeholder: '-1', required: false },
        r3: { type: 'number', label: 'R3 Key Code', placeholder: '-1', required: false },
        rSide: { type: 'number', label: 'RSide Key Code', placeholder: '-1', required: false },
        rMenu: { type: 'number', label: 'RMenu Key Code', placeholder: '-1', required: false },
        test: { type: 'number', label: 'Test Key Code', placeholder: '-1', required: false },
        service: { type: 'number', label: 'Service Key Code', placeholder: '-1', required: false },
        coin: { type: 'number', label: 'Coin Key Code', placeholder: '-1', required: false },
        scan: { type: 'number', label: 'Scan Key Code', placeholder: '-1', required: false }
    },
    Usbmux: {
        port: { type: 'number', label: 'Port', placeholder: '4354', required: true, min: 1, max: 65535 }
    }
};

// Scope definitions
const ScopeDefinitions = {
    All: 'All input/output controls',
    Button: 'Button inputs only',
    Lever: 'Lever/analog inputs only',
    Led: 'LED outputs only'
};

// Export global configuration instance
window.gameConfig = new Config();
window.ConfigItem = ConfigItem;
window.ParameterTemplates = ParameterTemplates;
window.ScopeDefinitions = ScopeDefinitions;