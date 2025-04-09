// auth.js - Final Fixed Version
document.addEventListener('DOMContentLoaded', () => {
    console.log('[AUTH] System initialized');
    
    // Debug storage
    console.log('[AUTH] Current storage:', {
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        currentUser: JSON.parse(localStorage.getItem('currentUser') || null,
        users: JSON.parse(localStorage.getItem('users')) || []
    });

    // Redirect if already authenticated
    if (isAuthenticated() && !isOnIndexPage()) {
        console.log('[AUTH] User authenticated, redirecting to index');
        window.location.href = 'index.html';
        return;
    }

    // Initialize forms
    initForms();
});

function isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
}

function isOnIndexPage() {
    return window.location.pathname.endsWith('index.html') || 
           window.location.pathname.endsWith('/');
}

function initForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        console.log('[AUTH] Initializing login form');
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        console.log('[AUTH] Initializing signup form');
        signupForm.addEventListener('submit', handleSignup);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('[AUTH] Handling login');
    
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    // Validate inputs
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    try {
        // Get users from storage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        console.log('[AUTH] All users:', users);

        // Find user by email (case-insensitive)
        const user = users.find(u => u.email.toLowerCase() === email);
        
        if (!user) {
            console.log('[AUTH] User not found for email:', email);
            showError('Invalid email or password');
            return;
        }

        console.log('[AUTH] Found user:', user);

        // Verify password (case-sensitive)
        if (user.password !== password) {
            console.log('[AUTH] Password mismatch');
            showError('Invalid email or password');
            return;
        }

        // Successful login
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        console.log('[AUTH] Login successful, redirecting...');
        showSuccess('Login successful! Redirecting...');
        
        // Redirect after short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.href = 'index.html';

    } catch (error) {
        console.error('[AUTH] Login error:', error);
        showError('An error occurred during login');
    }
}

function handleSignup(e) {
    e.preventDefault();
    console.log('[AUTH] Handling signup');
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validate inputs
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
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        if (users.some(u => u.email.toLowerCase() === email)) {
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

        // Save user
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('[AUTH] New user created:', newUser);
        showSuccess('Registration successful! Redirecting to login...');
        
        // Redirect to login after short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        console.error('[AUTH] Signup error:', error);
        showError('An error occurred during registration');
    }
}

function showError(message) {
    console.error('[UI] Error:', message);
    clearMessages();
    
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    document.querySelector('form').appendChild(errorEl);
}

function showSuccess(message) {
    console.log('[UI] Success:', message);
    clearMessages();
    
    const successEl = document.createElement('div');
    successEl.className = 'success-message';
    successEl.textContent = message;
    document.querySelector('form').appendChild(successEl);
}

function clearMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
}