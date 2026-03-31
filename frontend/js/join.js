import api from './api.js';

// 1. Auth Check - Direct execution
const token = localStorage.getItem('quizzbox_token');
if (!token) {
    window.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('join-form');
    const accessCodeInput = document.getElementById('access-code');
    const joinError = document.getElementById('join-error');
    const joinBtn = document.getElementById('join-btn');
    const userInitial = document.getElementById('user-initial');

    // UI Handle
    const user = JSON.parse(localStorage.getItem('quizzbox_user') || '{}');
    if (user.name && userInitial) {
        userInitial.textContent = user.name.charAt(0).toUpperCase();
    }

    // Logout
    if (userInitial) {
        userInitial.addEventListener('click', () => {
            localStorage.removeItem('quizzbox_token');
            localStorage.removeItem('quizzbox_user');
            window.location.replace('login.html');
        });
    }

    // Auto-formatting the access code (e.g. XXX-XXX)
    if (accessCodeInput) {
        accessCodeInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            if (val.length > 3) {
                val = val.substring(0, 3) + '-' + val.substring(3, 6);
            }
            e.target.value = val;
        });
    }

    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const code = accessCodeInput.value.trim().toUpperCase();
            if (!code) return;

            try {
                if (joinError) joinError.style.display = 'none';
                if (joinBtn) {
                    joinBtn.textContent = 'Connexion...';
                    joinBtn.disabled = true;
                }
                
                // Use the API wrapper
                const response = await api.evaluations.join(code);
                
                // If successful, store id and move to session
                if (response && response.id) {
                    sessionStorage.setItem('current_eval_id', response.id);
                    window.location.href = `session.html?id=${response.id}`;
                } else {
                    throw new Error('Évaluation introuvable.');
                }

            } catch (err) {
                if (joinError) {
                    joinError.textContent = err.message || 'Code d\'accès invalide ou session expirée.';
                    joinError.style.display = 'block';
                    accessCodeInput.value = '';
                    accessCodeInput.focus();
                    
                    joinError.animate([
                        { transform: 'translateX(0)' },
                        { transform: 'translateX(-5px)' },
                        { transform: 'translateX(5px)' },
                        { transform: 'translateX(0)' }
                    ], { duration: 300 });
                }
                if (joinBtn) {
                    joinBtn.textContent = 'Rejoindre la session →';
                    joinBtn.disabled = false;
                }
            }
        });
    }
});