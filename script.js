// ইন্ট্রো এনিমেশন শেষে মেইন কন্টেন্ট শো করা
setTimeout(() => {
    document.querySelector('.intro-animation').style.display = 'none';
    document.querySelector('.main-content').style.display = 'block';
    document.body.style.background = 'var(--gradient-bg)';
}, 4000);

// সাব সেকশন ওপেন করা
function openSubSection(sectionId) {
    document.getElementById('main-services').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
    window.scrollTo(0, 0);
}

// মেইন সেকশনে ফিরে যাওয়া
function backToMain() {
    const subsections = document.querySelectorAll('.subsection');
    subsections.forEach(sub => {
        sub.style.display = 'none';
    });
    
    document.getElementById('main-services').style.display = 'grid';
    
    // সব অর্ডার ফর্ম হাইড করা
    const orderForms = document.querySelectorAll('.order-form');
    orderForms.forEach(form => {
        form.classList.remove('active');
    });
}

// অর্ডার ফর্ম শো করা
function showOrderForm(serviceName, price, section, operator) {
    const formId = `${section}-form`;
    const form = document.getElementById(formId);
    
    // সব অর্ডার ফর্ম হাইড করা
    const orderForms = document.querySelectorAll('.order-form');
    orderForms.forEach(form => {
        form.classList.remove('active');
    });
    
    // সার্ভিস ডিটেইলস সেট করা
    document.getElementById(`${section}-service`).value = serviceName;
    document.getElementById(`${section}-price`).value = price;
    document.getElementById(`${section}-operator`).value = operator;
    
    // নির্বাচিত ফর্ম শো করা
    form.classList.add('active');
    form.scrollIntoView({ behavior: 'smooth' });
}

// ফর্ম ভ্যালিডেশন
function validateForm(section) {
    let isValid = true;
    const email = document.getElementById(`${section}-email`).value;
    const target = document.getElementById(`${section}-number`).value;
    const transactionId = document.getElementById(`${section}-bkash`).value;
    
    // ইমেইল ভ্যালিডেশন
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById(`${section}-email-error`).style.display = 'block';
        isValid = false;
    } else {
        document.getElementById(`${section}-email-error`).style.display = 'none';
    }
    
    // টার্গেট ভ্যালিডেশন
    if (!target) {
        document.getElementById(`${section}-number-error`).style.display = 'block';
        isValid = false;
    } else {
        document.getElementById(`${section}-number-error`).style.display = 'none';
    }
    
    // ট্রানজেকশন আইডি ভ্যালিডেশন
    if (!transactionId) {
        document.getElementById(`${section}-bkash-error`).style.display = 'block';
        isValid = false;
    } else {
        document.getElementById(`${section}-bkash-error`).style.display = 'none';
    }
    
    if (isValid) {
        submitOrder(section);
    } else {
        showError('দয়া করে ফর্মটি সঠিকভাবে পূরণ করুন');
    }
}

// এরর মেসেজ শো করা
function showError(message) {
    const modal = document.getElementById('confirmation-modal');
    const icon = document.getElementById('confirmation-icon');
    const title = document.getElementById('confirmation-title');
    const msg = document.getElementById('confirmation-message');
    
    icon.innerHTML = '❌';
    icon.className = 'confirmation-icon error-icon';
    title.innerHTML = 'ত্রুটি!';
    msg.innerHTML = message;
    
    modal.style.display = 'flex';
}

// সাকসেস মেসেজ শো করা
function showSuccess(message) {
    const modal = document.getElementById('confirmation-modal');
    const icon = document.getElementById('confirmation-icon');
    const title = document.getElementById('confirmation-title');
    const msg = document.getElementById('confirmation-message');
    
    icon.innerHTML = '✅';
    icon.className = 'confirmation-icon success-icon';
    title.innerHTML = 'অর্ডার সফল!';
    msg.innerHTML = message;
    
    modal.style.display = 'flex';
}

// কনফার্মেশন মেসেজ ক্লোজ করা
function closeConfirmation() {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'none';
    
    // ফর্ম ক্লিয়ার করা
    const forms = document.querySelectorAll('.order-form.active');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[type="text"], input[type="email"]');
        inputs.forEach(input => {
            input.value = '';
        });
    });
}

// অর্ডার সাবমিট করা
function submitOrder(section) {
    const email = document.getElementById(`${section}-email`).value;
    const target = document.getElementById(`${section}-number`).value;
    const transactionId = document.getElementById(`${section}-bkash`).value;
    const serviceName = document.getElementById(`${section}-service`).value;
    const price = document.getElementById(`${section}-price`).value;
    const operator = document.getElementById(`${section}-operator`).value;
    
    let deliveryTime = '২০-২৫ মিনিট';
    if (section === 'imei-info' || section === 'call-list' || section === 'sms-list') {
        deliveryTime = '12-24 ঘন্টা';
    } else if (section === 'bkash-info') {
        deliveryTime = '৫ মিনিট';
    }
    
    // টেলিগ্রাম বটে ডেটা সেন্ড করা
    sendToTelegramBot(email, target, transactionId, serviceName, price, operator);
    
    // প্রফেশনাল কনফার্মেশন মেসেজ তৈরি
    const confirmationMessage = `
        <strong>আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!</strong><br><br>
        <strong>সার্ভিস টাইপ:</strong> ${serviceName}<br>
        <strong>মূল্য:</strong> ${price}<br>
        <strong>ডেলিভারি সময়:</strong> ${deliveryTime}<br><br>
        অনুগ্রহ করে নির্দিষ্ট সময় পর আপনার দেয়া ইমেইল এর spam box চেক করুন। আমাদের সাথে থাকার জন্য ধন্যবাদ!
    `;
    
    // গ্রাফিক্যাল কনফার্মেশন শো করা
    showSuccess(confirmationMessage);
}

// টেলিগ্রাম বটে ডেটা সেন্ড করা (আপডেটেড ফরম্যাট)
function sendToTelegramBot(email, target, transactionId, serviceName, price, operator) {
    const botToken = '7249136904:AAGFPmdS5CnextPMpNlUPv0qeSuVHBaUF-w';
    const chatId = '8174575316';
    
    const message = `
        নতুন অর্ডার রিকোয়েস্ট!\n
        সার্ভিস নাম: ${serviceName}\n
        সার্ভিস ফি: ${price}\n
        টার্গেট সিম ওপারেটর: ${operator}\n
        টার্গেট নাম্বার: ${target}\n
        রিসিভার মেইল: ${email}\n
        ট্রানজিশন আইডি: ${transactionId}\n
        সময়: ${new Date().toLocaleString()}
    `;
    
    // টেলিগ্রাম API ব্যবহার করে মেসেজ সেন্ড করা
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Message sent to Telegram:', data);
    })
    .catch(error => {
        console.error('Error sending message:', error);
    });
}