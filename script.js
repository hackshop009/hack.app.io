// Valid passwords
const validPasswords = ["toha12786", "pass1", "pass2"];

// DOM elements
const landingPage = document.getElementById('landing-page');
const premiumContent = document.getElementById('premium-content');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const errorMsg = document.getElementById('error-msg');

// Login function
loginBtn.addEventListener('click', function() {
  const enteredPassword = passwordInput.value.trim();
  
  if (validPasswords.includes(enteredPassword)) {
    // Correct password
    landingPage.style.display = 'none';
    premiumContent.style.display = 'block';
    errorMsg.style.display = 'none';
    passwordInput.value = '';
  } else {
    // Wrong password
    errorMsg.style.display = 'block';
    passwordInput.value = '';
  }
});

// Allow login on Enter key press
passwordInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    loginBtn.click();
  }
});

// Logout function
logoutBtn.addEventListener('click', function() {
  landingPage.style.display = 'block';
  premiumContent.style.display = 'none';
});
