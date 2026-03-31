import api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const registerError = document.getElementById('register-error');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const terms = document.getElementById('terms').checked;
        const registerBtn = document.getElementById('register-btn');
        
        if (!terms) {
            if (registerError) {
                registerError.textContent = 'Veuillez accepter les conditions d\'utilisation.';
                registerError.style.display = 'block';
            }
            return;
        }

        // UI Feedback
        if (registerBtn) {
            registerBtn.textContent = 'Création du compte...';
            registerBtn.disabled = true;
        }
        if (registerError) registerError.style.display = 'none';

        try {
            const response = await api.auth.register({ name, email, password });
            
            // Save token and user info
            localStorage.setItem('quizzbox_token', response.token);
            localStorage.setItem('quizzbox_user', JSON.stringify(response.user));
            
            // Redirect
            window.location.replace('dashboard.html');
        } catch (err) {
            console.error('Registration failed:', err);
            if (registerError) {
                registerError.textContent = err.message || 'Échec de l\'inscription.';
                registerError.style.display = 'block';
            }
            if (registerBtn) {
                registerBtn.textContent = 'Créer mon compte QuizzBox';
                registerBtn.disabled = false;
            }
        }
    });
});