# Ongeki IO Web Configurator

A static web-based configuration generator for the [ongeki-io](https://github.com/Sanheiii/ongeki-io) input system. This tool allows you to create and manage configuration files for various input devices used with the Ongeki rhythm game.

## Features

- **Multiple Input Types**: Support for HID, UDP, TCP, USB Multiplexer, and Keyboard inputs
- **Real-time Validation**: Input validation with immediate feedback
- **Configuration Management**: Add, edit, delete, and toggle configurations
- **JSON Import/Export**: Save and load configuration files
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Automatically saves your work locally

## Supported Input Types

### HID (Human Interface Device)
- Vendor ID and Product ID configuration
- Usage and Usage Page settings
- Direct hardware device communication

### UDP/TCP Network
- Host and port configuration
- Timeout settings
- Keep-alive options (TCP only)

### Keyboard
- Custom key mappings for all buttons
- Support for modifier keys (Ctrl, Alt, Shift)
- Function keys and special keys

### USB Multiplexer
- Device path configuration
- Baud rate settings
- Protocol selection

## Usage

1. **Open the Application**: Open `index.html` in any modern web browser
2. **Add Configuration**: Click "Add Configuration" to create a new input configuration
3. **Select Input Type**: Choose from HID, UDP, TCP, Keyboard, or USB Multiplexer
4. **Configure Parameters**: Fill in the required parameters for your selected input type
5. **Set Scope**: Define what controls this configuration applies to (All, Button, Lever, LED)
6. **Save**: Click "Save Configuration" to add it to your list
7. **Export**: Use "Export JSON" to download your configuration file

## Configuration Scopes

- **All**: Configuration applies to all input/output controls
- **Button**: Configuration applies to button inputs only
- **Lever**: Configuration applies to lever/analog inputs only
- **LED**: Configuration applies to LED outputs only

## File Format

The configurator exports JSON files compatible with the original ongeki-io IOConfig application:

```json
{
  "version": "1.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "configItems": [
    {
      "ioType": "Hid",
      "scope": "All",
      "parameters": {
        "vendorId": "0x1234",
        "productId": "0x5678"
      },
      "enabled": true
    }
  ]
}
```

## Browser Compatibility

- Chrome/Chromium 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Local Development

No build process required! Simply:

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Start configuring your input devices

## Data Storage

- Configurations are automatically saved to browser localStorage
- Data persists between sessions
- No server or internet connection required
- Export to JSON files for backup or sharing

## Input Validation

The configurator includes comprehensive validation:

- **HID**: Validates hexadecimal vendor/product IDs
- **Network**: Validates IP addresses, hostnames, and port ranges
- **Keyboard**: Validates key codes and prevents duplicate mappings
- **USB**: Validates device paths and baud rates

## Contributing

This is a static web application built with vanilla HTML, CSS, and JavaScript. To contribute:

1. Fork the repository
2. Make your changes
3. Test in multiple browsers
4. Submit a pull request

## License

This project follows the same license as the original ongeki-io project.

## Related Projects

- [ongeki-io](https://github.com/Sanheiii/ongeki-io) - The main IO library for segatools
- Original IOConfig WinUI application included in the ongeki-io repository