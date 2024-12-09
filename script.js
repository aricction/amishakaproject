// Countdown Function
let countDate = new Date('June 1, 2025 00:00:00').getTime();

function CountDown() {
  let now = new Date().getTime();
  let gap = countDate - now;

  let second = 1000;
  let minute = second * 60;
  let hour = minute * 60;
  let day = hour * 24;

  let d = Math.floor(gap / day);
  let h = Math.floor((gap % day) / hour);
  let m = Math.floor((gap % hour) / minute);
  let s = Math.floor((gap % minute) / second);

  document.getElementById('day').innerText = d;
  document.getElementById('hour').innerText = h;
  document.getElementById('minute').innerText = m;
  document.getElementById('second').innerText = s;
}

setInterval(CountDown, 1000);

// Add products to cart
function addtoCart() {
  const addToCartBtns = document.querySelectorAll('.addTocartBtn');

  addToCartBtns.forEach((button) => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(e.target.dataset.id);
      console.log('Product id:', productId);

      // Send a POST request to add the item to the cart
      fetch('/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
        .then((response) => {
          if (!response.ok) throw new Error('Failed to add item to cart');
          return response.json();
        })
        .then((data) => {
          alert('Added to cart: ' + JSON.stringify(data));
          console.log('Added to cart:', data);
          window.updateCartUI(); // Refresh the cart UI
        })
        .catch((error) => console.error('Error adding to cart:', error));
    });
  });
}

// Register Function
function register() {
  const registerForm = document.getElementById('registerForm'); // Ensure your form has this ID
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('username').value;
    const email = document.getElementById('Register-email').value;
    const password = document.getElementById('Register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    // Validate input fields
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all the fields');
      return;
    }

    // Send the registration data to the server
    const registerData = { name, email, password , confirmPassword};

    fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          alert('Registration successful');
          // Optionally clear form fields
          registerForm.reset();
        }
      })
      .catch((error) => {
        console.error('Error registering user:', error);
        alert('Error registering user');
      });
  });
}

// Function to handle login
async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  // Check if fields are empty
  if (!email || !password) {
    alert('Please fill out both fields');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Login successful');

      document.getElementById('loginModal').style.display = 'none';

      const userName = data.name;
      const userIcon = document.getElementsByClassName('fas fa-user-circle');
      const userNameElement = document.getElementById('user-name');

      userIcon.style.display = 'none'; // Hide user icon
      userNameElement.style.display = 'block'; // Show the username
      userNameElement.innerText = userName; // Set the username text
      // Perform actions after successful login, like redirecting or displaying user-specific content
      console.log('User:', data);
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}


// Modal handling
function initializeModals() {
  const registerModal = document.getElementById('registerModal');
  const loginModal = document.getElementById('loginModal');
  const closeRegister = document.getElementById('closeRegister');
  const closeLogin = document.getElementById('close');

  if (registerModal && closeRegister) {
    closeRegister.onclick = function () {
      registerModal.style.display = 'none';
    };
  }

  if (loginModal && closeLogin) {
    closeLogin.onclick = function () {
      loginModal.style.display = 'none';
    };
  }

  window.onclick = function (event) {
    if (event.target === registerModal) {
      registerModal.style.display = 'none';
    } else if (event.target === loginModal) {
      loginModal.style.display = 'none';
    }
  };
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  addtoCart();
  initializeModals();
  register();
 
});
