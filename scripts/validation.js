// Validation utilities for configuration data

class ValidationUtils {
    // Validate HID parameters
    static validateHidParameters(params) {
        const errors = [];

        if (params.vid === undefined || params.vid === null) {
            errors.push("Vendor ID is required");
        } else if (!this.isValidNumber(params.vid, 0, 65535)) {
            errors.push("Vendor ID must be a number between 0 and 65535");
        }

        if (params.pid === undefined || params.pid === null) {
            errors.push("Product ID is required");
        } else if (!this.isValidNumber(params.pid, 0, 65535)) {
            errors.push("Product ID must be a number between 0 and 65535");
        }

        if (params.usage !== undefined && params.usage !== -1 && !this.isValidNumber(params.usage, 0, 65535)) {
            errors.push("Usage must be a number between 0 and 65535, or -1 for default");
        }

        if (params.usagePage !== undefined && params.usagePage !== -1 && !this.isValidNumber(params.usagePage, 0, 65535)) {
            errors.push("Usage Page must be a number between 0 and 65535, or -1 for default");
        }

        return errors;
    }

    // Validate UDP parameters
    static validateUdpParameters(params) {
        const errors = [];

        if (params.port === undefined || params.port === null) {
            errors.push("Port is required");
        } else if (!this.isValidPort(params.port)) {
            errors.push("Port must be a number between 1 and 65535");
        }

        return errors;
    }

    // Validate TCP parameters
    static validateTcpParameters(params) {
        const errors = [];

        if (params.port === undefined || params.port === null) {
            errors.push("Port is required");
        } else if (!this.isValidPort(params.port)) {
            errors.push("Port must be a number between 1 and 65535");
        }

        return errors;
    }

    // Validate Keyboard parameters
    static validateKeyboardParameters(params) {
        const errors = [];

        // Keyboard parameters are all optional in the original IOConfig
        // All key codes should be integers, with -1 being the default for unassigned keys
        const keyFields = ['l1', 'l2', 'l3', 'lSide', 'lMenu', 'r1', 'r2', 'r3', 'rSide', 'rMenu', 'test', 'service', 'coin', 'scan'];

        for (const field of keyFields) {
            if (params[field] !== undefined && !this.isValidNumber(params[field], -1, 255)) {
                errors.push(`${field} must be a valid key code (integer between -1 and 255)`);
            }
        }

        return errors;
    }

    // Validate USB Multiplexer parameters
    static validateUsbmuxParameters(params) {
        const errors = [];

        if (params.port === undefined || params.port === null) {
            errors.push("Port is required");
        } else if (!this.isValidPort(params.port)) {
            errors.push("Port must be a number between 1 and 65535");
        }

        return errors;
    }

    // Utility validation functions
    static isValidHexString(value) {
        if (typeof value !== 'string') return false;
        const hexPattern = /^0x[0-9a-fA-F]+$/;
        return hexPattern.test(value);
    }

    static isValidNumber(value, min = -Infinity, max = Infinity) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    static isValidHost(host) {
        if (!host || typeof host !== 'string') return false;

        // Check for IP address
        const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (ipPattern.test(host)) return true;

        // Check for hostname (simple validation)
        const hostnamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
        return hostnamePattern.test(host) && host.length <= 253;
    }

    static isValidPort(port) {
        const num = Number(port);
        return !isNaN(num) && Number.isInteger(num) && num >= 1 && num <= 65535;
    }

    static isValidKeyCode(keyCode) {
        if (!keyCode || typeof keyCode !== 'string') return false;

        // Allow common key codes and combinations
        const validKeyPattern = /^[a-zA-Z0-9]$|^(Ctrl|Alt|Shift)\+[a-zA-Z0-9]$|^F[1-9]|F1[0-2]$|^(Space|Enter|Escape|Tab|Backspace|Delete|Insert|Home|End|PageUp|PageDown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/;
        return validKeyPattern.test(keyCode.trim());
    }

    static isValidDevicePath(path) {
        if (!path || typeof path !== 'string') return false;

        // Basic validation for device paths
        const windowsPattern = /^COM\d+$/i;
        const unixPattern = /^\/dev\/[a-zA-Z0-9_\/]+$/;

        return windowsPattern.test(path) || unixPattern.test(path);
    }

    static isValidBaudRate(baudRate) {
        const validRates = ['9600', '19200', '38400', '57600', '115200'];
        return validRates.includes(baudRate.toString());
    }

    // Validate complete configuration item
    static validateConfigItem(configItem) {
        const errors = [];

        if (!configItem.ioType) {
            errors.push("IO Type is required");
            return errors; // Can't validate parameters without IO type
        }

        if (!configItem.scope) {
            errors.push("Scope is required");
        }

        // Validate parameters based on IO type
        switch (configItem.ioType) {
            case 'Hid':
                errors.push(...this.validateHidParameters(configItem.parameters || {}));
                break;
            case 'Udp':
                errors.push(...this.validateUdpParameters(configItem.parameters || {}));
                break;
            case 'Tcp':
                errors.push(...this.validateTcpParameters(configItem.parameters || {}));
                break;
            case 'Keyboard':
                errors.push(...this.validateKeyboardParameters(configItem.parameters || {}));
                break;
            case 'Usbmux':
                errors.push(...this.validateUsbmuxParameters(configItem.parameters || {}));
                break;
            default:
                errors.push(`Unknown IO Type: ${configItem.ioType}`);
        }

        return errors;
    }

    // Validate JSON configuration file
    static validateConfigurationFile(jsonData) {
        const errors = [];

        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            // Handle new format with IO array
            if (data.IO && Array.isArray(data.IO)) {
                data.IO.forEach((item, index) => {
                    if (!item.Type) {
                        errors.push(`Configuration item ${index + 1}: Type is required`);
                    }
                    if (!item.Scope) {
                        errors.push(`Configuration item ${index + 1}: Scope is required`);
                    }
                    // Basic param validation can be added here if needed
                });
                return errors;
            }

            // Handle old format for backwards compatibility
            if (data.configItems && Array.isArray(data.configItems)) {
                data.configItems.forEach((item, index) => {
                    const itemErrors = this.validateConfigItem(item);
                    if (itemErrors.length > 0) {
                        errors.push(`Configuration item ${index + 1}: ${itemErrors.join(', ')}`);
                    }
                });
                return errors;
            }

            errors.push("Configuration file must contain either 'IO' or 'configItems' array");

        } catch (parseError) {
            errors.push("Invalid JSON format: " + parseError.message);
        }

        return errors;
    }

    // Sanitize and normalize parameters
    static sanitizeParameters(ioType, parameters) {
        const sanitized = { ...parameters };

        switch (ioType) {
            case 'Hid':
                if (sanitized.vendorId && !sanitized.vendorId.startsWith('0x')) {
                    sanitized.vendorId = '0x' + sanitized.vendorId;
                }
                if (sanitized.productId && !sanitized.productId.startsWith('0x')) {
                    sanitized.productId = '0x' + sanitized.productId;
                }
                break;
            case 'Udp':
            case 'Tcp':
                if (sanitized.port) {
                    sanitized.port = parseInt(sanitized.port, 10);
                }
                if (sanitized.timeout) {
                    sanitized.timeout = parseInt(sanitized.timeout, 10);
                }
                break;
            case 'Keyboard':
                if (sanitized.keys) {
                    // Remove empty key mappings
                    Object.keys(sanitized.keys).forEach(button => {
                        if (!sanitized.keys[button] || sanitized.keys[button].trim() === '') {
                            delete sanitized.keys[button];
                        }
                    });
                }
                break;
            case 'Usbmux':
                if (sanitized.baudRate) {
                    sanitized.baudRate = parseInt(sanitized.baudRate, 10);
                }
                break;
        }

        return sanitized;
    }
}

// Export for global use
window.ValidationUtils = ValidationUtils;