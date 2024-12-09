// Function to remove an item from the cart
function removeFromCart(productId) {
    console.log('Removing product ID:', productId);
    fetch(`/cart/${productId}`, { method: 'DELETE' })
        .then((response) => {
            if (!response.ok) throw new Error('Failed to remove item from cart');
            return response.json();
        })
        .then((data) => {
            console.log('Item removed:', data);
            updateCartUI();
        })
        .catch((error) => {
            console.error('Error removing item:', error);
            alert('Error removing item from cart.');
        });
}

// Function to update the cart UI
function updateCartUI() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;

    fetch('/cart')
        .then((response) => response.json())
        .then((cart) => {
            cartContainer.innerHTML = cart.length
                ? cart.map((item) => `
                    <div class="product-card">
                        <img src="${item.url}" alt="${item.name}" />
                        <p>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</p>
                        <button class="btn remove-btn" data-id="${item.id}">Remove</button>
                    </div>
                `).join('')
                : '<p>Your cart is empty</p>';

            // Attach event listeners to remove buttons
            document.querySelectorAll('.remove-btn').forEach((button) => {
                button.addEventListener('click', () => removeFromCart(button.dataset.id));
            });
        })
        .catch((error) => {
            console.error('Error fetching cart:', error);
            cartContainer.innerHTML = 'Error loading cart';
        });
}

// Function to place an order
function placeOrder(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

    if (!name || !email || !phone || !address || !paymentMethod) {
        alert('Please fill in all fields and select a payment method.');
        return;
    }

    const orderData = {
        name,
        email,
        phone,
        address,
        paymentMethod,
    };

    fetch('/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
    })
        .then((response) => {
            if (!response.ok) throw new Error('Failed to place order');
            return response.json();
        })
        .then((data) => {
            console.log('Order placed successfully:', data);
            alert('Order placed successfully!');
            document.getElementById('orderForm').reset();
            updateCartUI(); // Clear cart UI
        })
        .catch((error) => {
            console.error('Error placing order:', error);
            alert('Error placing order. Please try again.');
        });
}

// Initialize the cart UI on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    // Attach placeOrder function to the form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', placeOrder);
    }
});
