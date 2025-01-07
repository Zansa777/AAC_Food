let cart = [];

// Comment out the current fetching logic:
// document.addEventListener('DOMContentLoaded', () => {
//     fetch('ConsolidatedMenu.json')
//         .then(response => response.json())
//         .then(data => {
//             populateMenu(data.categories);
//         })
//         .catch(error => console.error('Error fetching menu data:', error));
//     populateCheeseOptions();
// });

// Temporarily restore simpler or older approach below:
document.addEventListener('DOMContentLoaded', () => {
    // ...existing simpler code...
    // for example:
    // fetch('ConsolidatedMenu.json')
    //   .then(response => response.json())
    //   .then(data => console.log('Test run data:', data))
    //   .catch(error => console.error('Error:', error));

    // Initialize cheese options for all relevant items
    populateCheeseOptions();
    
    // Add event delegation for menu interactions
    document.querySelector('.menu-container').addEventListener('click', (e) => {
        const menuItem = e.target.closest('.menu-item');
        if (menuItem) {
            e.stopPropagation(); // Prevent menu collapse
        }
    });
});

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 17) return 'lunch';
    return 'dinner';
}

function populateMenu(categories) {
    const timeOfDay = getTimeOfDay();
    const mealContainer = document.querySelector('.menu-container');

    // Populate main dishes based on time of day
    categories.mainDishes
        .filter(dish => dish.mealTypes.includes(timeOfDay))
        .forEach(dish => {
            const menuItem = createMenuItem(dish);
            mealContainer.appendChild(menuItem);
        });

    // Populate breakfast-only items if breakfast time
    if (timeOfDay === 'breakfast') {
        categories.breakfastOnly.forEach(dish => {
            const menuItem = createMenuItem(dish);
            mealContainer.appendChild(menuItem);
        });
    }

    // Populate sides
    categories.sides.forEach(dish => {
        const menuItem = createMenuItem(dish);
        mealContainer.appendChild(menuItem);
    });

    // Populate snacks
    categories.snacks.forEach(dish => {
        const menuItem = createMenuItem(dish);
        mealContainer.appendChild(menuItem);
    });

    // Populate drinks
    populateDrinks(categories.drinks);
}

function populateDrinks(drinks) {
    const drinkContainer = document.querySelector('.drinks .options');
    const timeOfDay = getTimeOfDay();

    // Populate hot drinks if breakfast or lunch
    if (timeOfDay === 'breakfast' || timeOfDay === 'lunch') {
        drinks.hot.forEach(drink => {
            const menuItem = createMenuItem({ item: drink });
            drinkContainer.appendChild(menuItem);
        });
    }

    // Populate cold drinks
    drinks.cold.forEach(drink => {
        const menuItem = createMenuItem({ item: drink });
            drinkContainer.appendChild(menuItem);
    });

    // Populate either drinks
    drinks.either.forEach(drink => {
        const menuItem = createMenuItem({ item: drink });
        drinkContainer.appendChild(menuItem);
    });
}

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
    const itemId = item.item.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    div.className = `menu-item ${itemId}`;
    div.setAttribute('data-item-id', itemId);
    
    // Update click handler to use bound function with proper this context
    div.onclick = (e) => toggleOptions(e, itemId);
    
    div.innerHTML = `
        <h3>${item.item}</h3>
        <div id="${itemId}Options" class="options" style="display: none;">
            ${generateOptionsForItem(item)}
            <div class="cart-buttons">
                <button onclick="addToCart('${item.item}')" class="add-cart-button">Add to Cart</button>
            </div>
        </div>
    `;

    return div;
}

// Version 1: Direct DOM query approach
function addToCartV1(item) {
    try {
        const itemId = item.replace(/\s+/g, '');
        const options = document.getElementById(`${itemId}Options`);
        if (!options) throw new Error('Options container not found');

        const selectedOptions = {
            radios: {},
            checkboxes: [],
            notes: options.querySelector('textarea')?.value || ''
        };

        options.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            selectedOptions.radios[radio.name] = radio.value;
        });

        options.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            selectedOptions.checkboxes.push(`${cb.name}: ${cb.value}`);
        });

        cart.push({ item, options: selectedOptions });
        updateCartDisplay();
        alert('V1: Added to cart');
    } catch (error) {
        console.error('V1 Error:', error);
        alert('V1: Failed to add to cart');
    }
}

// Version 2: Event-based approach
function addToCartV2(item) {
    try {
        const itemId = item.replace(/\s+/g, '');
        const optionsContainer = document.getElementById(`${itemId}Options`);
        
        const cartItem = {
            item: item,
            options: {}
        };

        const formData = new FormData(optionsContainer.closest('form') || document.createElement('form'));
        for (let [key, value] of formData.entries()) {
            cartItem.options[key] = value;
        }

        cart.push(cartItem);
        updateCartDisplay();
        alert('V2: Added to cart');
    } catch (error) {
        console.error('V2 Error:', error);
        alert('V2: Failed to add to cart');
    }
}

// Version 3: Dataset approach
function addToCartV3(item) {
    try {
        const itemId = item.replace(/\s+/g, '');
        const container = document.getElementById(`${itemId}Options`);
        
        const cartItem = {
            item: item,
            options: {}
        };

        container.querySelectorAll('[data-option]').forEach(element => {
            if (element.type === 'radio' && element.checked) {
                cartItem.options[element.dataset.option] = element.value;
            }
            if (element.type === 'checkbox' && element.checked) {
                if (!cartItem.options[element.dataset.option]) {
                    cartItem.options[element.dataset.option] = [];
                }
                cartItem.options[element.dataset.option].push(element.value);
            }
            if (element.tagName === 'TEXTAREA') {
                cartItem.options.notes = element.value;
            }
        });

        cart.push(cartItem);
        updateCartDisplay();
        alert('V3: Added to cart');
    } catch (error) {
        console.error('V3 Error:', error);
        alert('V3: Failed to add to cart');
    }
}

// Version 4: Simple approach
function addToCartV4(item) {
    try {
        cart.push({
            item: item,
            timestamp: new Date().toISOString(),
            options: {}
        });
        updateCartDisplay();
        alert('V4: Added to cart (simple version)');
    } catch (error) {
        console.error('V4 Error:', error);
        alert('V4: Failed to add to cart');
    }
}

// Add styles for the cart buttons
const cartButtonStyles = document.createElement('style');
cartButtonStyles.textContent = `
    .cart-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-top: 15px;
    }
    
    .add-cart-button {
        padding: 8px;
        margin: 5px;
        border-radius: 4px;
        cursor: pointer;
    }
`;
document.head.appendChild(cartButtonStyles);

function collectItemOptions(itemName) {
    const optionsDiv = document.getElementById(`${itemName.replace(/\s+/g, '')}Options`);
    if (!optionsDiv) return {};

    const options = {};

    // Collect radio selections
    optionsDiv.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        options[radio.name] = radio.value;
    });

    // Collect checkbox selections
    optionsDiv.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        if (!options[checkbox.name]) {
            options[checkbox.name] = [];
        }
        options[checkbox.name].push(checkbox.value);
    });

    // Get notes
    const notes = optionsDiv.querySelector('textarea')?.value;
    if (notes) {
        options.notes = notes;
    }

    return options;
}

function generateOptionsForItem(item) {
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
        case 'Eggs':
            return `
                <div class="option-group">
                    <label>Style:</label>
                    <div class="option-choices">
                        <div class="option-choice">
                            <input type="radio" id="scrambledEggs" name="eggStyle" value="Scrambled">
                            <label for="scrambledEggs">Scrambled</label>
                        </div>
                        <div class="option-choice">
                            <input type="radio" id="overEasy" name="eggStyle" value="Over Easy">
                            <label for="overEasy">Over Easy</label>
                        </div>
                        <div class="option-choice">
                            <input type="radio" id="overMedium" name="eggStyle" value="Over Medium">
                            <label for="overMedium">Over Medium</label>
                        </div>
                    </div>
                </div>
                <div class="option-group">
                    <label>Cheese:</label>
                    <div id="eggCheeseOptions" class="cheese-options">
                        ${getStandardCheeseOptions('egg')}
                    </div>
                </div>
                <div class="option-group">
                    <label>Seasonings:</label>
                    <div class="seasoning-options">
                        <div class="seasoning-choice">
                            <input type="checkbox" id="saltEggs" name="eggSeasonings" value="Salt">
                            <label for="saltEggs">Salt</label>
                        </div>
                        <div class="seasoning-choice">
                            <input type="checkbox" id="pepperEggs" name="eggSeasonings" value="Pepper">
                            <label for="pepperEggs">Pepper</label>
                        </div>
                        <div class="seasoning-choice">
                            <input type="checkbox" id="ketchupEggs" name="eggSeasonings" value="Ketchup">
                            <label for="ketchupEggs">Ketchup</label>
                        </div>
                    </div>
                </div>
                <br>
                <label for="notesEggs">Notes:</label>
                <textarea id="notesEggs" rows="4" cols="50"></textarea>
            `;
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

function toggleOptions(e, itemId) {
    // Prevent the default event
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Get itemId from element if not provided
    if (!itemId && e && e.currentTarget) {
        itemId = e.currentTarget.getAttribute('data-item-id') ||
                e.currentTarget.className.split(' ')[1];
    }

    // Validate itemId
    if (!itemId) {
        console.warn('No item ID provided to toggleOptions');
        return;
    }

    try {
        // Ensure consistent ID format
        const safeItemId = itemId.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        let options = document.getElementById(`${safeItemId}Options`) || 
                     document.getElementById(`${safeItemId}-options`);
        
        if (!options) {
            console.error(`Element with id ${safeItemId}Options or ${safeItemId}-options not found`);
            return;
        }

        // Only close other options at the same level
        const parentContainer = options.closest('.menu-item').parentElement;
        parentContainer.querySelectorAll(':scope > .menu-item > .options').forEach(opt => {
            if (opt !== options) {
                opt.style.display = 'none';
                opt.closest('.menu-item')?.classList.remove('expanded');
            }
        });

        // Toggle display
        const currentDisplay = options.style.display;
        options.style.display = currentDisplay === 'none' || !currentDisplay ? 'block' : 'none';

        // Update menu item state
        const menuItem = options.closest('.menu-item');
        if (menuItem) {
            menuItem.classList.toggle('expanded', options.style.display === 'block');
        }
    } catch (error) {
        console.error('Error in toggleOptions:', error, {itemId});
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
        // Normalize the item ID
        const itemId = item.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        
        // Try both possible ID formats
        let optionsDiv = document.getElementById(`${itemId}Options`) || 
                        document.getElementById(`${itemId}-options`);
        
        if (!optionsDiv) {
            console.error(`Options div not found for ${item}. Tried IDs: ${itemId}Options and ${itemId}-options`);
            return;
        }

        // Create cart item with all selected options
        const cartItem = {
            item: item,
            options: {}
        };

        // Get all radio button selections
        optionsDiv.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            cartItem.options[radio.name] = radio.value;
        });

        // Get all checkbox selections
        optionsDiv.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            if (!cartItem.options[checkbox.name]) {
                cartItem.options[checkbox.name] = [];
            }
            cartItem.options[checkbox.name].push(checkbox.value);
        });

        // Get notes if any
        const notes = optionsDiv.querySelector('textarea')?.value;
        if (notes) {
            cartItem.options.notes = notes;
        }

        cart.push(cartItem);
        updateCartDisplay();
        alert(`Added ${item} to your cart!`);
    });
}

function updateCartDisplay() {
    const cartContents = document.getElementById('cartContents');
    cartContents.innerHTML = '';
    
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        
        // Format options text
        let optionsText = '';
        if (Object.keys(item.options).length > 0) {
            optionsText = Object.entries(item.options)
                .map(([key, value]) => {
                    // Skip the word "Choice" in option names
                    const cleanKey = key.replace(/Choice$/, '').replace(/([A-Z])/g, ' $1').trim();
                    
                    if (Array.isArray(value)) {
                        return `${value.join(', ')}`;
                    }
                    return value;
                })
                .filter(text => text && text !== 'undefined' && text !== 'None')  // Remove empty/none values
                .join(' | ');
        }

        li.innerHTML = `
            ${item.item}
            ${optionsText ? `<br><small>${optionsText}</small>` : ''}
            <button onclick="removeFromCart(${index})" class="remove-item">×</button>
        `;
        cartContents.appendChild(li);
    });
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    const message = cart.map(item => {
        if (!item.options) return item.item;
        const formattedOptions = Object.entries(item.options)
            .map(([key, value]) => Array.isArray(value)
                ? `${key}: ${value.join(', ')}`
                : `${key}: ${value}`)
            .join('\n\t');
        return `${item.item}\n\t${formattedOptions}`;
    }).join('\n\n');

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

function populateCheeseOptions() {
    const cheeseContainers = [
        { id: 'eggCheeseOptions', prefix: 'egg' },
        { id: 'sandwichCheeseOptions', prefix: 'sandwich' },
        { id: 'burgerCheeseOptions', prefix: 'burger' },
        { id: 'hotDogCheeseOptions', prefix: 'hotDog' }  // Add hot dog cheese
    ];

    cheeseContainers.forEach(container => {
        const element = document.getElementById(container.id);
        if (element) {
            element.innerHTML = getStandardCheeseOptions(container.prefix);
            console.log(`Populated cheese options for ${container.id}`); // Debug log
        } else {
            console.warn(`Container ${container.id} not found`); // Debug warning
        }
    });
}

// Add styles for option groups
const styles = document.createElement('style');
styles.textContent = `
    .option-group {
        margin: 15px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
    }
    .option-choices, .seasoning-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
        margin-top: 5px;
    }
    .option-choice, .seasoning-choice {
        display: flex;
        align-items: center;
        padding: 5px;
        background-color: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
    }
    .seasoning-choice {
        background-color: #fff3e0;
    }
    input[type="radio"] + label,
    input[type="checkbox"] + label {
        margin-left: 5px;
    }
`;
document.head.appendChild(styles);
