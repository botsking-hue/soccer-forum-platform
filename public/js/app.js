// API Base URL
const API_BASE = '/.netlify/functions';

// Auth utilities
class Auth {
    static getToken() {
        return localStorage.getItem('token');
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }

    static redirectToLogin() {
        window.location.href = '/auth/login.html';
    }

    static checkAuth() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    static checkAdmin() {
        if (!this.isAuthenticated() || !this.isAdmin()) {
            window.location.href = '/dashboard.html';
            return false;
        }
        return true;
    }
}

// API utilities
class API {
    static async request(endpoint, options = {}) {
        const token = Auth.getToken();
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint);
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Forum utilities
class ForumManager {
    static async loadThreads(forumSlug, containerId) {
        try {
            const data = await API.get(`/forum/${forumSlug}/threads`);
            const container = document.getElementById(containerId);
            
            if (data.threads && data.threads.length > 0) {
                container.innerHTML = data.threads.map(thread => `
                    <div class="thread-item">
                        <a href="/forums/thread.html?id=${thread.id}" class="thread-title">
                            ${thread.title}
                        </a>
                        <p class="thread-preview">${thread.content.substring(0, 150)}...</p>
                        <div class="thread-meta">
                            By ${thread.creator_username} • 
                            ${new Date(thread.created_at).toLocaleDateString()} •
                            ${thread.tags ? thread.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="alert">No threads found. Be the first to create one!</div>';
            }
        } catch (error) {
            document.getElementById(containerId).innerHTML = 
                `<div class="alert alert-error">Error loading threads: ${error.message}</div>`;
        }
    }

    static async createThread(forumSlug, threadData) {
        try {
            const data = await API.post('/threads/create-thread', {
                ...threadData,
                forum_slug: forumSlug
            });
            
            alert('Thread created successfully!');
            window.location.href = `/forums/${forumSlug}.html`;
        } catch (error) {
            alert(`Error creating thread: ${error.message}`);
        }
    }

    static async loadThread(threadId) {
        try {
            const data = await API.get(`/threads/${threadId}`);
            return data;
        } catch (error) {
            throw new Error(`Failed to load thread: ${error.message}`);
        }
    }

    static async postReply(threadId, content) {
        try {
            await API.post('/threads/reply', {
                threadId,
                content
            });
            
            alert('Reply posted successfully!');
            window.location.reload();
        } catch (error) {
            alert(`Error posting reply: ${error.message}`);
        }
    }
}

// Tournament utilities
class TournamentManager {
    static async createTournament(tournamentData) {
        try {
            const data = await API.post('/tournament/create', tournamentData);
            alert('Tournament created successfully!');
            return data.tournament;
        } catch (error) {
            alert(`Error creating tournament: ${error.message}`);
        }
    }

    static async joinTournament(tournamentId) {
        try {
            const data = await API.post('/tournament/join', { tournament_id: tournamentId });
            alert('Successfully joined tournament!');
            return data.participant;
        } catch (error) {
            alert(`Error joining tournament: ${error.message}`);
        }
    }

    static async loadFixtures(tournamentId, containerId) {
        try {
            const data = await API.get(`/tournament/fixtures?tournament_id=${tournamentId}`);
            const container = document.getElementById(containerId);
            
            if (data.fixtures && data.fixtures.length > 0) {
                container.innerHTML = data.fixtures.map(fixture => `
                    <div class="card">
                        <div class="fixture">
                            <strong>${fixture.team1_id} vs ${fixture.team2_id}</strong>
                            <span class="status ${fixture.status}">${fixture.status}</span>
                            ${fixture.score_team1 !== null ? 
                                `<div class="score">${fixture.score_team1} - ${fixture.score_team2}</div>` : 
                                ''
                            }
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="alert">No fixtures generated yet.</div>';
            }
        } catch (error) {
            document.getElementById(containerId).innerHTML = 
                `<div class="alert alert-error">Error loading fixtures: ${error.message}</div>`;
        }
    }
}

// Admin utilities
class AdminManager {
    static async loadUsers(containerId) {
        try {
            const data = await API.get('/admin/users');
            const container = document.getElementById(containerId);
            
            container.innerHTML = data.users.map(user => `
                <div class="card">
                    <h3>${user.username}</h3>
                    <p>Email: ${user.email}</p>
                    <p>Role: <span class="role ${user.role}">${user.role}</span></p>
                    ${user.role !== 'moderator' && user.role !== 'admin' ? 
                        `<button onclick="AdminManager.promoteToModerator('${user.id}')" class="btn btn-success">
                            Make Moderator
                        </button>` : 
                        ''
                    }
                </div>
            `).join('');
        } catch (error) {
            document.getElementById(containerId).innerHTML = 
                `<div class="alert alert-error">Error loading users: ${error.message}</div>`;
        }
    }

    static async promoteToModerator(userId) {
        try {
            await API.post('/admin/add-moderator', { user_id: userId });
            alert('User promoted to moderator successfully!');
            this.loadUsers('usersContainer');
        } catch (error) {
            alert(`Error promoting user: ${error.message}`);
        }
    }

    static async awardBadge(userId, tournamentId, badgeName) {
        try {
            await API.post('/admin/award-badge', {
                user_id: userId,
                tournament_id: tournamentId,
                badge_name: badgeName
            });
            alert('Badge awarded successfully!');
        } catch (error) {
            alert(`Error awarding badge: ${error.message}`);
        }
    }
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication for protected pages
    const protectedPages = ['/dashboard.html', '/profile/', '/forums/create-thread.html', '/admin/'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.some(page => currentPath.includes(page))) {
        if (!Auth.checkAuth()) return;
    }

    // Check admin access for admin pages
    if (currentPath.includes('/admin/')) {
        if (!Auth.checkAdmin()) return;
    }

    // Update UI based on authentication
    updateAuthUI();
});

function updateAuthUI() {
    const user = Auth.getUser();
    const authElements = document.querySelectorAll('.auth-only');
    const guestElements = document.querySelectorAll('.guest-only');
    const adminElements = document.querySelectorAll('.admin-only');

    if (Auth.isAuthenticated()) {
        authElements.forEach(el => el.style.display = 'block');
        guestElements.forEach(el => el.style.display = 'none');
        
        if (Auth.isAdmin()) {
            adminElements.forEach(el => el.style.display = 'block');
        } else {
            adminElements.forEach(el => el.style.display = 'none');
        }

        // Update user info in navbar
        const userInfoElements = document.querySelectorAll('.user-info');
        userInfoElements.forEach(el => {
            el.textContent = user.username;
        });
    } else {
        authElements.forEach(el => el.style.display = 'none');
        guestElements.forEach(el => el.style.display = 'block');
        adminElements.forEach(el => el.style.display = 'none');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}