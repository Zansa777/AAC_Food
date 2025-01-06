let cart = [];

// Comment out the JSON fetching part
// document.addEventListener('DOMContentLoaded', () => {
//     fetch('ConsolidatedMenu.json')
//         .then(response => response.json())
//         .then(data => {
//             const menuContainer = document.getElementById('menuContainer');
//             const allMenus = [
//                 ...data.BreakfastMenu,
//                 ...data.SnacksMenu,
//                 ...data.LunchMenu,
//                 ...data.DinnerMenu,
//                 ...data.DrinksMenu
//             ];
//             allMenus.forEach(item => {
//                 const menuItem = document.createElement('div');
//                 menuItem.className = 'menu-item';
//                 menuItem.innerHTML = `
//                     <h2>${item.item || item.name}</h2>
//                     <div id="${(item.item || item.name).replace(/\s+/g, '')}Options" class="options" style="display: none;">
//                         ${generateOptions(item.item || item.name)}
//                         <button onclick="addToCart('${item.item || item.name}')">Add to Cart</button>
//                     </div>
//                 `;
//                 menuItem.onclick = () => toggleOptions(`${(item.item || item.name).replace(/\s+/g, '')}Options`);
//                 menuContainer.appendChild(menuItem);
//             });
//         })
//         .catch(error => console.error('Error fetching menu data:', error));
// });

function toggleOptions(id) {
    const options = document.getElementById(id);
    if (options.style.display === 'none') {
        options.style.display = 'block';
    } else {
        options.style.display = 'none';
    }
}

document.addEventListener('change', (event) => {
    if (event.target.name === 'temperatureChoice' && event.target.value === 'Hot') {
        document.getElementById('hotOptions').style.display = 'block';
    } else if (event.target.name === 'temperatureChoice' && event.target.value === 'Cold') {
        document.getElementById('hotOptions').style.display = 'none';
    }
});

function generateOptions(item) {
    if (item === 'Eggs') {
        return `
            <label for="eggChoice">Style:</label>
            <input type="radio" name="eggChoice" value="Scrambled"> Scrambled
            <input type="radio" name="eggChoice" value="Over Easy"> Over Easy (fried)
            <input type="radio" name="eggChoice" value="Over Medium"> Over Medium (fried)
            <input type="radio" name="eggChoice" value="Over Hard"> Over Hard (fried)
            <input type="radio" name="eggChoice" value="Omelet"> Omelet
            <input type="radio" name="eggChoice" value="Soft Boiled"> Soft Boiled
            <input type="radio" name="eggChoice" value="Hard Boiled"> Hard Boiled
            <br>
            <label for="cheeseChoice">Cheese:</label>
            <input type="radio" name="cheeseChoice" value="None"> None
            <input type="radio" name="cheeseChoice" value="Cheddar"> Cheddar
            <input type="radio" name="cheeseChoice" value="Swiss"> Swiss
            <input type="radio" name="cheeseChoice" value="American"> American
            <input type="radio" name="cheeseChoice" value="Mozzarella"> Mozzarella
            <br>
            <label for="breadChoice">Bread:</label>
            <input type="radio" name="breadChoice" value="None"> None
            <input type="radio" name="breadChoice" value="Square"> Square/Sandwich Bread
            <input type="radio" name="breadChoice" value="Bagel"> Bagel
            <input type="radio" name="breadChoice" value="Roll"> Roll
            <input type="radio" name="breadChoice" value="Hero"> Hero
            <br>
            <label for="meatChoice">Meat:</label>
            <input type="radio" name="meatChoice" value="None"> None
            <input type="radio" name="meatChoice" value="Bacon"> Bacon
            <input type="radio" name="meatChoice" value="Sausage"> Sausage
            <input type="radio" name="meatChoice" value="Ham"> Ham
            <br>
            <div class="seasoning-item">
                <label>Seasonings:</label>
                <div id="seasoningOptions" class="options">
                    <input type="checkbox" id="salt" value="Salt">
                    <label for="salt">Salt</label>
                    <input type="checkbox" id="blackPepper" value="Black Pepper">
                    <label for="blackPepper">Black Pepper</label>
                    <input type="checkbox" id="hotPepper" value="Hot Pepper">
                    <label for="hotPepper">Hot Pepper</label>
                    <input type="checkbox" id="adobo" value="Adobo">
                    <label for="adobo">Adobo</label>
                </div>
            </div>
            <br>
            <label for="butterChoice">Butter on Bread:</label>
            <input type="radio" name="butterChoice" value="No"> No
            <input type="radio" name="butterChoice" value="Yes"> Yes
            <br>
            <label for="notes">Notes:</label>
            <textarea id="notes" rows="4" cols="50"></textarea>
            <br>
        `;
    } else if (item === 'Juice') {
        return `
            <label for="juiceChoice">Type:</label>
            <input type="radio" name="juiceChoice" value="Apple Juice"> Apple Juice
            <input type="radio" name="juiceChoice" value="Orange Juice"> Orange Juice
            <input type="radio" name="juiceChoice" value="Grape Juice"> Grape Juice
            <input type="radio" name="juiceChoice" value="White Grape Juice"> White Grape Juice
            <input type="radio" name="juiceChoice" value="Kool-Aid (Red Juice)"> Kool-Aid (Red Juice)
            <input type="radio" name="juiceChoice" value="Lemonade"> Lemonade
            <br>
            <label for="notesJuice">Notes:</label>
            <textarea id="notesJuice" rows="4" cols="50"></textarea>
            <br>
        `;
    } else if (item === 'Soda') {
        return `
            <label for="sodaChoice">Type:</label>
            <input type="radio" name="sodaChoice" value="Sprite"> Sprite
            <input type="radio" name="sodaChoice" value="7UP"> 7UP
            <input type="radio" name="sodaChoice" value="Coca-Cola"> Coca-Cola
            <input type="radio" name="sodaChoice" value="Pepsi"> Pepsi
            <input type="radio" name="sodaChoice" value="Grape soda"> Grape soda
            <input type="radio" name="sodaChoice" value="Orange soda"> Orange soda
            <input type="radio" name="sodaChoice" value="Pineapple Soda"> Pineapple Soda
            <input type="radio" name="sodaChoice" value="Ginger-Ale"> Ginger-Ale
            <br>
            <label for="notesSoda">Notes:</label>
            <textarea id="notesSoda" rows="4" cols="50"></textarea>
            <br>
        `;
    } else if (item === 'Drinks') {
        return `
            <label for="drinksChoice">Type:</label>
            <input type="radio" name="drinksChoice" value="Milk"> Milk
            <input type="radio" name="drinksChoice" value="Strawberry Milk"> Strawberry Milk
            <input type="radio" name="drinksChoice" value="Chocolate Milk"> Chocolate Milk
            <input type="radio" name="drinksChoice" value="Chocolate with Marshmallow"> Chocolate with Marshmallow
            <input type="radio" name="drinksChoice" value="Hot Chocolate"> Hot Chocolate
            <input type="radio" name="drinksChoice" value="Hot Chocolate with Marshmallow"> Hot Chocolate with Marshmallow
            <br>
            <label for="teaChoice">Tea:</label>
            <input type="radio" name="teaChoice" value="Hot"> Hot
            <input type="radio" name="teaChoice" value="Cold"> Cold
            <br>
            <label for="notesDrinks">Notes:</label>
            <textarea id="notesDrinks" rows="4" cols="50"></textarea>
            <br>
        `;
    } else if (item === 'Chef Boyardee') {
        return `
            <label for="chefBoyardeeChoice">Type:</label>
            <input type="radio" name="chefBoyardeeChoice" value="Beef Ravioli"> Beef Ravioli
            <input type="radio" name="chefBoyardeeChoice" value="Spaghetti & Meatballs"> Spaghetti & Meatballs
            <input type="radio" name="chefBoyardeeChoice" value="Lasagna"> Lasagna
            <br>
            <label for="temperatureChoice">Temperature:</label>
            <input type="radio" name="temperatureChoice" value="Hot"> Hot
            <input type="radio" name="temperatureChoice" value="Cold"> Cold
            <br>
            <div id="hotOptions" style="display: none;">
                <label for="heatingMethod">Heating Method:</label>
                <input type="radio" name="heatingMethod" value="Microwave"> Microwave
                <input type="radio" name="heatingMethod" value="Stovetop"> Stovetop
                <br>
            </div>
            <label for="notesChefBoyardee">Notes:</label>
            <textarea id="notesChefBoyardee" rows="4" cols="50"></textarea>
            <br>
        `;
    }
    // Add more item-specific options here if needed
    return '';
}

function addToCart(item) {
    if (item === 'Eggs') {
        const eggChoice = document.querySelector('input[name="eggChoice"]:checked').value;
        const cheeseChoice = document.querySelector('input[name="cheeseChoice"]:checked').value;
        const breadChoice = document.querySelector('input[name="breadChoice"]:checked').value;
        const meatChoice = document.querySelector('input[name="meatChoice"]:checked').value;
        const seasoningChoices = Array.from(document.querySelectorAll('#seasoningOptions input:checked')).map(input => input.value);
        const butterChoice = document.querySelector('input[name="butterChoice"]:checked').value;
        const notes = document.getElementById('notes').value;
        cart.push(`${item} (${eggChoice}, Cheese: ${cheeseChoice}, Bread: ${breadChoice}, Meat: ${meatChoice}, Seasonings: ${seasoningChoices.join(', ')}, Butter: ${butterChoice}, Notes: ${notes})`);
    } else if (item === 'Juice') {
        const juiceChoice = document.querySelector('input[name="juiceChoice"]:checked').value;
        const notesJuice = document.getElementById('notesJuice').value;
        cart.push(`${item} (${juiceChoice}, Notes: ${notesJuice})`);
    } else if (item === 'Soda') {
        const sodaChoice = document.querySelector('input[name="sodaChoice"]:checked').value;
        const notesSoda = document.getElementById('notesSoda').value;
        cart.push(`${item} (${sodaChoice}, Notes: ${notesSoda})`);
    } else if (item === 'Drinks') {
        const drinksChoice = document.querySelector('input[name="drinksChoice"]:checked').value;
        const notesDrinks = document.getElementById('notesDrinks').value;
        cart.push(`${item} (${drinksChoice}, Notes: ${notesDrinks})`);
    } else if (item === 'Chef Boyardee') {
        const chefBoyardeeChoice = document.querySelector('input[name="chefBoyardeeChoice"]:checked').value;
        const temperatureChoice = document.querySelector('input[name="temperatureChoice"]:checked').value;
        let heatingMethod = '';
        if (temperatureChoice === 'Hot') {
            heatingMethod = document.querySelector('input[name="heatingMethod"]:checked').value;
        }
        const notesChefBoyardee = document.getElementById('notesChefBoyardee').value;
        cart.push(`${item} (${chefBoyardeeChoice}, Temperature: ${temperatureChoice}, Heating Method: ${heatingMethod}, Notes: ${notesChefBoyardee})`);
    } else {
        cart.push(item);
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
