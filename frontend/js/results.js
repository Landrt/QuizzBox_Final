import api from './api.js';

// 1. Auth Check - Direct execution
const token = localStorage.getItem('quizzbox_token');
if (!token) {
    window.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('sessionId') || params.get('session');
    const evaluationId = params.get('evaluationId');
    const content = document.getElementById('results-content');
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

    if (evaluationId) {
        await loadAdminResults(evaluationId);
    } else if (sessionId) {
        await loadSessionResults(sessionId);
    } else {
        renderError('Aucune session ou évaluation spécifiée.');
    }

    async function loadAdminResults(evalId) {
        try {
            const ev = await api.evaluations.get(evalId);
            content.innerHTML = `
                <section class="top-summary">
                    <span class="badge" style="background: #eff6ff; color: #1e40af;">Vue Admin</span>
                    <h1>Analyse : ${ev.title}</h1>
                    <p>Résumé des performances pour cette évaluation clinique.</p>
                </section>

                <section class="stats-grid">
                    <article class="card stat-card">
                        <small>Questions</small>
                        <h2>${ev.numQuestions || 0}</h2>
                    </article>
                    <article class="card stat-card">
                        <small>Visibilité</small>
                        <h2>${ev.visibility === 'SHARED' || ev.visibility === 'PUBLIC' ? 'Publique' : 'Privée'}</h2>
                    </article>
                    <article class="card stat-card">
                        <small>Code Accès</small>
                        <h2>${ev.accessCode || '—'}</h2>
                    </article>
                    <article class="card stat-card">
                        <small>Temps / Q</small>
                        <h2>${ev.timePerQuestion}s</h2>
                    </article>
                </section>

                <section class="actions-row" style="margin-top: 2rem;">
                    <a href="dashboard.html" class="btn outline">← Retour</a>
                    <a href="create.html?edit=${ev.id}" class="btn primary">Modifier l'évaluation</a>
                </section>
            `;
        } catch (err) {
            renderError("Impossible de charger les détails de l'évaluation.");
        }
    }

    async function loadSessionResults(sId) {
        try {
            const result = await api.session.getResult(sId);
            const score = result.score ?? 0;
            const total = result.totalQuestions ?? 0;
            const correct = result.correctAnswersCount ?? 0;
            const wrong = total - correct;
            
            const grade = getGrade(score);

            content.innerHTML = `
                <section class="top-summary">
                    <span class="badge">Évaluation terminée</span>
                    <h1>Bravo, ${user.name || 'Étudiant'} !</h1>
                    <p>Voici vos résultats détaillés pour cette session QuizzBox.</p>
                </section>

                <section class="stats-grid">
                    <article class="card score-card">
                        <div class="circle-score">
                            <strong>${correct}</strong><span>/${total}</span>
                        </div>
                        <div class="score-label" style="font-weight: 700; margin-top: 0.5rem; color: var(--primary);">${grade.label}</div>
                    </article>

                    <article class="card stat-card">
                        <small>Score global</small>
                        <h2>${score}%</h2>
                    </article>

                    <article class="card stat-card">
                        <small>Questions totales</small>
                        <h2>${total}</h2>
                    </article>

                    <article class="card answer-card">
                        <div style="display:flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong>Correctes</strong>
                            <span style="color: #059669; font-weight: 700;">✓ ${correct}</span>
                        </div>
                        <div style="display:flex; justify-content: space-between;">
                            <strong>Incorrectes</strong>
                            <span style="color: #dc2626; font-weight: 700;">✗ ${wrong}</span>
                        </div>
                    </article>
                </section>

                <section class="actions-row">
                    <a href="join.html" class="btn primary">Refaire une évaluation</a>
                    <a href="dashboard.html" class="btn outline">← Retour au Dashboard</a>
                </section>

                <section class="insight-block">
                    <div class="insight-text">
                        <span>QuizzBox Insight</span>
                        <blockquote>"${grade.insight}"</blockquote>
                        <small>Analyse automatique de vos résultats</small>
                    </div>
                </section>
            `;
        } catch (err) {
            console.error('Failed to load session results:', err);
            renderError(err.message || 'Impossible de charger les résultats.');
        }
    }

    function getGrade(score) {
        if (score >= 90) return { label: 'Excellent', insight: 'Maîtrise exceptionnelle du sujet.' };
        if (score >= 70) return { label: 'Très bien', insight: 'Bonne compréhension des concepts clés.' };
        if (score >= 50) return { label: 'Satisfaisant', insight: 'Quelques lacunes mais les bases sont là.' };
        return { label: 'À revoir', insight: 'Une révision approfondie est recommandée.' };
    }

    function renderError(msg) {
        if (!content) return;
        content.innerHTML = `
            <div style="text-align:center; padding: 4rem 2rem;">
                <p style="font-size: 1.2rem; color: var(--muted); margin-bottom: 2rem;">😕 ${msg}</p>
                <a href="dashboard.html" class="btn outline">← Retour au Dashboard</a>
            </div>`;
    }
});