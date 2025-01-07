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

class Cart {
    constructor() {
        this.items = [];
        this.container = document.getElementById('cartContents');
        this.errorDisplay = document.getElementById('cartError');
        this.init();
    }

    init() {
        window.EventBus.on('addToCart', (item) => this.addItem(item));
        window.EventBus.on('removeFromCart', (itemId) => this.removeItem(itemId));
    }

    addItem(item) {
        const itemDetails = {
            id: Date.now(),
            name: item.name,
            options: item.options
        };

        // Handle drink selections
        if (['Soda', 'Juice', 'Drinks'].includes(item.name) && item.options[`${item.name.toLowerCase()}Choice`]) {
            itemDetails.name = item.options[`${item.name.toLowerCase()}Choice`];
        }

        this.items.push(itemDetails);
        this.updateDisplay();
        window.EventBus.emit('itemAdded', itemDetails);
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
                    <button onclick="window.EventBus.emit('removeFromCart', ${item.id})">Remove</button>
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

// Menu item option handling
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
            data[element.name] = element.value.trim();
        } else if (element.tagName === 'SELECT' && element.value) {
            data[element.name] = element.value;
        }
    });
    return data;
}

function toggleOptions(event, itemId) {
    // Handle both parameter orders
    if (typeof event === 'string') {
        [event, itemId] = [itemId, event];
    }
    if (event) event.stopPropagation();

    let optionsDiv = document.getElementById(`${itemId}Options`);
    if (!optionsDiv) {
        const menuItem = document.querySelector(`[data-item-id="${itemId}"]`);
        optionsDiv = menuItem?.querySelector('.options');
    }
    if (optionsDiv) {
        const isHidden = optionsDiv.style.display === 'none';
        optionsDiv.style.display = isHidden ? 'block' : 'none';
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Initialize EventBus
    window.EventBus = new EventBus();
    
    // Initialize Cart
    window.cart = new Cart();
    
    // Add global handlers
    window.toggleOptions = toggleOptions;
    window.addToCart = function(itemName) {
        const itemId = itemName.toLowerCase().replace(/\s+/g, '-');
        const options = getSelectedOptions(itemId);
        window.cart.addItem({ name: itemName, options: options });
    };
    window.checkout = function() {
        window.cart?.checkout();
    };
});
