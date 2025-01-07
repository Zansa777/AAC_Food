let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('ConsolidatedMenu.json')
        .then(response => response.json())
        .then(data => {
            if (data.BreakfastMenu) populateBreakfastMenu(data.BreakfastMenu);
            if (data.SnacksMenu) populateSnacksMenu(data.SnacksMenu);
            if (data.LunchMenu) populateLunchMenu(data.LunchMenu);
            if (data.DinnerMenu) populateDinnerMenu(data.DinnerMenu);
        })
        .catch(error => console.error('Error fetching menu data:', error));
    populateCheeseOptions();
});

function groupMenuItems(items) {
    return items.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});
}

function populateCategories(menuByCategory) {
    if (menuByCategory.Breakfast) {
        populateBreakfastMenu(menuByCategory.Breakfast);
    }
    if (menuByCategory.Snacks) {
        populateSnacksMenu(menuByCategory.Snacks);
    }
    if (menuByCategory.Lunch) {
        populateLunchMenu(menuByCategory.Lunch);
    }
    if (menuByCategory.Dinner) {
        populateDinnerMenu(menuByCategory.Dinner);
    }
}

function populateBreakfastMenu(items) {
    const breakfastOptions = document.getElementById('breakfastOptions');
    items.forEach(item => {
        if (!['Eggs', 'Waffles', 'Pancakes'].includes(item.item)) { // Skip existing items
            const menuItem = createMenuItem(item);
            breakfastOptions.appendChild(menuItem);
        }
    });
}

function populateSnacksMenu(items) {
    const snacksOptions = document.getElementById('snacksOptions');
    items.forEach(item => {
        if (!['Back to Food Menu', 'Exit'].includes(item.item)) {
            const menuItem = createMenuItem(item);
            snacksOptions.appendChild(menuItem);
        }
    });
}

function populateLunchMenu(items) {
    const lunchOptions = document.getElementById('lunchOptions');
    items.forEach(item => {
        if (!['Back to Food Menu', 'Exit'].includes(item.item) && item.item !== 'Chef Boyardee') {
            const menuItem = createMenuItem(item);
            lunchOptions.appendChild(menuItem);
        }
    });
}

function createMenuItem(item) {
    const div = document.createElement('div');
    div.className = `menu-item ${item.item.toLowerCase().replace(/\s+/g, '-')}`;
    div.style.backgroundColor = item.color;
    
    const itemId = item.item.replace(/\s+/g, '');
    div.innerHTML = `
        <h3>${item.item}</h3>
        <div id="${itemId}Options" class="options" style="display: none;" onclick="event.stopPropagation()">
            ${generateOptionsForItem(item)}
            <button onclick="addToCart('${item.item}')">Add to Cart</button>
        </div>
    `;
    div.onclick = () => toggleOptions(`${itemId}Options`);
    return div;
}

function generateOptionsForItem(item) {
    // Add specific item handling
    switch(item.item) {
        case 'Pizza':
            return `
                <label>Type:</label>
                <div>
                    <input type="radio" id="squarePizza" name="pizzaType" value="Square Pizza">
                    <label for="squarePizza">Square Pizza</label>
                    <input type="radio" id="trianglePizza" name="pizzaType" value="Triangle Pizza">
                    <label for="trianglePizza">Triangle Pizza</label>
                    <input type="radio" id="chickenPizza" name="pizzaType" value="Chicken Pizza">
                    <label for="chickenPizza">Chicken Pizza</label>
                    <input type="radio" id="pepperoniPizza" name="pizzaType" value="Pepperoni Pizza">
                    <label for="pepperoniPizza">Pepperoni Pizza</label>
                </div>
                <br>
                <label>Where to eat:</label>
                <div>
                    <input type="radio" id="eatHome" name="pizzaLocation" value="Eat at Home">
                    <label for="eatHome">Eat Pizza at Home</label>
                    <input type="radio" id="getPizzaStore" name="pizzaLocation" value="Get from Store">
                    <label for="getPizzaStore">Go Get Pizza from Store</label>
                    <input type="radio" id="eatPizzaStore" name="pizzaLocation" value="Eat at Store">
                    <label for="eatPizzaStore">Eat Pizza at Store</label>
                </div>
                <br>
                ${getStandardTemperatureOptions('pizza')}
                <br>
                <label for="notesPizza">Notes:</label>
                <textarea id="notesPizza" rows="4" cols="50"></textarea>
            `;
        case 'Hamburger':
            return `
                ${getStandardQuantityOptions('hamburger')}
                ${getStandardCheeseOptions('hamburger')}
                <br>
                <label>Toppings:</label>
                <div>
                    <input type="checkbox" id="lettuceBurger" name="burgerToppings" value="Lettuce">
                    <label for="lettuceBurger">Lettuce</label>
                    <input type="checkbox" id="tomatoBurger" name="burgerToppings" value="Tomato">
                    <label for="tomatoBurger">Tomato</label>
                    <input type="checkbox" id="ketchupBurger" name="burgerToppings" value="Ketchup">
                    <label for="ketchupBurger">Ketchup</label>
                    <input type="checkbox" id="mustardBurger" name="burgerToppings" value="Mustard">
                    <label for="mustardBurger">Mustard</label>
                </div>
            `;
        // ... add more cases as needed ...
        
        default:
            // For simple items, just show quantity and notes
            return `
                ${getStandardQuantityOptions(item.item.toLowerCase().replace(/\s+/g, '-'))}
                <br>
                <label for="notes${item.item}">Notes:</label>
                <textarea id="notes${item.item}" rows="4" cols="50"></textarea>
            `;
    }
}

function getColorCode(color) {
    // Convert color names to hex codes if needed
    return color;
}

function generateBasicOptions(item) {
    return `
        <label>Quantity:</label>
        <div>
            <input type="radio" id="${item}1" name="${item}Count" value="1">
            <label for="${item}1">1</label>
            <input type="radio" id="${item}2" name="${item}Count" value="2">
            <label for="${item}2">2</label>
            <input type="radio" id="${item}3" name="${item}Count" value="3">
            <label for="${item}3">3</label>
        </div>
        <br>
        <label for="notes${item}">Notes:</label>
        <textarea id="notes${item}" rows="4" cols="50"></textarea>
    `;
}

function toggleOptions(id) {
    try {
        const options = document.getElementById(id);
        if (!options) {
            console.error(`Element with id ${id} not found`);
            return;
        }

        // Close all other menus at the same level
        const parentClass = options.closest('.menu-item').parentElement.className;
        document.querySelectorAll(`.${parentClass} .options`).forEach(el => {
            if (el.id !== id) {
                el.style.display = 'none';
            }
        });

        // Toggle the clicked menu
        options.style.display = options.style.display === 'none' ? 'block' : 'none';
    } catch (error) {
        console.error('Error toggling options:', error);
    }

    // Prevent event bubbling
    if (event) {
        event.stopPropagation();
    }
}

document.addEventListener('change', (event) => {
    if (event.target.name === 'temperatureChoice' && event.target.value === 'Hot') {
        document.getElementById('hotOptions').style.display = 'block';
    } else if (event.target.name === 'temperatureChoice' && event.target.value === 'Cold') {
        document.getElementById('hotOptions').style.display = 'none';
    }
});

function getStandardCheeseOptions(prefix = '') {
    return `
        <input type="radio" id="${prefix}NoCheeseChoice" name="${prefix}CheeseChoice" value="None">
        <label for="${prefix}NoCheeseChoice">None</label>
        <input type="radio" id="${prefix}American" name="${prefix}CheeseChoice" value="American">
        <label for="${prefix}American">American</label>
        <input type="radio" id="${prefix}Swiss" name="${prefix}CheeseChoice" value="Swiss">
        <label for="${prefix}Swiss">Swiss</label>
        <input type="radio" id="${prefix}Cheddar" name="${prefix}CheeseChoice" value="Cheddar">
        <label for="${prefix}Cheddar">Cheddar</label>
        <input type="radio" id="${prefix}PepperJack" name="${prefix}CheeseChoice" value="Pepper Jack">
        <label for="${prefix}PepperJack">Pepper Jack</label>
        <input type="radio" id="${prefix}MontereyJack" name="${prefix}CheeseChoice" value="Monterey Jack">
        <label for="${prefix}MontereyJack">Monterey Jack</label>
        <input type="radio" id="${prefix}Muenster" name="${prefix}CheeseChoice" value="Muenster">
        <label for="${prefix}Muenster">Muenster</label>
        <input type="radio" id="${prefix}Provolone" name="${prefix}CheeseChoice" value="Provolone">
        <label for="${prefix}Provolone">Provolone</label>
        <input type="radio" id="${prefix}Mozzarella" name="${prefix}CheeseChoice" value="Mozzarella">
        <label for="${prefix}Mozzarella">Mozzarella</label>
    `;
}

function getStandardQuantityOptions(prefix = '', max = 3) {
    let options = '';
    for (let i = 1; i <= max; i++) {
        options += `
            <input type="radio" id="${prefix}${i}" name="${prefix}Count" value="${i}">
            <label for="${prefix}${i}">${i} ${i === 1 ? 'Item' : 'Items'}</label>
        `;
    }
    return options;
}

function getStandardTemperatureOptions(prefix = '') {
    return `
        <label>Temperature:</label>
        <div class="temperature-options">
            <input type="radio" id="${prefix}Cold" name="${prefix}Temperature" value="Cold">
            <label for="${prefix}Cold">Cold</label>
            <input type="radio" id="${prefix}Hot" name="${prefix}Temperature" value="Hot">
            <label for="${prefix}Hot">Hot</label>
        </div>
        <div id="${prefix}HotOptions" class="hot-options" style="display: none;">
            <label>Heating Method:</label>
            <div>
                <input type="radio" id="${prefix}Microwave" name="${prefix}HeatingMethod" value="Microwave">
                <label for="${prefix}Microwave">Microwave</label>
                <input type="radio" id="${prefix}Stove" name="${prefix}HeatingMethod" value="Stove/Pot">
                <label for="${prefix}Stove">Stove/Pot</label>
            </div>
        </div>
    `;
}

function getStandardSeasoningOptions(prefix = '') {
    return `
        <label>Seasonings:</label>
        <div>
            <input type="checkbox" id="${prefix}Salt" name="${prefix}Seasonings" value="Salt">
            <label for="${prefix}Salt">Salt</label>
            <input type="checkbox" id="${prefix}Pepper" name="${prefix}Seasonings" value="Pepper">
            <label for="${prefix}Pepper">Black Pepper</label>
            <input type="checkbox" id="${prefix}GarlicPowder" name="${prefix}Seasonings" value="Garlic Powder">
            <label for="${prefix}GarlicPowder">Garlic Powder</label>
            <input type="checkbox" id="${prefix}HotSauce" name="${prefix}Seasonings" value="Hot Sauce">
            <label for="${prefix}HotSauce">Hot Sauce</label>
        </div>
    `;
}

// Update the event listener for temperature controls
document.addEventListener('change', (event) => {
    if (event.target.name && event.target.name.includes('Temperature')) {
        const prefix = event.target.name.replace('Temperature', '');
        const hotOptions = document.getElementById(`${prefix}HotOptions`);
        if (hotOptions) {
            hotOptions.style.display = event.target.value === 'Hot' ? 'block' : 'none';
        }
    }
});

/**
 * IMPORTANT: All menu items should follow the pattern established by Eggs and Chef Boyardee:
 * 1. Each item should have its own case in the generateOptions function
 * 2. Each item should have specific options relevant to that food
 * 3. Each item should use standardized option generators where appropriate:
 *    - getStandardQuantityOptions() for amounts
 *    - getStandardTemperatureOptions() for hot/cold items
 *    - getStandardCheeseOptions() for items with cheese
 *    - getStandardSeasoningOptions() for items needing seasonings
 * 4. Each item should have its own case in the addToCart function to handle its specific options
 */

function generateOptions(item) {
    switch(item) {
        case 'Chicken Nuggets':
            return `
                <label>How many nuggets?</label>
                <div>
                    <input type="radio" id="nuggets6" name="nuggetCount" value="6">
                    <label for="nuggets6">6 Nuggets</label>
                    <input type="radio" id="nuggets8" name="nuggetCount" value="8">
                    <label for="nuggets8">8 Nuggets</label>
                    <input type="radio" id="nuggets10" name="nuggetCount" value="10">
                    <label for="nuggets10">10 Nuggets</label>
                </div>
                <br>
                <label>Sauce:</label>
                <div>
                    <input type="checkbox" id="ketchupNuggets" name="nuggetSauces" value="Ketchup">
                    <label for="ketchupNuggets">Ketchup</label>
                    <input type="checkbox" id="bbqNuggets" name="nuggetSauces" value="BBQ">
                    <label for="bbqNuggets">BBQ</label>
                    <input type="checkbox" id="honeyMustardNuggets" name="nuggetSauces" value="Honey Mustard">
                    <label for="honeyMustardNuggets">Honey Mustard</label>
                    <input type="checkbox" id="ranchNuggets" name="nuggetSauces" value="Ranch">
                    <label for="ranchNuggets">Ranch</label>
                </div>
                <br>
                <label for="notesNuggets">Notes:</label>
                <textarea id="notesNuggets" rows="4" cols="50"></textarea>
            `;
        // ...existing cases...
        case 'French Fries':
            return `
                ${getStandardQuantityOptions('fries', 3)}
                <br>
                ${getStandardTemperatureOptions('fries')}
                <br>
                <label>Style:</label>
                <div>
                    <input type="radio" id="regularFries" name="friesStyle" value="Regular">
                    <label for="regularFries">Regular</label>
                    <input type="radio" id="crispyFries" name="friesStyle" value="Extra Crispy">
                    <label for="crispyFries">Extra Crispy</label>
                    <input type="radio" id="wafflesFries" name="friesStyle" value="Waffle Fries">
                    <label for="wafflesFries">Waffle Fries</label>
                </div>
                <br>
                ${getStandardSeasoningOptions('fries')}
                <br>
                <label>Condiments:</label>
                <div>
                    <input type="checkbox" id="ketchupF" name="friesCondiments" value="Ketchup">
                    <label for="ketchupF">Ketchup</label>
                    <input type="checkbox" id="mayoF" name="friesCondiments" value="Mayo">
                    <label for="mayoF">Mayo</label>
                </div>
                <br>
                <label for="notesFries">Notes:</label>
                <textarea id="notesFries" rows="4" cols="50"></textarea>
            `;
        // ...existing cases (Eggs, Chef Boyardee, etc.)...

        // Default case should never be used - all items should have specific options
        default:
            console.warn(`Warning: No specific options defined for ${item}. Please update generateOptions function.`);
            return getStandardQuantityOptions(item.toLowerCase().replace(/\s+/g, '-'));
    }
}

// Error handling wrapper for cart operations
function safeCartOperation(operation) {
    try {
        return operation();
    } catch (error) {
        console.error('Cart operation failed:', error);
        alert('There was an error with your cart. Please try again.');
        return false;
    }
}

function addToCart(item) {
    return safeCartOperation(() => {
        let cartItem = {
            item: item,
            options: {}
        };

        switch(item) {
            case 'Pizza':
                const type = document.querySelector('input[name="pizzaType"]:checked')?.value;
                const location = document.querySelector('input[name="pizzaLocation"]:checked')?.value;
                
                if (!type) throw new Error('Please select pizza type');
                if (!location) throw new Error('Please select where to eat');
                
                cartItem.options = { type, location };
                break;

            case 'Hamburger':
                const meat = document.querySelector('input[name="burgerMeat"]:checked')?.value;
                const bread = document.querySelector('input[name="burgerBread"]:checked')?.value;
                const toasted = document.querySelector('input[name="burgerToasted"]:checked')?.value;
                const cheese = document.querySelector('input[name="burgerCheeseChoice"]:checked')?.value;
                const burgerCondiments = Array.from(document.querySelectorAll('input[name="burgerCondiments"]:checked'))
                    .map(input => input.value);
                const burgerToppings = Array.from(document.querySelectorAll('input[name="burgerToppings"]:checked'))
                    .map(input => input.value);
                
                if (!meat) throw new Error('Please select meat type');
                if (!bread) throw new Error('Please select bread type');
                if (!toasted) throw new Error('Please select if toasted');
                
                cartItem.options = { meat, bread, toasted, cheese, condiments: burgerCondiments, toppings: burgerToppings };
                break;
            
            // ...existing cases...
            
            case 'Hot Dogs':
                const count = document.querySelector('input[name="hotDogCount"]:checked')?.value;
                const bun = document.querySelector('input[name="hotDogBun"]:checked')?.value;
                const condiments = Array.from(document.querySelectorAll('input[name="hotDogCondiments"]:checked'))
                    .map(input => input.value);
                const toppings = Array.from(document.querySelectorAll('input[name="hotDogToppings"]:checked'))
                    .map(input => input.value);
                const notes = document.getElementById('notesHotDogs')?.value;

                if (!count) throw new Error('Please select how many hot dogs');
                if (!bun) throw new Error('Please select bun type');

                cartItem.options = { count, bun, condiments, toppings };
                if (notes) cartItem.options.notes = notes;
                break;
            
            // ...rest of existing code...
        }

        cart.push(cartItem);
        updateCartDisplay();
        return true;
    });
}

function updateCartDisplay() {
    return safeCartOperation(() => {
        const cartContents = document.getElementById('cartContents');
        if (!cartContents) throw new Error('Cart display element not found');
        
        cartContents.innerHTML = '';
        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${item.item} ${formatOptions(item.options)}
                <button onclick="removeFromCart(${index})" class="remove-item">×</button>
            `;
            cartContents.appendChild(li);
        });
    });
}

function removeFromCart(index) {
    return safeCartOperation(() => {
        cart.splice(index, 1);
        updateCartDisplay();
    });
}

function formatOptions(options) {
    if (!options || Object.keys(options).length === 0) return '';
    return '(' + Object.entries(options)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ') + ')';
}

function checkout() {
    return safeCartOperation(() => {
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        const message = cart.map(item => 
            `${item.item} ${formatOptions(item.options)}`
        ).join('\n');

        return sendPushoverMessage(message);
    });
}

function sendPushoverMessage(message) {
    fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: 'aymazsihfeb4h8ningjej1zesbhjmo',
            user: 'u3qj1b7ynxpgu2zcazhn6bp9u9wa58',
            message: message
        })
    }).then(response => {
        if (response.ok) {
            alert('Order sent successfully');
        } else {
            alert('Failed to send order');
        }
    });
}

function populateCheeseOptions() {
    const cheeseContainers = [
        { id: 'eggCheeseOptions', prefix: 'egg' },
        { id: 'sandwichCheeseOptions', prefix: 'sandwich' },
        { id: 'burgerCheeseOptions', prefix: 'burger' }
    ];

    cheeseContainers.forEach(container => {
        const element = document.getElementById(container.id);
        if (element) {
            element.innerHTML = getStandardCheeseOptions(container.prefix);
        }
    });
}
