import api from './api.js';

// 1. Auth Check - Direct execution
const token = localStorage.getItem('quizzbox_token');
if (!token) {
    window.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', async () => {
    const evalsContainer = document.getElementById('evaluations-container');
    const statsLine = document.getElementById('stats-line');
    const searchInput = document.getElementById('search-input');
    const userInitial = document.getElementById('user-initial');

    let allEvaluations = [];

    // Load User UI
    const user = JSON.parse(localStorage.getItem('quizzbox_user') || '{}');
    if (user.name && userInitial) {
        userInitial.textContent = user.name.charAt(0).toUpperCase();
    }

    // Refresh Data
    async function loadData() {
        try {
            allEvaluations = await api.evaluations.list();
            render(allEvaluations);
        } catch (err) {
            console.error('Failed to load my-evaluations:', err);
            if (statsLine) statsLine.textContent = 'Erreur lors du chargement.';
        }
    }

    function render(evals) {
        if (!evalsContainer) return;
        evalsContainer.innerHTML = '';

        if (evals.length === 0) {
            evalsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 3rem;">Aucune évaluation trouvée.</p>';
            if (statsLine) statsLine.textContent = '0 évaluation';
            return;
        }

        if (statsLine) statsLine.textContent = `${evals.length} évaluation${evals.length > 1 ? 's' : ''}`;

        evals.forEach(ev => {
            const isShared = ev.visibility === 'SHARED' || ev.visibility === 'PUBLIC';
            const card = document.createElement('article');
            card.className = 'eval-card animate-fade';
            card.innerHTML = `
                <span class="badge ${isShared ? 'shared' : 'private'}">${isShared ? 'Partagée' : 'Privée'}</span>
                <h3>${ev.title}</h3>
                <p>${ev.description || 'Module de télé-évaluation.'}</p>
                <div class="card-footer">
                    <span>Questions: <strong>${ev.numQuestions || 0}</strong></span>
                    <span>Code: <strong>${ev.accessCode || '—'}</strong></span>
                </div>
                <div class="card-actions">
                    <button class="btn-action" onclick="window.location.href='create.html?edit=${ev.id}'">Modifier</button>
                    <button class="btn-action" onclick="window.location.href='results.html?evaluationId=${ev.id}'">Résultats</button>
                    <button class="btn-action delete" data-id="${ev.id}">Supprimer</button>
                </div>
            `;
            evalsContainer.appendChild(card);
        });

        // Add Delete listeners
        evalsContainer.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
                    try {
                        await api.evaluations.delete(id);
                        loadData(); // Refresh
                    } catch (err) {
                        alert('Erreur lors de la suppression : ' + err.message);
                    }
                }
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
            render(filtered);
        });
    }

    // Logout
    if (userInitial) {
        userInitial.addEventListener('click', () => {
            localStorage.removeItem('quizzbox_token');
            localStorage.removeItem('quizzbox_user');
            window.location.replace('login.html');
        });
    }

    loadData();
});