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

function populateCheeseOptions() {
    const cheeseOptions = [
        { value: 'None', label: 'None' },
        { value: 'American', label: 'American' },
        { value: 'Cheddar', label: 'Cheddar' },
        { value: 'Swiss', label: 'Swiss' },
        { value: 'Pepperjack', label: 'Pepperjack' },
        { value: 'Monterey Jack', label: 'Monterey Jack' },
        { value: 'Muenster', label: 'Muenster' },
        { value: 'Mozzarella', label: 'Mozzarella' },
        { value: 'Provolone', label: 'Provolone' },
        { value: 'Parmesan', label: 'Parmesan' }
    ];

    const cheeseContainers = document.querySelectorAll('[id$="CheeseOptions"]');
    cheeseContainers.forEach(container => {
        container.className = 'cheese-options option-group';
        const groupName = container.id.replace('CheeseOptions', 'Cheese');
        
        container.innerHTML = cheeseOptions.map(cheese => `
            <div class="option-choice">
                <label>
                    <input type="radio" 
                           name="${groupName}" 
                           value="${cheese.value}"
                           ${cheese.value === 'None' ? 'checked' : ''}>
                    ${cheese.label}
                </label>
            </div>
        `).join('');
    });
}

function populateLocationOptions(container) {
    const locationOptions = [
        { value: 'eat-home', label: 'Eat at Home' },
        { value: 'buy-store', label: 'Get from Store' },
        { value: 'eat-store', label: 'Eat at Store' },
        { value: 'delivery', label: 'Have it Delivered' }
    ];

    const locationGroup = document.createElement('div');
    locationGroup.className = 'option-group';
    locationGroup.innerHTML = `
        <h4>Where would you like to eat this?</h4>
        ${locationOptions.map(opt => `
            <div class="option-choice">
                <label>
                    <input type="radio" name="locationChoice" value="${opt.value}" 
                           ${opt.value === 'eat-home' ? 'checked' : ''}>
                    ${opt.label}
                </label>
            </div>
        `).join('')}
    `;
    container.appendChild(locationGroup);
}

function populateCookingOptions(container, availableMethods) {
    if (!availableMethods || availableMethods.length === 0) return;

    const cookingGroup = document.createElement('div');
    cookingGroup.className = 'option-group';
    cookingGroup.innerHTML = `
        <h4>How would you like this cooked?</h4>
        ${availableMethods.map(method => `
            <div class="option-choice">
                <label>
                    <input type="radio" name="cookingMethod" value="${method.value}" 
                           ${method.default ? 'checked' : ''}>
                    ${method.label}
                </label>
            </div>
        `).join('')}
    `;
    container.appendChild(cookingGroup);
}

function initializeMenuOptions() {
    // Add egg quantity options
    const eggsOptions = document.querySelector('#eggs-options');
    if (eggsOptions) {
        const eggQuantities = ['1 egg', '2 eggs', '3 eggs', '4 eggs'];
        const quantityGroup = document.createElement('div');
        quantityGroup.className = 'option-group';
        quantityGroup.innerHTML = `
            <h4>How many eggs?</h4>
            ${eggQuantities.map(qty => `
                <div class="option-choice">
                    <label>
                        <input type="radio" name="eggQuantity" value="${qty}" 
                               ${qty === '2 eggs' ? 'checked' : ''}>
                        ${qty}
                    </label>
                </div>
            `).join('')}
        `;
        eggsOptions.insertBefore(quantityGroup, eggsOptions.firstChild);
    }

    // Populate lunch items from LunchMenu.ps1
    const lunchItems = [
        { name: 'Chef Boyardee', cooking: ['microwave', 'stovetop'] },
        { name: 'Sandwich', cooking: ['none'] },
        { name: 'Chicken Nuggets', cooking: ['air-fryer', 'oven', 'toaster-oven'] },
        { name: 'French Fries', cooking: ['air-fryer', 'oven', 'toaster-oven'] },
        { name: 'Pizza Rolls', cooking: ['microwave', 'air-fryer', 'oven', 'toaster-oven'] },
        { name: 'Noodles', cooking: ['stovetop', 'microwave'] },
        { name: 'Chicken Tenders', cooking: ['air-fryer', 'oven', 'toaster-oven'] },
        { name: 'Salad', cooking: ['none'] }
    ];

    // Add cooking methods mapping
    const cookingMethods = {
        'air-fryer': { value: 'air-fryer', label: 'Air Fryer', default: true },
        'oven': { value: 'oven', label: 'Oven' },
        'toaster-oven': { value: 'toaster-oven', label: 'Toaster Oven' },
        'stovetop': { value: 'stovetop', label: 'Stovetop' },
        'microwave': { value: 'microwave', label: 'Microwave' },
        'pressure-cooker': { value: 'pressure-cooker', label: 'Pressure Cooker' },
        'none': { value: 'none', label: 'No Cooking Needed', default: true }
    };

    // Initialize options for each lunch item
    lunchItems.forEach(item => {
        const itemContainer = document.querySelector(`#${item.name.toLowerCase().replace(/\s+/g, '-')}-options`);
        if (itemContainer) {
            populateLocationOptions(itemContainer);
            if (item.cooking.length > 0) {
                const methods = item.cooking.map(m => cookingMethods[m]);
                populateCookingOptions(itemContainer, methods);
            }
        }
    });

    // Expanded lunch items with more details
    const menuItems = [
        {
            name: 'Chef Boyardee',
            cooking: ['microwave', 'stovetop'],
            hasTemperature: true
        },
        {
            name: 'Sandwich',
            cooking: ['none'],
            hasCustomizations: true
        },
        {
            name: 'Chicken Nuggets',
            cooking: ['air-fryer', 'oven', 'toaster-oven'],
            hasSauces: true
        },
        {
            name: 'French Fries',
            cooking: ['air-fryer', 'oven', 'toaster-oven'],
            hasSeasonings: true
        },
        {
            name: 'Pizza Rolls',
            cooking: ['microwave', 'air-fryer', 'oven', 'toaster-oven'],
            hasQuantity: true
        },
        {
            name: 'Noodles',
            cooking: ['stovetop', 'microwave'],
            hasFlavors: true
        },
        {
            name: 'Chicken Tenders',
            cooking: ['air-fryer', 'oven', 'toaster-oven'],
            hasSauces: true
        },
        {
            name: 'Salad',
            cooking: ['none'],
            hasDressing: true
        }
    ];

    // Initialize options for each menu item
    menuItems.forEach(item => {
        const itemId = item.name.toLowerCase().replace(/\s+/g, '-');
        const container = document.querySelector(`#${itemId}-options`);
        
        if (container) {
            // Add location options first
            populateLocationOptions(container);
            
            // Add cooking options if applicable
            if (item.cooking.length > 0 && item.cooking[0] !== 'none') {
                const methods = item.cooking.map(m => cookingMethods[m]);
                populateCookingOptions(container, methods);
            }
        }
    });

    // Add breakfast items configuration
    const breakfastItems = [
        {
            name: 'Eggs',
            cooking: ['stovetop'],
            hasStyle: true,
            hasCheese: true,
            hasBread: true,
            hasMeat: true,
            hasSeasonings: true
        },
        {
            name: 'Waffles',
            cooking: ['toaster', 'toaster-oven'],
            hasButter: true,
            hasSyrup: true
        },
        {
            name: 'Pancakes',
            cooking: ['stovetop', 'toaster', 'toaster-oven'],
            hasButter: true,
            hasSyrup: true
        },
        // Add other breakfast items...
    ];

    // Initialize breakfast items
    breakfastItems.forEach(item => {
        const itemId = item.name.toLowerCase().replace(/\s+/g, '-');
        const container = document.querySelector(`#${itemId}-options`);
        
        if (container) {
            populateLocationOptions(container);
            if (item.cooking?.length > 0) {
                const methods = item.cooking.map(m => cookingMethods[m]);
                populateCookingOptions(container, methods);
            }
        }
    });

    // Add dinner items from MenuItems.json
    const dinnerItems = [
        {
            name: 'Pizza',
            cooking: ['oven', 'toaster-oven'],
            hasCustomizations: true,
            hasCheese: true,
            hasToppings: true
        },
        {
            name: 'Hamburger',
            cooking: ['stovetop', 'air-fryer'],
            hasCheese: true,
            hasToppings: true,
            hasCondiments: true
        },
        // Add other dinner items from MenuItems.json
        {
            name: 'Corn Dogs',
            cooking: ['oven', 'air-fryer'],
            hasCondiments: true,
            hasQuantity: true
        },
        {
            name: 'Meatballs',
            cooking: ['microwave', 'stovetop'],
            hasSauce: true
        },
        {
            name: 'Grilled Cheese',
            cooking: ['stovetop'],
            hasCheese: true
        }
    ];

    // Add snack items from MenuItems.json
    const snackItems = [
        {
            name: 'Chips',
            cooking: ['none'],
            hasSize: true
        },
        {
            name: 'Fruit',
            cooking: ['none'],
            hasType: true
        },
        // Add other snack items from MenuItems.json
        {
            name: 'Crackers',
            cooking: ['none'],
            hasType: true
        },
        {
            name: 'Yogurt',
            cooking: ['none'],
            hasFlavor: true
        },
        {
            name: 'Granola Bar',
            cooking: ['none'],
            hasType: true
        },
        {
            name: 'Nuts',
            cooking: ['none'],
            hasType: true
        },
        {
            name: 'Cheese Snack',
            cooking: ['none'],
            hasType: true
        }
    ];

    // Initialize all menu items with their specific options
    [...dinnerItems, ...snackItems].forEach(item => {
        const itemId = item.name.toLowerCase().replace(/\s+/g, '-');
        const container = document.querySelector(`#${itemId}-options`);
        
        if (container) {
            // Add common options first
            populateLocationOptions(container);

            // Add cooking options if applicable
            if (item.cooking?.length > 0 && item.cooking[0] !== 'none') {
                const methods = item.cooking.map(m => cookingMethods[m]);
                populateCookingOptions(container, methods);
            }

            // Add cheese options if item has cheese
            if (item.hasCheese) {
                const cheeseContainer = document.createElement('div');
                cheeseContainer.id = `${itemId}CheeseOptions`;
                container.appendChild(cheeseContainer);
            }

            // Add toppings if item has toppings
            if (item.hasToppings) {
                const toppingsGroup = document.createElement('div');
                toppingsGroup.className = 'option-group';
                toppingsGroup.innerHTML = `<h4>Toppings</h4>`;
                container.appendChild(toppingsGroup);
            }
        }
    });
}

// Add new helper functions
function populateMeatOptions(container, itemPrefix = '') {
    const meatOptions = [
        { value: 'None', label: 'None', default: true },
        { value: 'Pork Bacon', label: 'Pork Bacon' },
        { value: 'Beef Bacon', label: 'Beef Bacon' },
        { value: 'Turkey Bacon', label: 'Turkey Bacon' },
        { value: 'Pork Sausage', label: 'Pork Sausage' },
        { value: 'Beef Sausage', label: 'Beef Sausage' },
        { value: 'Turkey Sausage', label: 'Turkey Sausage' },
        { value: 'Turkey', label: 'Turkey' },
        { value: 'Ham', label: 'Ham' },
        { value: 'Salami', label: 'Salami' }
    ];

    const meatGroup = document.createElement('div');
    meatGroup.className = 'option-group meat-options';
    meatGroup.innerHTML = `
        <h4>Meat</h4>
        ${meatOptions.map(opt => `
            <div class="option-choice">
                <label>
                    <input type="radio" 
                           name="${itemPrefix}Meat" 
                           value="${opt.value}"
                           ${opt.default ? 'checked' : ''}>
                    ${opt.label}
                </label>
            </div>
        `).join('')}
    `;
    container.appendChild(meatGroup);
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

    populateCheeseOptions();
    initializeMenuOptions();

    // Add Chef Boyardee temperature handling
    const hotChefBoyardee = document.getElementById('hotChefBoyardee');
    const coldChefBoyardee = document.getElementById('coldChefBoyardee');
    const chefBoyardeeHotOptions = document.getElementById('chefBoyardeeHotOptions');

    if (hotChefBoyardee && coldChefBoyardee && chefBoyardeeHotOptions) {
        hotChefBoyardee.addEventListener('change', () => {
            chefBoyardeeHotOptions.style.display = 'block';
        });
        
        coldChefBoyardee.addEventListener('change', () => {
            chefBoyardeeHotOptions.style.display = 'none';
        });
    }
});
