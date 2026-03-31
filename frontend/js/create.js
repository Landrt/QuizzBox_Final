import api from './api.js';

// 1. Auth Check - Direct execution
const token = localStorage.getItem('quizzbox_token');
if (!token) {
    window.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', () => {
    // Mode Switching
    const modeBtnAi = document.getElementById('mode-btn-ai');
    const modeBtnManual = document.getElementById('mode-btn-manual');
    const aiModeContent = document.getElementById('ai-mode');
    const manualModeContent = document.getElementById('manual-mode');
    const manualEditorSection = document.getElementById('manual-editor-section');

    let currentMode = 'AI'; // Matches technical guide "AI" or "MANUAL"
    let questions = [];

    // Mode Toggle
    if (modeBtnAi && modeBtnManual) {
        modeBtnAi.addEventListener('click', () => {
            currentMode = 'AI';
            toggleMode();
        });
        modeBtnManual.addEventListener('click', () => {
            currentMode = 'MANUAL';
            toggleMode();
        });
    }

    function toggleMode() {
        if (currentMode === 'AI') {
            modeBtnAi.classList.add('active');
            modeBtnManual.classList.remove('active');
            aiModeContent.style.display = 'block';
            manualModeContent.style.display = 'none';
            manualEditorSection.style.display = 'none';
        } else {
            modeBtnAi.classList.remove('active');
            modeBtnManual.classList.add('active');
            aiModeContent.style.display = 'none';
            manualModeContent.style.display = 'block';
            manualEditorSection.style.display = 'block';
            if (questions.length === 0) addQuestion(); // Add first question if empty
        }
    }

    // --- MANUAL MODE LOGIC ---
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    const saveBtn = document.getElementById('save-btn');

    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => addQuestion());
    }

    function addQuestion(initialData = null) {
        const qIndex = questions.length;
        const qData = initialData || {
            text: '',
            answers: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        };
        questions.push(qData);
        renderQuestion(qIndex);
        updateProgress();
    }

    function renderQuestion(index) {
        const q = questions[index];
        const qEl = document.createElement('div');
        qEl.className = 'question-card animate-fade';
        qEl.id = `q-card-${index}`;
        qEl.innerHTML = `
            <div class="question-top">
                <span>Question #${index + 1}</span>
                <button class="btn light btn-delete" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">Supprimer</button>
            </div>
            <textarea placeholder="Quelle est votre question ?">${q.text}</textarea>
            <div class="answers-row">
                ${q.answers.map((ans, aIdx) => `
                    <div class="answer">
                        <input type="checkbox" ${ans.isCorrect ? 'checked' : ''} />
                        <input type="text" class="answer-text" placeholder="Option ${aIdx + 1}" value="${ans.text}" />
                    </div>
                `).join('')}
            </div>
        `;
        questionsContainer.appendChild(qEl);

        // Ajouter les gestionnaires d'événements dynamiquement
        qEl.querySelector('.btn-delete').addEventListener('click', () => {
            qEl.remove();
            questions.splice(index, 1);
            updateProgress();
        });

        qEl.querySelectorAll('.answer input[type=checkbox]').forEach((checkbox, aIdx) => {
            checkbox.addEventListener('change', () => {
                toggleCorrect(index, aIdx);
            });
        });

        qEl.querySelectorAll('.answer-text').forEach((input, aIdx) => {
            input.addEventListener('input', (e) => {
                updateAnswerText(index, aIdx, e.target.value);
            });
        });
    }

    function toggleCorrect(qIndex, aIndex) {
        questions[qIndex].answers.forEach((ans, idx) => {
            ans.isCorrect = idx === aIndex;
        });
        renderQuestions();
    }

    function updateAnswerText(qIndex, aIndex, text) {
        questions[qIndex].answers[aIndex].text = text;
    }

    // Gestionnaire pour supprimer une question dynamiquement
    function addDeleteQuestionListeners() {
        document.querySelectorAll('.question-card .btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questionCard = e.target.closest('.question-card');
                if (questionCard) questionCard.remove();
            });
        });
    }

    // Gestionnaire pour marquer une réponse comme correcte
    function addToggleCorrectListeners() {
        document.querySelectorAll('.answer').forEach(answer => {
            answer.addEventListener('click', (e) => {
                const target = e.currentTarget;
                target.classList.toggle('selected');
            });
        });
    }

    // Appeler les gestionnaires après le rendu des questions dynamiques
    function renderQuestions() {
        // ...code pour générer les questions dynamiquement...

        // Ajouter les gestionnaires après le rendu
        addDeleteQuestionListeners();
        addToggleCorrectListeners();
    }

    // Appeler renderQuestions après chaque modification
    renderQuestions();

    // Public helpers for inline handlers
    window.updateQuestionText = (qIdx, text) => { questions[qIdx].text = text; };
    window.updateAnswerText = (qIdx, aIdx, text) => { questions[qIdx].answers[aIdx].text = text; };
    window.toggleCorrect = (qIdx, aIdx, el) => {
        questions[qIdx].answers.forEach((a, i) => a.isCorrect = (i === aIdx));
        const checkboxes = el.parentElement.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((cb, i) => {
            cb.checked = (i === aIdx);
            cb.parentElement.classList.toggle('selected', i === aIdx);
        });
    };

    function updateProgress() {
        const bar = document.getElementById('progress-bar-el');
        if (bar) {
            const count = questions.length;
            const width = Math.min(100, (count / 10) * 100);
            bar.style.width = `${width}%`;
        }
    }

    // --- SAVE LOGIC ---
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const title = document.getElementById('eval-title').value;
            const visibility = document.getElementById('visibility-manual').value;
            const timeLimit = parseInt(document.getElementById('time-limit-manual').value);

            if (!title) { alert('Veuillez entrer un titre.'); return; }
            if (questions.length === 0) { alert('Veuillez ajouter au moins une question.'); return; }

            saveBtn.textContent = 'Enregistrement...';
            saveBtn.disabled = true;

            try {
                // 1. Create Evaluation
                const evalData = {
                    title,
                    description: '',
                    numQuestions: questions.length,
                    timePerQuestion: timeLimit,
                    mode: 'MANUAL',
                    visibility
                };

                const newEval = await api.evaluations.create(evalData);
                // 2. Create Questions
                for (const q of questions) {
                    await api.questions.create(newEval.evaluation.id, q);
                }

                alert('Évaluation créée avec succès !');
                window.location.href = 'dashboard.html';
            } catch (err) {
                console.error('Save failed:', err);
                alert('Erreur lors de l\'enregistrement : ' + err.message);
                saveBtn.textContent = 'Enregistrer';
                saveBtn.disabled = false;
            }
        });
    }

    // --- AI SAVE LOGIC ---
    const saveBtnAi = document.getElementById('save-btn-ai');
    if (saveBtnAi) {
        saveBtnAi.addEventListener('click', async () => {
            const title = document.getElementById('eval-title-ai').value;
            const visibility = document.getElementById('visibility-ai').value;
            const numQuestions = parseInt(document.getElementById('num-questions-ai').value);
            const timeLimit = parseInt(document.getElementById('time-limit-ai').value);

            saveBtnAi.textContent = 'Génération & Enregistrement...';
            saveBtnAi.disabled = true;

            try {
                const evalData = {
                    title: title || 'Évaluation IA',
                    numQuestions,
                    timePerQuestion: timeLimit,
                    mode: 'AI',
                    visibility
                };
                await api.evaluations.create(evalData);
                alert('Évaluation IA créée ! (Questions simulées)');
                window.location.href = 'dashboard.html';
            } catch (err) {
                alert('Erreur : ' + err.message);
                saveBtnAi.textContent = 'Sauvegarder l\'évaluation IA';
                saveBtnAi.disabled = false;
            }
        });
    }

    // JSON Import
    const importJsonBtn = document.getElementById('import-json-btn');
    const importJsonToggle = document.getElementById('import-json-toggle-btn');
    const importSection = document.getElementById('import-json-section');
    
    if (importJsonToggle) {
        importJsonToggle.addEventListener('click', () => {
            importSection.style.display = 'block';
        });
    }

    if (importJsonBtn) {
        importJsonBtn.addEventListener('click', () => {
            const jsonText = document.getElementById('json-input').value;
            try {
                const data = JSON.parse(jsonText);
                if (Array.isArray(data)) {
                    data.forEach(q => addQuestion(q));
                    importSection.style.display = 'none';
                    document.getElementById('json-input').value = '';
                }
            } catch (err) {
                alert('Format JSON invalide.');
            }
        });
    }

    // Fonction pour générer un code d'accès
    async function generateAccessCode(evaluationId) {
        try {
            const response = await fetch(`/api/evaluation/${evaluationId}/generate-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('quizzbox_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la génération du code d\'accès.');
            }

            const data = await response.json();
            displayAccessCode(data.accessCode);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Impossible de générer le code d\'accès.');
        }
    }

    // Fonction pour afficher le code d'accès dans l'interface utilisateur
    function displayAccessCode(accessCode) {
        const accessCodeContainer = document.getElementById('access-code-container');
        if (accessCodeContainer) {
            accessCodeContainer.textContent = `Code d'accès: ${accessCode}`;
            accessCodeContainer.style.display = 'block';
        }
    }

    // Exemple d'utilisation (à appeler après la création d'une évaluation)
    // generateAccessCode('<evaluationId>');
});