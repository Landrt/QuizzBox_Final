import api from './api.js';

// 1. Auth Check
const token = localStorage.getItem('quizzbox_token');
if (!token) {
    window.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const evalId = params.get('id');
    
    if (!evalId) {
        window.location.replace('dashboard.html');
        return;
    }

    // UI Elements
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const indicator = document.getElementById('question-indicator');
    const timerEl = document.getElementById('session-timer');
    const progressText = document.getElementById('progress-text');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const submitBtn = document.getElementById('submit-btn');
    const quitBtn = document.getElementById('quit-btn');
    const messageEl = document.getElementById('session-message');

    let sessionId = null;
    let currentQuestion = null;
    let selectedOptionId = null;
    let timerInterval = null;
    let timeLeft = 0;

    // Quit logic
    if (quitBtn) {
        quitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Voulez-vous vraiment quitter ? Votre progression sera perdue.')) {
                window.location.replace('dashboard.html');
            }
        });
    }

    // Start Session
    try {
        const session = await api.session.start(evalId);
        sessionId = session.id;
        loadNextQuestion();
    } catch (err) {
        console.error('Session start failed:', err);
        questionText.textContent = 'Erreur : ' + (err.message || 'Impossible de démarrer la session.');
    }

    async function loadNextQuestion() {
        try {
            // Reset UI
            if (messageEl) messageEl.textContent = '';
            selectedOptionId = null;
            if (optionsContainer) optionsContainer.innerHTML = '';
            if (submitBtn) submitBtn.disabled = true;

            const data = await api.session.getCurrentQuestion(sessionId);
            
            if (data.status === 'COMPLETED') {
                finishQuiz();
                return;
            }

            currentQuestion = data.question;
            const index = data.currentQuestionIndex;
            const total = data.totalQuestions;

            // Update UI
            if (indicator) indicator.textContent = `Question ${index + 1} sur ${total}`;
            if (questionText) questionText.textContent = currentQuestion.text;
            if (progressText) progressText.textContent = `${Math.round((index / total) * 100)}% Terminé`;
            if (progressBarFill) progressBarFill.style.width = `${(index / total) * 100}%`;

            renderOptions(currentQuestion.options);
            startTimer(data.timeRemaining || data.evaluation.timePerQuestion);

        } catch (err) {
            console.error('Failed to load question:', err);
            if (messageEl) messageEl.textContent = 'Erreur lors du chargement de la question.';
        }
    }

    function renderOptions(options) {
        if (!optionsContainer) return;
        optionsContainer.innerHTML = '';
        
        options.forEach(opt => {
            const optEl = document.createElement('div');
            optEl.className = 'option animate-fade';
            optEl.textContent = opt.text;
            optEl.dataset.id = opt.id;
            
            optEl.addEventListener('click', () => {
                // Select only one
                const all = optionsContainer.querySelectorAll('.option');
                all.forEach(o => o.classList.remove('selected'));
                optEl.classList.add('selected');
                selectedOptionId = opt.id;
                if (submitBtn) submitBtn.disabled = false;
            });
            
            optionsContainer.appendChild(optEl);
        });
    }

    function startTimer(seconds) {
        if (timerInterval) clearInterval(timerInterval);
        
        timeLeft = seconds;
        updateTimerUI();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerUI();
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                autoSubmit();
            }
        }, 1000);
    }

    function updateTimerUI() {
        if (!timerEl) return;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerEl.textContent = `⏱ ${mins}:${secs.toString().padStart(2, '0')} restant`;
        
        if (timeLeft <= 10) {
            timerEl.classList.add('warning');
        } else {
            timerEl.classList.remove('warning');
        }
    }

    async function autoSubmit() {
        if (messageEl) messageEl.textContent = 'Temps écoulé ! Passage à la question suivante...';
        // Wait a bit then submit null if nothing selected or just current selection
        setTimeout(() => submitAnswer(), 1500);
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', () => submitAnswer());
    }

    async function submitAnswer() {
        if (timerInterval) clearInterval(timerInterval);
        
        try {
            if (submitBtn) submitBtn.disabled = true;
            await api.session.submitAnswer(sessionId, selectedOptionId);
            loadNextQuestion();
        } catch (err) {
            console.error('Submit failed:', err);
            if (messageEl) messageEl.textContent = 'Échec de la soumission. Tentative de reconnexion...';
            // Retry button?
            if (submitBtn) submitBtn.disabled = false;
        }
    }

    function finishQuiz() {
        if (timerInterval) clearInterval(timerInterval);
        window.location.replace(`results.html?sessionId=${sessionId}`);
    }
});