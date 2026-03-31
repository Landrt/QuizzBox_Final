document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('quizzbox_token');
    const user = JSON.parse(localStorage.getItem('quizzbox_user') || '{}');
    
    // Auth elements in index.html (if any)
    const authButtons = document.querySelector('.auth-buttons'); // or similar
    const userProfile = document.getElementById('user-profile-nav');

    if (token && user.name) {
        // User is logged in
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            const initial = document.getElementById('user-initial');
            if (initial) initial.textContent = user.name.charAt(0).toUpperCase();
        }
        
        // Optional: Redirect to dashboard if they are on landing page and already logged in?
        // window.location.href = 'dashboard.html';
    }

    // Logout functionality
    const profileButton = document.getElementById('user-initial');
    if (profileButton) {
        profileButton.addEventListener('click', () => {
            localStorage.removeItem('quizzbox_token');
            localStorage.removeItem('quizzbox_user');
            window.location.reload();
        });
    }
});