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
    
    window.clearCart = function() {
        AAC.cart?.clearCart();
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
    
    // Get notes first
    const notesElement = optionsContainer.querySelector('textarea[id^="notes"]');
    if (notesElement && notesElement.value.trim()) {
        data.notes = notesElement.value.trim();
    }

    // Get other options
    optionsContainer.querySelectorAll('input, select').forEach(element => {
        if (!element.name) return;
        
        if (element.type === 'radio' && element.checked) {
            data[element.name] = element.value;
        } else if (element.type === 'checkbox' && element.checked) {
            if (!data[element.name]) data[element.name] = [];
            data[element.name].push(element.value);
        } else if (element.type === 'text' && element.value.trim()) {
            data[element.name] = element.value.trim();
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

// Helper functions for standardized options
function getStandardCheeseOptions(itemPrefix) {
    return `
        <input type="checkbox" id="${itemPrefix}CheeseNone" name="${itemPrefix}Cheese" value="None">
        <label for="${itemPrefix}CheeseNone">None</label>
        <input type="checkbox" id="${itemPrefix}CheeseAmerican" name="${itemPrefix}Cheese" value="American">
        <label for="${itemPrefix}CheeseAmerican">American</label>
        <input type="checkbox" id="${itemPrefix}CheeseMozzarella" name="${itemPrefix}Cheese" value="Mozzarella">
        <label for="${itemPrefix}CheeseMozzarella">Mozzarella</label>
        <input type="checkbox" id="${itemPrefix}CheeseCheddar" name="${itemPrefix}Cheese" value="Cheddar">
        <label for="${itemPrefix}CheeseCheddar">Cheddar</label>
        <input type="checkbox" id="${itemPrefix}CheesePepperJack" name="${itemPrefix}Cheese" value="Pepper Jack">
        <label for="${itemPrefix}CheesePepperJack">Pepper Jack</label>
        <input type="checkbox" id="${itemPrefix}CheeseMontereyJack" name="${itemPrefix}Cheese" value="Monterey Jack">
        <label for="${itemPrefix}CheeseMontereyJack">Monterey Jack</label>
        <input type="checkbox" id="${itemPrefix}CheeseParmesan" name="${itemPrefix}Cheese" value="Parmesan">
        <label for="${itemPrefix}CheeseParmesan">Parmesan</label>
        <input type="checkbox" id="${itemPrefix}CheeseMuenster" name="${itemPrefix}Cheese" value="Muenster">
        <label for="${itemPrefix}CheeseMuenster">Muenster</label>
        <input type="checkbox" id="${itemPrefix}CheeseGouda" name="${itemPrefix}Cheese" value="Gouda">
        <label for="${itemPrefix}CheeseGouda">Gouda</label>
        <input type="checkbox" id="${itemPrefix}CheeseSwiss" name="${itemPrefix}Cheese" value="Swiss">
        <label for="${itemPrefix}CheeseSwiss">Swiss</label>
    `;
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
            options: {},
            notes: item.options.notes || ''  // Extract notes
        };

        // Copy all options except notes
        Object.entries(item.options || {}).forEach(([key, value]) => {
            if (key !== 'notes') {
                itemDetails.options[key] = value;
            }
        });

        // Handle special cases
        if (['Drinks', 'Juice', 'Soda'].includes(item.name)) {
            if (itemDetails.options.drinksChoice) {
                itemDetails.name = itemDetails.options.drinksChoice;
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
            const optionsArray = Object.entries(item.options || {})
                .map(([key, value]) => {
                    const cleanKey = key.replace(/([A-Z])/g, ' $1')
                                     .replace(/Choice$/, '')
                                     .trim();
                    return Array.isArray(value) 
                        ? `${cleanKey}: ${value.join(', ')}`
                        : `${cleanKey}: ${value}`;
                });
            
            // Add notes as last item if they exist
            if (item.notes) {
                optionsArray.push(`Notes: ${item.notes}`);
            }
            
            return `
                <li>
                    ${item.name}
                    ${optionsArray.length ? `<pre>${optionsArray.join('\n')}</pre>` : ''}
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
                
                // Add options
                const options = Object.entries(item.options)
                    .map(([key, value]) => {
                        const cleanKey = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/Choice$/, '')
                            .trim();
                        return Array.isArray(value)
                            ? `${cleanKey}: ${value.join(', ')}`
                            : `${cleanKey}: ${value}`;
                    });

                if (options.length) {
                    itemText += '\n' + options.join('\n');
                }

                // Add notes last
                if (item.notes) {
                    itemText += '\nNotes: ' + item.notes;
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

    clearCart() {
        if (this.items.length === 0) {
            this.showError('Cart is already empty');
            return;
        }
        
        if (confirm('Are you sure you want to clear the cart?')) {
            this.items = [];
            this.updateDisplay();
        }
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
    
    // Initialize quantity dropdowns
    document.querySelectorAll('select[name$="Count"]').forEach(select => {
        // Clear existing options
        select.innerHTML = '<option value="">Select quantity</option>';
        // Add options 1-20
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} ${select.id.replace('Count', '')}${i === 1 ? '' : 's'}`;
            select.appendChild(option);
        }
    });
    
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

    // Add sandwich style handler
    const sandwichStyleInputs = document.querySelectorAll('input[name="sandwichStyle"]');
    const regularOptions = document.getElementById('regularSandwichOptions');
    const pbjOptions = document.getElementById('pbjOptions');
    const cheeseOptions = document.getElementById('cheeseOptions');

    sandwichStyleInputs.forEach(input => {
        input.addEventListener('change', function() {
            switch(this.value) {
                case 'Regular':
                    regularOptions.style.display = 'block';
                    pbjOptions.style.display = 'none';
                    cheeseOptions.style.display = 'block';
                    break;
                case 'Grilled Cheese':
                    regularOptions.style.display = 'none';
                    pbjOptions.style.display = 'none';
                    cheeseOptions.style.display = 'block';
                    break;
                case 'PB & J':
                    regularOptions.style.display = 'none';
                    pbjOptions.style.display = 'block';
                    cheeseOptions.style.display = 'none';
                    break;
            }
        });
    });

    // Initialize standard cheese options
    document.querySelectorAll('[id$="CheeseOptions"]').forEach(container => {
        const itemPrefix = container.id.replace('CheeseOptions', '').toLowerCase();
        container.innerHTML = getStandardCheeseOptions(itemPrefix);
    });

    // Make functions globally available
    window.toggleOptions = toggleOptions;
    window.addToCart = addToCart;
    window.checkout = checkout;

    AAC.initialized = true;
});
