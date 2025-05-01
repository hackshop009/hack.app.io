document.addEventListener('DOMContentLoaded', function() {
  const loginContainer = document.getElementById('loginContainer');
  const mainContainer = document.getElementById('mainContainer');
  const loginForm = document.getElementById('loginForm');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');
  
  // Matrix background effect
  function createMatrix() {
    const matrixBg = document.querySelector('.matrix-bg');
    const chars = "01アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
    const fontSize = 14;
    const columns = Math.floor(window.innerWidth / fontSize);
    
    // Create columns
    for (let i = 0; i < columns; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.left = `${i * fontSize}px`;
      column.style.animationDelay = `${Math.random() * 5}s`;
      matrixBg.appendChild(column);
      
      // Create characters in column
      const rows = Math.floor(window.innerHeight / fontSize);
      for (let j = 0; j < rows; j++) {
        const char = document.createElement('span');
        char.textContent = chars[Math.floor(Math.random() * chars.length)];
        char.style.opacity = Math.random() * 0.5;
        char.style.animationDelay = `${Math.random() * 5}s`;
        column.appendChild(char);
      }
    }
  }
  
  createMatrix();
  
  // Login form submission
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const password = passwordInput.value.trim();
    
    if (password === 'thoha334') {
      // Correct password
      errorMessage.textContent = '';
      passwordInput.style.borderColor = '#0f0';
      
      // Add success effect
      loginContainer.style.animation = 'fadeOut 0.8s forwards';
      
      setTimeout(() => {
        loginContainer.style.display = 'none';
        mainContainer.style.display = 'block';
        
        // Add typing effect to file items
        const fileItems = document.querySelectorAll('.file-item span');
        fileItems.forEach((item, index) => {
          setTimeout(() => {
            item.style.animation = 'none';
            item.offsetHeight; // Trigger reflow
            item.style.animation = 'typing 3s steps(40, end)';
          }, index * 300);
        });
      }, 800);
    } else {
      // Wrong password
      errorMessage.textContent = 'ত্রুটিপূর্ণ এক্সেস কোড! সিস্টেম লক করা হলো...';
      passwordInput.style.borderColor = '#f00';
      
      // Add shake effect
      loginForm.style.animation = 'none';
      loginForm.offsetHeight; // Trigger reflow
      loginForm.style.animation = 'shake 0.5s';
      
      // Lock system for 3 seconds
      loginForm.querySelector('button').disabled = true;
      setTimeout(() => {
        errorMessage.textContent = '';
        loginForm.querySelector('button').disabled = false;
      }, 3000);
    }
  });
  
  // Add random terminal flicker effect
  setInterval(() => {
    const terminalTexts = document.querySelectorAll('.terminal-text');
    terminalTexts.forEach(text => {
      if (Math.random() > 0.9) {
        text.style.opacity = Math.random() * 0.5 + 0.5;
      } else {
        text.style.opacity = 1;
      }
    });
  }, 300);
});
