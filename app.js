// Create global namespace first
window.AAC = {
    EventBus: null,
    cart: null,
    menuState: null,
    initialized: false
};

// Define base classes first
class EventBus {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

class MenuStateManager {
    constructor() {
        this.states = new Map();
        this.parentChildMap = new Map();
    }

    setParentChild(parentId, childId) {
        if (!this.parentChildMap.has(parentId)) {
            this.parentChildMap.set(parentId, new Set());
        }
        this.parentChildMap.get(parentId).add(childId);
    }

    toggle(id) {
        const newState = !this.isExpanded(id);
        this.states.set(id, newState);
        
        // If closing a parent, close all children
        if (!newState && this.parentChildMap.has(id)) {
            this.parentChildMap.get(id).forEach(childId => {
                this.states.set(childId, false);
            });
        }
        
        return newState;
    }

    isExpanded(id) {
        return this.states.get(id) || false;
    }
}

// Core initialization
(function() {
    // Initialize core components
    AAC.EventBus = new EventBus();
    AAC.menuState = new MenuStateManager();
    
    // Define global functions
    window.toggleOptions = function(event, itemId) {
        if (typeof event === 'string') {
            [event, itemId] = [itemId, event];
        }
        
        if (!itemId) return;
        
        const optionsDiv = findOptionsContainer(itemId);
        if (!optionsDiv) return;

        if (event instanceof Event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const shouldShow = !optionsDiv.style.display || optionsDiv.style.display === 'none';
        optionsDiv.style.display = shouldShow ? 'block' : 'none';
        
        // Update menu state
        AAC.menuState.states.set(itemId, shouldShow);
        
        // Close siblings if opening
        if (shouldShow) {
            const menuItem = optionsDiv.closest('.menu-item');
            const parent = menuItem?.parentElement?.closest('.menu-item');
            const siblings = parent 
                ? Array.from(parent.querySelectorAll(':scope > .menu-item'))
                : Array.from(document.querySelectorAll(':scope > .menu-container > .menu-item'));
            
            siblings.forEach(sibling => {
                const siblingId = sibling.getAttribute('data-item-id') || sibling.id;
                if (siblingId && siblingId !== itemId) {
                    const siblingOptions = findOptionsContainer(siblingId);
                    if (siblingOptions) {
                        siblingOptions.style.display = 'none';
                        AAC.menuState.states.set(siblingId, false);
                    }
                }
            });
        }
    };

    // Initialize helper functions
    window.addToCart = function(itemName) {
        if (!AAC.cart) return;
        const itemId = itemName.toLowerCase().replace(/\s+/g, '-');
        const options = getSelectedOptions(itemId);
        AAC.cart.addItem({ name: itemName, options: options });
    };

    window.checkout = function() {
        AAC.cart?.checkout();
    };
})();

// Helper functions
function findOptionsContainer(itemId) {
    // Try different ID formats
    const idFormats = [
        `${itemId}Options`,
        `${itemId}-options`,
        itemId
    ];

    // Try each ID format
    for (const id of idFormats) {
        const element = document.getElementById(id);
        if (element) return element;
    }

    // Try data attribute as fallback
    const menuItem = document.querySelector(`[data-item-id="${itemId}"]`);
    return menuItem?.querySelector('.options');
}

function getSelectedOptions(itemId) {
    let optionsContainer = document.getElementById(`${itemId}Options`);
    if (!optionsContainer) {
        const menuItem = document.querySelector(`[data-item-id="${itemId}"]`);
        optionsContainer = menuItem?.querySelector('.options');
    }
    if (!optionsContainer) return {};

    const data = {};
    optionsContainer.querySelectorAll('input, select, textarea').forEach(element => {
        if (!element.name) return;
        
        if (element.type === 'radio' && element.checked) {
            data[element.name] = element.value;
        } else if (element.type === 'checkbox' && element.checked) {
            if (!data[element.name]) data[element.name] = [];
            data[element.name].push(element.value);
        } else if ((element.type === 'text' || element.tagName === 'TEXTAREA') && element.value.trim()) {
            // Handle notes specifically
            if (element.id.toLowerCase().includes('notes')) {
                data.notes = element.value.trim();
            } else {
                data[element.name] = element.value.trim();
            }
        } else if (element.tagName === 'SELECT' && element.value) {
            data[element.name] = element.value;
        }
    });
    return data;
}

// Remove duplicate normalizeItemId function
function normalizeItemId(itemId) {
    return itemId.toLowerCase().replace(/\s+/g, '-');
}

// Cart class implementation
class Cart {
    constructor() {
        this.items = [];
        this.container = document.getElementById('cartContents');
        this.errorDisplay = document.getElementById('cartError');
        this.init();
    }

    init() {
        AAC.EventBus.on('addToCart', (item) => this.addItem(item));
        AAC.EventBus.on('removeFromCart', (itemId) => this.removeItem(itemId));
    }

    addItem(item) {
        const itemDetails = {
            id: Date.now(),
            name: item.name,
            options: item.options
        };

        // Enhanced beverage handling
        if (['Drinks', 'Juice', 'Soda'].includes(item.name)) {
            if (item.options.type) {
                itemDetails.name = item.options.type;
            }
            // Include temperature and container options
            if (item.options.temperature) {
                itemDetails.options.temperature = item.options.temperature;
            }
            if (item.options.container) {
                itemDetails.options.container = item.options.container;
            }
        }

        this.items.push(itemDetails);
        this.updateDisplay();
        AAC.EventBus.emit('itemAdded', itemDetails);
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.updateDisplay();
    }

    updateDisplay() {
        this.container.innerHTML = this.items.map(item => {
            const formattedOptions = Object.entries(item.options || {})
                .filter(([key, value]) => value && String(value).trim())
                .map(([key, value]) => {
                    if (key === 'notes') return `Notes: ${value}`;
                    const cleanKey = key.replace(/([A-Z])/g, ' $1')
                                     .replace(/Choice$/, '')
                                     .trim();
                    return `${cleanKey}: ${value}`;
                })
                .join('\n');
            
            return `
                <li>
                    ${item.name}
                    ${formattedOptions ? `<pre>${formattedOptions}</pre>` : ''}
                    <button class="remove-item" onclick="AAC.EventBus.emit('removeFromCart', ${item.id})">×</button>
                </li>
            `;
        }).join('');
    }

    checkout() {
        if (this.items.length === 0) {
            this.showError('Cart is empty');
            return;
        }

        const message = this.items
            .map(item => {
                let itemText = item.name;
                if (item.options) {
                    const options = Object.entries(item.options)
                        .filter(([key, value]) => value && String(value).trim())
                        .map(([key, value]) => {
                            const cleanKey = key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/Choice$/, '')
                                .trim();
                            return `${cleanKey}: ${value}`;
                        })
                        .join('\n');
                    if (options) {
                        itemText += '\n' + options;
                    }
                }
                return itemText;
            })
            .join('\n\n');

        fetch('https://api.pushover.net/1/messages.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: 'aymazsihfeb4h8ningjej1zesbhjmo',
                user: 'u3qj1b7ynxpgu2zcazhn6bp9u9wa58',
                message: message,
                title: 'Adrian wants:'
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to send notification');
            this.items = [];
            this.updateDisplay();
            alert('Order sent successfully!');
        })
        .catch(error => {
            console.error('Failed to send notification:', error);
            this.showError('Failed to send order. Please try again.');
        });
    }

    showError(message) {
        this.errorDisplay.textContent = message;
        this.errorDisplay.style.display = 'block';
        setTimeout(() => {
            this.errorDisplay.style.display = 'none';
        }, 3000);
    }
}

// Update DOM Ready handler
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Cart
    AAC.cart = new Cart();
    
    // Setup parent-child relationships and colors
    document.querySelectorAll('.menu-item').forEach(item => {
        const parentId = item.closest('.menu-item')?.id;
        const itemId = item.getAttribute('data-item-id');
        
        // Set up parent-child relationship
        if (parentId && itemId && parentId !== itemId) {
            AAC.menuState.setParentChild(parentId, itemId);
        }

        // Handle temperature-dependent options
        const tempInputs = item.querySelectorAll('input[name$="Temp"]');
        tempInputs.forEach(input => {
            input.addEventListener('change', function() {
                const container = this.closest('.preparation-options');
                const heatingOptions = container?.querySelector('.heating-method');
                if (heatingOptions) {
                    heatingOptions.style.display = 
                        (this.value === 'Hot' || this.value === 'Warm') ? 'block' : 'none';
                }
            });
        });
    });

    // Make functions globally available
    window.toggleOptions = toggleOptions;
    window.addToCart = addToCart;
    window.checkout = checkout;

    AAC.initialized = true;
});
