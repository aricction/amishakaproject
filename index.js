const express = require('express');
const app = express();
const connection = require('./dbcon'); // Database connection

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Register Endpoint
app.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check if required fields are provided
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Name, email, password, and confirm password are required' });
  }

  // Check if password and confirm password match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Password and confirm password do not match' });
  }

  // Insert the user data into the users table
  const query = `
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `;
  connection.query(query, [name, email, password], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to register user' });
    }

    // Respond with success message
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  });
});


// Login Endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if required fields are provided
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Query to find the user by email and password
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to login' });
    }

    // Check if the user was found
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Respond with a success message
    const user = results[0];
    res.status(200).json({ message: 'Login successful', userId: user.id, userName: user.name });
  });
});

// Fetch cart items
app.get('/cart', (req, res) => {
  // Retrieve items in the cart, joining the cart with the products table
  connection.query('SELECT c.id, p.name, p.price, c.quantity FROM cart c JOIN products p ON c.product_id = p.id', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch cart items' });
    }

    if (results.length === 0) {
      return res.status(200).json({ message: 'Your cart is empty' });
    }

    res.json(results);
  });
});

// Add product to cart
app.post('/cart', (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res.status(400).json({ error: 'ProductId and Quantity are required' });
  }

  // Check if the product already exists in the cart (by product_id)
  connection.query('SELECT * FROM cart WHERE product_id = ?', [productId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      // If the product is already in the cart, update its quantity
      const newQuantity = results[0].quantity + quantity;
      connection.query('UPDATE cart SET quantity = ? WHERE product_id = ?', [newQuantity, productId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update cart' });
        }
        res.status(200).json({ message: 'Product quantity updated in cart' });
      });
    } else {
      // If the product is not in the cart, insert it into the cart
      const query = 'INSERT INTO cart (product_id, quantity) VALUES (?, ?)';
      connection.query(query, [productId, quantity], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to add product to cart' });
        }

        res.status(201).json({ message: 'Product added to cart', id: result.insertId });
      });
    }
  });
});

// Place an order (POST /place-order)
app.post('/place-order', (req, res) => {
  const { name, email, phone, address, paymentMethod, cartItems } = req.body;

  if (!name || !email || !phone || !address || !paymentMethod || !cartItems) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Insert order details into the orders table
  const orderQuery = 'INSERT INTO orders (name, email, phone, address, payment_method) VALUES (?, ?, ?, ?, ?)';
  connection.query(orderQuery, [name, email, phone, address, paymentMethod], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to place order' });
    }

    const orderId = result.insertId;

    // Insert each cart item into the order_items table
    const orderItemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)';
    cartItems.forEach(item => {
      connection.query(orderItemsQuery, [orderId, item.productId, item.quantity], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to add order items' });
        }
      });
    });

    // Optionally, clear the cart after placing the order
    connection.query('DELETE FROM cart WHERE product_id IN (?)', [cartItems.map(item => item.productId)], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to clear cart' });
      }
    });

    res.status(200).json({ message: 'Order placed successfully', orderId });
  });
});


// Delete product from cart
app.delete('/cart/:productId', (req, res) => {
  const { productId } = req.params;
  console.log('Product ID to delete:', productId);
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  // Delete the product from the cart
  const deleteQuery = 'DELETE FROM cart WHERE product_id = ?';
  console.log('Executing query:', deleteQuery, 'with productId:', productId); 
  connection.query(deleteQuery, [productId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete product from cart' });
    }

    if (result.affectedRows === 0) {
      // No rows were affected, meaning the product was not found in the cart
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    res.status(200).json({ message: 'Product removed from cart successfully' });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
