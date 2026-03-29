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
    login(credentials) {
      return api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    register(userData) {
      return api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: userData.name,
          email: userData.email,
          password: userData.password,
        }),
      });
    },
    getProfile() {
      return api.request('/auth/profile');
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
    join(code) {
      // Formater le code sans tiret pour coller au length(6) du backend (ex: XXX-XXX -> XXXXXX)
      const cleanCode = code.replace(/-/g, '');
      return api.request('/evaluation/join', {
        method: 'POST',
        body: JSON.stringify({ accessCode: cleanCode }),
      });
    }
  }
};

export default api;
