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

function populateDinnerMenu(items) {
    const dinnerOptions = document.getElementById('dinnerOptions');
    items.forEach(item => {
        if (!['Back to Food Menu', 'Exit'].includes(item.item)) {
            const menuItem = createMenuItem(item);
            dinnerOptions.appendChild(menuItem);
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
    // Keep existing special handling for certain items
    if (['Eggs', 'Waffles', 'Pancakes'].includes(item.item)) {
        return generateOptions(item.item);
    }
    
    // Default options for other items
    return `
        <label>Quantity:</label>
        <div>
            <input type="radio" id="${item.item}1" name="${item.item}Count" value="1">
            <label for="${item.item}1">1</label>
            <input type="radio" id="${item.item}2" name="${item.item}Count" value="2">
            <label for="${item.item}2">2</label>
            <input type="radio" id="${item.item}3" name="${item.item}Count" value="3">
            <label for="${item.item}3">3</label>
        </div>
        <br>
        <label for="notes${item.item}">Notes:</label>
        <textarea id="notes${item.item}" rows="4" cols="50"></textarea>
    `;
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
    const options = document.getElementById(id);
    const allOptions = document.querySelectorAll('.options');
    
    // If clicking on parent menu, close all child menus
    if (id === 'breakfastOptions') {
        document.getElementById('eggOptions').style.display = 'none';
    }
    
    if (options.style.display === 'none') {
        options.style.display = 'block';
    } else {
        options.style.display = 'none';
    }
    
    // Prevent event bubbling
    event.stopPropagation();
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
        <div>
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
                <label>Style:</label>
                <div>
                    <input type="radio" id="regularNuggets" name="nuggetStyle" value="Regular">
                    <label for="regularNuggets">Regular</label>
                    <input type="radio" id="spicyNuggets" name="nuggetStyle" value="Spicy">
                    <label for="spicyNuggets">Spicy</label>
                </div>
                <br>
                ${getStandardTemperatureOptions('nuggets')}
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
                ${getStandardSeasoningOptions('nuggets')}
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

function addToCart(item) {
    if (item === 'Chicken Nuggets') {
        const count = document.querySelector('input[name="nuggetCount"]:checked')?.value || '6';
        const temp = document.querySelector('input[name="nuggetsTemperature"]:checked')?.value || 'Hot';
        const heatingMethod = temp === 'Hot' ? 
            document.querySelector('input[name="nuggetsHeatingMethod"]:checked')?.value || 'Microwave' : '';
        const sauces = Array.from(document.querySelectorAll('input[name="nuggetSauces"]:checked'))
            .map(input => input.value);
        const notes = document.getElementById('notesNuggets')?.value || '';

        cart.push(`Chicken Nuggets (${count} nuggets, Temperature: ${temp}` +
            `${heatingMethod ? ', Heating: ' + heatingMethod : ''}` +
            `${sauces.length > 0 ? ', Sauces: ' + sauces.join(', ') : ''}` +
            `${notes ? ', Notes: ' + notes : ''})`);
    } else {
        // ...existing cart handling for other items...
    }
    alert(item + ' added to cart');
    updateCartContents();
}

function updateCartContents() {
    const cartContents = document.getElementById('cartContents');
    cartContents.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        cartContents.appendChild(li);
    });
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    const message = 'Order placed: ' + cart.join(', ');
    sendPushoverMessage(message);
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
