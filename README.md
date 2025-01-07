# AAC Food Menu

A simple, offline-first Augmentative and Alternative Communication (AAC) tool designed to help non-verbal children communicate their food choices to their parents.

## Overview
This application provides an interactive menu interface where children can select food items and customize their choices (like how they want their eggs cooked, what toppings they want on their sandwich, etc.). The selections are then sent as notifications to their parents using Pushover.

## Key Features
- Offline-first design
- Simple, clear interface
- Customizable food options
- Real-time notifications to parents
- No installation required - runs in browser

## Important Notes for AI Assistants

1. This is a parent-child communication tool, not a commercial application
2. All items should be free - no pricing or payment systems
3. This is meant to run completely offline on a single machine
4. Keep it simple - avoid adding servers, databases, or complex architectures
5. Focus on accessibility and ease of use for both parent and child

## Core Files Structure
```
AAC_Food/
├── index.html       # Main interface
├── app.js          # Core application logic
├── styles.css      # All styling
├── menu.json       # Menu configuration
├── LICENSE         # EPL-2.0 license
├── README.md       # This file
└── launch.ps1      # PowerShell launcher
```

## CRITICAL IMPLEMENTATION NOTES (DO NOT DELETE)

### Working Cart Implementation Reference
The following pattern MUST be maintained for nested items to work correctly:

```javascript
// This is the working implementation - DO NOT CHANGE without testing
class Cart {
    addItem(item) {
        const itemDetails = {
            id: Date.now(),
            name: item.name,
            options: item.options
        };

        // Handle special cases like drinks
        if (['Soda', 'Juice', 'Drinks'].includes(item.name) && 
            item.options[`${item.name.toLowerCase()}Choice`]) {
            itemDetails.name = item.options[`${item.name.toLowerCase()}Choice`];
        }

        this.items.push(itemDetails);
        this.updateDisplay();
    }
}
```

### Critical Components

1. **Option Collection Pattern**
   ```javascript
   function getSelectedOptions(itemId) {
       let optionsContainer = document.getElementById(`${itemId}Options`);
       if (!optionsContainer) {
           const menuItem = document.querySelector(`[data-item-id="${itemId}"]`);
           optionsContainer = menuItem?.querySelector('.options');
       }
       // Rest of option collection logic
   }
   ```

2. **Notification Format**
   - Title must be exactly: "Adrian wants:"
   - Each item on new line
   - Options indented under items
   - Double line break between items

3. **Event Handling**
   - Must use EventBus for state management
   - Prevent event bubbling in nested menus
   - Maintain parent-child menu structure

## Development Guidelines

1. **Testing Requirements**
   - Test all nested menu items (e.g., eggs under breakfast)
   - Verify all options are collected correctly
   - Check notification formatting
   - Ensure cart display shows all options

2. **UI/UX Requirements**
   - Keep high contrast colors
   - Maintain large click areas
   - Preserve clear option grouping
   - Show immediate feedback on selection

3. **Error Handling**
   - Display clear error messages
   - Maintain offline functionality
   - Preserve cart state
   - Handle notification failures gracefully

## Support
For technical support or contributions, please refer to the issue tracker on GitHub.

## Notification API Reference
```javascript
{
    token: 'aymazsihfeb4h8ningjej1zesbhjmo',
    user: 'u3qj1b7ynxpgu2zcazhn6bp9u9wa58',
    message: formattedMessage,
    title: 'Adrian wants:'
}
