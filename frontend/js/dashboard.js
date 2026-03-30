import api from './js/api.js';

// 1. Auth Check
const token = localStorage.getItem('quizzbox_token');
if (!token) window.location.replace('login.html');

// 2. Initialize
async function init() {
  try {
    const cachedUser = localStorage.getItem('quizzbox_user');
    if (cachedUser) {
      updateUserUI(JSON.parse(cachedUser));
    }

    const userData = await api.auth.getProfile();
    localStorage.setItem('quizzbox_user', JSON.stringify(userData));
    updateUserUI(userData);
    
    await fetchEvaluations();
  } catch (err) {
    console.error("Session sync failed:", err);
    localStorage.removeItem('quizzbox_token');
    localStorage.removeItem('quizzbox_user');
    window.location.replace('login.html');
  }
}

function updateUserUI(user) {
  const nameParts = user.name ? user.name.split(' ') : ['User'];
  document.getElementById('user-initial').textContent = nameParts[0].charAt(0).toUpperCase();
  document.getElementById('user-greeting').textContent = nameParts[0];
}

async function fetchEvaluations(query = '') {
  try {
    const evals = await api.evaluations.list();
    const container = document.getElementById('evaluations-container');
    container.innerHTML = '';

    // Create New Card
    const createCard = document.createElement('article');
    createCard.className = 'eval-card create-card';
    createCard.onclick = () => window.location.href = 'create.html';
    createCard.innerHTML = '<div class="icon">+</div><h3>Créer une évaluation</h3><p>Construire un nouveau module d\'évaluation clinique</p>';
    container.appendChild(createCard);

    if (!evals) return;

    const filtered = evals.filter(ev => {
      const s = query.toLowerCase();
      return ev.title.toLowerCase().includes(s) || (ev.description || '').toLowerCase().includes(s);
    });

    let shared = 0;
    filtered.forEach(ev => {
      const isShared = ev.visibility === 'SHARED';
      if (isShared) shared++;

      const el = document.createElement('article');
      el.className = 'eval-card';
      el.innerHTML = `
        <span class="badge ${isShared ? 'shared' : 'private'}">${isShared ? 'Partagée' : 'Privée'}</span>
        <h3>${ev.title}</h3>
        <p>${ev.description || 'Module de télé-évaluation clinique.'}</p>
        <div class="card-footer">
          <div><strong>${ev._count?.questions ?? 0}</strong> Questions</div>
          <div>Code : <strong>${ev.accessCode || '—'}</strong></div>
        </div>
        <div class="card-actions">
          <a href="create.html?edit=${ev.id}">Modifier</a>
          <a href="results.html?evaluationId=${ev.id}">Résultats</a>
        </div>
      `;
      container.appendChild(el);
    });

    document.getElementById('total-evals').textContent = filtered.length;
    document.getElementById('shared-evals').textContent = shared;
    document.getElementById('private-evals').textContent = filtered.length - shared;
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

// Profile Click -> Logout
document.getElementById('user-initial').addEventListener('click', () => {
  localStorage.removeItem('quizzbox_token');
  localStorage.removeItem('quizzbox_user');
  window.location.replace('login.html');
});

const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    fetchEvaluations(e.target.value);
  });
}

init();