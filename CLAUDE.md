# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EGOS-Shared** is a React component library package (`@egos/shared-controls`) that provides standardized device controls and common UI components for the EGOS (Enhanced Gaming Operating System) ecosystem. This package is consumed by both **EGOS-Cloud** and **EGOS-Controller** applications to ensure consistent UI/UX across the platform.

### Package Purpose
- Provides 41 production-ready React components (100% complete)
- 29 device-specific controls for EGOS hardware modules and Home Assistant integrations
- 12 common UI components for consistent styling across applications
- Eliminates code duplication between Cloud and Controller applications
- Enables rapid development of new device integrations

## Architecture

### Component Categories

**1. EGOS Device Controls (11 components)**
- Native hardware module controls (Buttons, Switches, LEDs, Motors, Sensors, etc.)
- Direct MQTT communication with physical devices
- Support for 12+ hardware module types in the EGOS ecosystem

**2. Home Assistant Controls (15 components)**
- Integration controls for Home Assistant devices
- Covers lights, switches, sensors, climate, media players, cameras, etc.
- Handles HA-specific state management and service calls

**3. Professional Controls (2 components)**
- MIDI input/output with piano keyboard visualization
- DMX lighting control for professional installations

**4. Common UI Components (12 components)**
- Base UI primitives (Button, Card, Input, Label, Slider)
- Specialized components (ColorPicker, BrightnessSlider, Modal, Popover)
- Consistent Tailwind CSS styling

### MQTT Communication Pattern

All device controls follow this standardized MQTT messaging pattern:

**Input Events (from device to system):**
```
{moduleId}/device/{deviceId}/input
```

**Output Commands (from system to device):**
```
{moduleId}/device/{deviceId}/output/command
```

**Message Structure:**
```javascript
{
  command: 'commandName',
  parameters: {
    // Command-specific parameters
  }
}
```

### Component Props Interface

All device controls accept these standard props:

```javascript
{
  device: {
    id: string,
    moduleId: string,
    name: string,
    type: string,
    state: object,        // Device-specific state
    config: object        // Device-specific configuration
  },
  isUpdating: boolean,    // UI loading state
  client: object,         // MQTT client instance
  publishMessage: function // (topic, message) => Promise<void>
}
```

## Build System

### Technology Stack
- **Build Tool**: Rollup with plugins for React, Babel, and PostCSS
- **Transpiler**: Babel with React preset (automatic JSX runtime)
- **Styling**: Tailwind CSS (embedded, not extracted)
- **Output**: CommonJS and ES Module formats

### Build Configuration
The build produces two output formats:
- `dist/index.js` - CommonJS bundle with sourcemaps
- `dist/index.esm.js` - ES Module bundle with sourcemaps

Peer dependencies (React, React-DOM, lucide-react) are externalized and not bundled.

## Development Commands

### Building the Library
```bash
npm run build           # Production build to dist/
npm run dev             # Watch mode for development
```

### Testing
```bash
npm test               # Run Jest test suite
```

### Publishing
```bash
npm run prepublishOnly # Runs build before publishing (automatic)
```

## File Structure

```
src/
├── index.js                      # Main entry point, exports all components
└── components/
    ├── common/                   # 12 shared UI components
    │   ├── index.js             # Common exports
    │   ├── Button.jsx
    │   ├── Card.jsx
    │   ├── ColorPicker.jsx      # Advanced HSV color picker
    │   ├── BrightnessSlider.jsx
    │   ├── Modal.jsx
    │   ├── Popover.jsx
    │   └── ...
    └── controls/                 # 29 device-specific controls
        ├── index.js             # Control exports
        ├── ControlWrapper.jsx   # Base wrapper for consistent styling
        ├── ButtonControl.jsx
        ├── SwitchControl.jsx
        ├── NeopixelControl.jsx  # Advanced RGB LED control
        ├── HALightControl.jsx   # Home Assistant light integration
        ├── MidiInputControl.jsx # MIDI with piano keyboard
        └── ...
```

## Adding New Components

When creating new components, follow these patterns:

### Device Control Checklist
1. **Create component file** in `src/components/controls/{Name}Control.jsx`
2. **Use ControlWrapper** for consistent base styling
3. **Implement standard props**: `{ device, isUpdating, client, publishMessage }`
4. **Follow MQTT topic pattern**: `{moduleId}/device/{deviceId}/input` or `/output/command`
5. **Export from** `src/components/controls/index.js`
6. **Re-export from** `src/index.js` for convenience
7. **Handle disabled states** when `isUpdating` or `!client`
8. **Use Tailwind CSS** for styling consistency

### Common UI Component Checklist
1. **Create component file** in `src/components/common/{Name}.jsx`
2. **Use consistent prop patterns** (className, disabled, onChange, etc.)
3. **Export from** `src/components/common/index.js`
4. **Re-export from** `src/index.js` if commonly used
5. **Follow Tailwind styling** patterns from existing components

### Export Pattern
Components use a mix of default and named exports:
- **Named exports**: Most controls use `export const ComponentName = () => {}`
- **Default exports**: Some controls use `export default ComponentName`
- **Consistent re-exports**: All components are re-exported as named exports from `index.js`

## Key Implementation Details

### Color Handling
The library includes sophisticated color handling for lighting controls:
- **ColorPicker component**: Full HSV color picker with hex input
- **Dual format support**: Accepts both hex strings (`#ff0000`) and RGB arrays (`[255, 0, 0]`)
- **Automatic conversion**: Converts between formats as needed
- **Modal or Popover modes**: Flexible UI presentation

### MQTT Message Publishing
All controls use the `publishMessage` function passed via props:

```javascript
const handleCommand = async () => {
  const topic = `${device.moduleId}/device/${device.id}/output/command`;
  await publishMessage(topic, {
    command: 'setColor',
    parameters: {
      color: [255, 0, 0]
    }
  });
};
```

### State Management
- **Device state**: Maintained by parent application (Cloud/Controller)
- **Local UI state**: Managed within components for transient interactions
- **Optimistic updates**: UI responds immediately, state confirmed via MQTT

### Home Assistant Integration
HA controls handle the bridge between EGOS MQTT topics and Home Assistant service calls:
- **Entity state**: Read from `device.state`
- **Service calls**: Published to appropriate HA topics
- **Device classes**: Specialized icons and controls based on HA device class

## Integration with EGOS Ecosystem

### Parent Applications
This library is consumed by:
- **EGOS-Cloud** (`D:\Repos\EGOS\EGOS-Cloud`) - Cloud-based game engine and web studio
- **EGOS-Controller** (`D:\Repos\EGOS\EGOS-Controller`) - Local controller and MQTT bridge

### Hardware Modules
Components support these module types (from `D:\Repos\EGOS\Modules\`):
- EGOS-Module-Buttons (16-button inputs)
- EGOS-Module-Leds (LED outputs)
- EGOS-Module-Neopixel (RGB LED strips)
- EGOS-Module-Sensors (temperature, motion, proximity)
- EGOS-Module-Motors (stepper and bidirectional motors)
- EGOS-Module-KeypadLcd (4x4 keypad + 20x4 LCD)
- EGOS-Module-QrRfid (QR and RFID readers)
- EGOS-Module-LedButtons (illuminated buttons)
- EGOS-Module-12vLights (high-power lighting)
- EGOS-Module-AV (audio/video control)
- EGOS-Module-DmxMidi (professional lighting/audio)
- EGOS-Module-Phone (communication systems)

### Testing Changes
After making changes to this library:
1. **Build the library**: `npm run build`
2. **Test in EGOS-Cloud**: Link or install updated package
3. **Test in EGOS-Controller**: Link or install updated package
4. **Verify MQTT communication**: Use debug scripts in parent repos
5. **Test with hardware**: If available, test with actual module devices

## Dependencies

### Peer Dependencies (Not Bundled)
- `react`: ^18.0.0 || ^19.0.0
- `react-dom`: ^18.0.0 || ^19.0.0

### Runtime Dependencies (Bundled)
- `lucide-react`: ^0.263.1 - Icon library
- `clsx`: ^2.0.0 - Conditional class utility
- `class-variance-authority`: ^0.7.0 - Component variant utility

### Development Dependencies
- Rollup build toolchain
- Babel React transpiler
- Jest testing framework
- React Testing Library

## Important Notes

### Git Repository
This is a local Git repository. The package.json references:
```json
"repository": {
  "type": "git",
  "url": "file:../EGOS-Shared"
}
```

### Package Distribution
To use this package in EGOS-Cloud or EGOS-Controller:
```bash
# In parent application directory
npm install ../EGOS-Shared
# Or use npm link for development
cd D:\Repos\EGOS\EGOS-Shared
npm link
cd D:\Repos\EGOS\EGOS-Cloud
npm link @egos/shared-controls
```

### Styling Requirements
Applications consuming this library must have Tailwind CSS configured to process the component classes. The library does not include compiled CSS.

### React Version Compatibility
The library supports both React 18 and React 19. Components use the automatic JSX runtime (no explicit React imports required).
