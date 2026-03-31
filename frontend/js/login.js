import api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('login-btn');
        
        // UI Feedback
        if (loginBtn) {
            loginBtn.textContent = 'Connexion...';
            loginBtn.disabled = true;
        }
        if (loginError) loginError.style.display = 'none';

        try {
            const response = await api.auth.login({ email, password });
            
            // Save token and user info
            localStorage.setItem('quizzbox_token', response.token);
            localStorage.setItem('quizzbox_user', JSON.stringify(response.user));
            
            // Redirect
            window.location.replace('dashboard.html');
        } catch (err) {
            console.error('Login failed:', err);
            if (loginError) {
                loginError.textContent = err.message || 'Échec de la connexion. Vérifiez vos identifiants.';
                loginError.style.display = 'block';
            }
            if (loginBtn) {
                loginBtn.textContent = 'Se connecter à QuizzBox';
                loginBtn.disabled = false;
            }
        }
    });
});