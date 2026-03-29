const API_BASE_URL = '/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('quizzbox_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Si réponse 401, rediriger vers login
      if (response.status === 401) {
        localStorage.removeItem('quizzbox_token');
        localStorage.removeItem('quizzbox_user');
        window.location.href = '/login.html';
        throw new Error('Session expired. Please login again.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  auth: {
    async login(credentials) {
      const res = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      // Normalize fullName → name for all frontend pages
      if (res.user && res.user.fullName) {
        res.user.name = res.user.fullName;
      }
      return res;
    },
    async register(userData) {
      const res = await api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: userData.name,
          email: userData.email,
          password: userData.password,
        }),
      });
      if (res.user && res.user.fullName) {
        res.user.name = res.user.fullName;
      }
      return res;
    },
    async getProfile() {
      const user = await api.request('/auth/profile');
      // Normalize fullName → name
      if (user && user.fullName) {
        user.name = user.fullName;
      }
      return user;
    }
  },

  evaluations: {
    list() {
      return api.request('/evaluation/user/me');
    },
    get(id) {
      return api.request(`/evaluation/${id}`);
    },
    create(data) {
      return api.request('/evaluation', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    generateCode(evaluationId) {
      return api.request(`/evaluation/${evaluationId}/generate-code`, {
        method: 'POST',
      });
    },
    join(code) {
      const cleanCode = code.replace(/-/g, '');
      return api.request('/evaluation/join', {
        method: 'POST',
        body: JSON.stringify({ accessCode: cleanCode }),
      });
    },
    delete(id) {
      return api.request(`/evaluation/${id}`, {
        method: 'DELETE',
      });
    }
  },

  session: {
    start(evaluationId) {
      return api.request('/session/start', {
        method: 'POST',
        body: JSON.stringify({ evaluationId }),
      });
    },
    getCurrentQuestion(sessionId) {
      return api.request(`/session/${sessionId}/current-question`);
    },
    submitAnswer(sessionId, optionId) {
      return api.request(`/session/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ optionId }),
      });
    },
    getResult(sessionId) {
      return api.request(`/session/${sessionId}/result`);
    }
  },

  questions: {
    create(evaluationId, questionData) {
      return api.request(`/evaluation/${evaluationId}/questions`, {
        method: 'POST',
        body: JSON.stringify({
          text: questionData.text,
          options: questionData.answers.map(ans => ({
            text: ans.text,
            isCorrect: ans.isCorrect,
          })),
        }),
      });
    },
    list(evaluationId) {
      return api.request(`/evaluation/${evaluationId}/questions`);
    }
  }
};

export default api;
