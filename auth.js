// auth.js - Complete Fixed Version
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Auth system initialized');
    
    // Debug: Log current path and auth status
    console.log(`Current page: ${window.location.pathname}`);
    console.log(`Auth status: ${localStorage.getItem('isAuthenticated')}`);

    // Redirect logic
    if (isAuthenticated() && !isOnIndexPage()) {
        console.log('[DEBUG] Redirecting to index.html');
        window.location.href = 'index.html';
        return;
    }

    // Form initialization
    initForms();
});

function isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
}

function isOnIndexPage() {
    return window.location.pathname.includes('index.html');
}

function initForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        console.log('[DEBUG] Initializing login form');
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        console.log('[DEBUG] Initializing signup form');
        signupForm.addEventListener('submit', handleSignup);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('[DEBUG] Login attempt started');

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        console.log('[DEBUG] Stored users:', users);

        // Find user (case-insensitive email)
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            console.log('[DEBUG] User not found');
            showError('Invalid email or password');
            return;
        }

        console.log('[DEBUG] Found user:', user);

        // Password comparison
        if (user.password !== password) {
            console.log('[DEBUG] Password mismatch');
            console.log(`[DEBUG] Entered: ${password}`);
            console.log(`[DEBUG] Stored: ${user.password}`);
            showError('Invalid email or password');
            return;
        }

        // Successful login
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        console.log('[DEBUG] Login successful, redirecting...');
        showSuccess('Login successful! Redirecting...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.href = 'index.html';

    } catch (error) {
        console.error('[ERROR] Login failed:', error);
        showError('An error occurred during login');
    }
}

function handleSignup(e) {
    e.preventDefault();
    console.log('[DEBUG] Signup attempt started');

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    try {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user exists
        if (users.some(u => u.email === email)) {
            showError('Email already registered');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('[DEBUG] New user created:', newUser);
        showSuccess('Registration successful! Redirecting to login...');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        console.error('[ERROR] Signup failed:', error);
        showError('An error occurred during registration');
    }
}

function showError(message) {
    console.log(`[ERROR] ${message}`);
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    errorEl.style.display = 'block';

    // Clear previous messages
    document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
    
    const form = document.querySelector('form');
    form.appendChild(errorEl);
}

function showSuccess(message) {
    console.log(`[SUCCESS] ${message}`);
    const successEl = document.createElement('div');
    successEl.className = 'success-message';
    successEl.textContent = message;
    successEl.style.display = 'block';

    // Clear previous messages
    document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
    
    const form = document.querySelector('form');
    form.appendChild(successEl);
}