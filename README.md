# EGOS Shared Controls

A comprehensive React component library for EGOS device controls and common UI components.

## 🏆 PROJECT STATUS: 100% COMPLETE!

**30 device controls** and **11 common components** successfully migrated and ready for production use across the EGOS ecosystem.

## Overview

This package provides a complete standardized set of device control components and common UI elements that can be shared between EGOS-Cloud and EGOS-Controller applications. All components are professional-grade, escape room optimized, and mobile-responsive.

## Installation

```bash
npm install @egos/shared-controls
```

## Usage

### Device Controls

```jsx
import { ButtonControl, SwitchControl, ControlWrapper } from '@egos/shared-controls';

// Use individual controls
<ButtonControl 
  device={device} 
  isUpdating={false} 
  client={mqttClient} 
  publishMessage={publishMessage} 
/>

// Or wrap custom content
<ControlWrapper>
  <div>Custom control content</div>
</ControlWrapper>
```
### Common UI Components

```jsx
import { Button, Card, CardContent, Input, Label } from '@egos/shared-controls';

<Card>
  <CardContent>
    <Label>Device Name</Label>
    <Input value={name} onChange={setName} />
    <Button onClick={handleSave}>Save</Button>
  </CardContent>
</Card>
```

## Available Components (41 Total - 100% Complete!)

### Core EGOS Device Controls (11/11)
- `ControlWrapper` - Base wrapper for consistent styling
- `ButtonControl` - Physical button input control
- `SwitchControl` - Switch/relay output control
- `SensorControl` - Sensor value display and input simulation
- `LCDControl` - LCD display text control
- `NeopixelControl` - RGB LED strip control with color picker
- `KeypadControl` - 4x4 keypad input device
- `QRControl` - QR code reader control
- `RfidControl` - RFID reader control
- `StepMotorControl` - Stepper motor control
- `BidirectionalMotorControl` - Bidirectional motor control

### MIDI Controls (2/2)
- `MidiInputControl` - MIDI input with piano keyboard visualization
- `MidiOutputControl` - MIDI output with piano keyboard and controls
### Home Assistant Controls (15/15)
- `HALightControl` - HA light device with brightness/color
- `HASwitchControl` - HA switch device
- `HASensorControl` - Comprehensive sensor monitoring
- `HABinarySensorControl` - Motion, door, occupancy sensors
- `HAButtonControl` - Device class specific buttons
- `HASelectControl` - Dropdown selection control
- `HANumberControl` - Number input with slider
- `HALockControl` - Security lock/unlock with emergency features
- `HAFanControl` - Fan speed control with atmospheric presets
- `HACoverControl` - Cover position control for blinds/doors
- `HAClimateControl` - HVAC temperature/humidity control
- `HAMediaPlayerControl` - Media transport with external URL support
- `HACameraControl` - Camera feed display with state monitoring
- `HAWeatherControl` - Weather data display with refresh capability
- `HASunControl` - Sun position & sunrise/sunset times

### Professional Controls (1/1)
- `DMXControl` - Professional lighting control

### Common UI Components
- `Button` - Standard button with variants
- `Card`, `CardContent`, `CardHeader`, `CardFooter` - Container components
- `Input` - Text input field
- `Label` - Form label
- `Slider` - Range slider input
- `ToggleSwitch` - Toggle switch component
- `BrightnessSlider` - Specialized brightness control
- `Dropdown` - Select dropdown
- `Popover`, `PopoverContent`, `PopoverTrigger` - Floating popover
- `Modal` - Modal dialog
## Component Patterns

All device controls follow these patterns:

### Props Interface
```jsx
{
  device: Object,        // Device state and configuration
  isUpdating: boolean,   // Whether device is currently updating
  client: Object,        // MQTT client instance
  publishMessage: Function // Function to publish MQTT messages
}
```

### MQTT Topic Pattern
```
${device.moduleId}/device/${device.id}/input      // For input events
${device.moduleId}/device/${device.id}/output/command  // For output commands
```

### Message Format
```jsx
{
  command: 'commandName',
  parameters: {
    // Command-specific parameters
  }
}
```

## Development

### Project Structure
```
src/
├── index.js                    # Main entry point
└── components/
    ├── common/                 # Shared UI components
    │   ├── index.js           # Common exports
    │   └── *.jsx              # Individual components
    └── controls/              # Device controls
        ├── index.js          # Control exports
        ├── ControlWrapper.jsx # Base wrapper
        └── *Control.jsx      # Individual controls
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

## Contributing

When adding new components:

1. Follow existing patterns and naming conventions
2. Use `ControlWrapper` for device controls
3. Include proper TypeScript-style prop destructuring
4. Follow Tailwind CSS styling patterns
5. Add to appropriate index.js files

## Dependencies

- React 18+
- lucide-react (icons)
- Tailwind CSS (styling)

## License

MIT