import api from './api.js';

// 1. Auth Check - Direct execution
const token = localStorage.getItem('quizzbox_token');
if (!token) {
    window.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', async () => {
    const userGreeting = document.getElementById('user-greeting');
    const userInitial = document.getElementById('user-initial');
    const evalsContainer = document.getElementById('evaluations-container');
    const totalEvalsEl = document.getElementById('total-evals');
    const sharedEvalsEl = document.getElementById('shared-evals');
    const privateEvalsEl = document.getElementById('private-evals');
    const searchInput = document.getElementById('search-input');

    let allEvaluations = [];

    // Load User Data from Cache
    const user = JSON.parse(localStorage.getItem('quizzbox_user') || '{}');
    if (user.name) updateUserUI(user);

    // Refresh User Profile & Evaluations
    try {
        const freshProfile = await api.auth.getProfile();
        localStorage.setItem('quizzbox_user', JSON.stringify(freshProfile));
        updateUserUI(freshProfile);

        allEvaluations = await api.evaluations.list();
        renderEvaluations(allEvaluations);
        updateStats(allEvaluations);
    } catch (err) {
        console.error('Dashboard init error:', err);
    }

    // --- Helpers ---

    function updateUserUI(user) {
        if (userGreeting) userGreeting.textContent = user.name || user.fullName || 'Utilisateur';
        if (userInitial) userInitial.textContent = (user.name || user.fullName || 'U').charAt(0).toUpperCase();
    }

    function renderEvaluations(evaluations) {
        if (!evalsContainer) return;

        evalsContainer.innerHTML = evaluations.map(evaluation => `
            <article class="eval-card">
                <h3>${evaluation.title}</h3>
                <p>${evaluation.description || 'Pas de description disponible.'}</p>
                <div class="actions">
                    <button class="btn-launch" data-id="${evaluation.id}">Lancer</button>
                    <button class="btn-edit" data-id="${evaluation.id}">Modifier</button>
                </div>
            </article>
        `).join('');

        // Ajout des événements pour les boutons dynamiques
        document.querySelectorAll('.btn-launch').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const evalId = e.target.dataset.id;
                window.location.href = `session.html?id=${evalId}`;
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const evalId = e.target.dataset.id;
                window.location.href = `edit.html?id=${evalId}`;
            });
        });
    }

    function updateStats(evaluations) {
        if (totalEvalsEl) totalEvalsEl.textContent = evaluations.length;
        if (sharedEvalsEl) sharedEvalsEl.textContent = evaluations.filter(e => e.visibility === 'SHARED' || e.visibility === 'PUBLIC').length;
        if (privateEvalsEl) privateEvalsEl.textContent = evaluations.filter(e => e.visibility === 'PRIVATE' || !e.visibility).length;
    }

    // --- Listeners ---

    // Logout
    if (userInitial) {
        userInitial.addEventListener('click', () => {
            if (confirm('Voulez-vous vous déconnecter ?')) {
                localStorage.removeItem('quizzbox_token');
                localStorage.removeItem('quizzbox_user');
                window.location.replace('login.html');
            }
        });
    }

    // Nouvelle évaluation button (in the search row)
    const newEvalBtn = document.getElementById('new-eval-btn');
    if (newEvalBtn) {
        newEvalBtn.addEventListener('click', () => {
            window.location.href = 'create.html';
        });
    }

    // Gestionnaire pour le bouton "+ Nouvelle évaluation"
    const createNewCard = document.getElementById('create-new-card');
    if (createNewCard) {
        createNewCard.addEventListener('click', () => {
            window.location.href = 'create.html';
        });
    }

    // Gestionnaires pour les boutons dynamiques des évaluations
    function renderEvaluations(evaluations) {
        if (!evalsContainer) return;

        evalsContainer.innerHTML = evaluations.map(evaluation => `
            <article class="eval-card">
                <h3>${evaluation.title}</h3>
                <p>${evaluation.description || 'Pas de description disponible.'}</p>
                <div class="actions">
                    <button class="btn-launch" data-id="${evaluation.id}">Lancer</button>
                    <button class="btn-edit" data-id="${evaluation.id}">Modifier</button>
                </div>
            </article>
        `).join('');

        // Ajout des événements pour les boutons dynamiques
        document.querySelectorAll('.btn-launch').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const evalId = e.target.dataset.id;
                window.location.href = `session.html?id=${evalId}`;
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const evalId = e.target.dataset.id;
                window.location.href = `edit.html?id=${evalId}`;
            });
        });
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allEvaluations.filter(ev =>
                ev.title.toLowerCase().includes(query) ||
                (ev.description && ev.description.toLowerCase().includes(query))
            );
            renderEvaluations(filtered);
        });
    }
});