// API Base URL - direct function calls
const API_BASE = '/.netlify/functions';

// Auth utilities (keep the same)
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

    static isModerator() {
        const user = this.getUser();
        return user && (user.role === 'moderator' || user.role === 'admin');
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

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    }
}

// API utilities - SIMPLIFIED
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
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
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

    // =======================
    // AUTH ENDPOINTS
    // =======================

    static async login(credentials) {
        return this.post('/login', credentials);
    }

    static async signup(userData) {
        return this.post('/signup', userData);
    }

    // =======================
    // ADMIN ENDPOINTS
    // =======================

    static async getUsers() {
        return this.get('/users');
    }

    static async addModerator(userId) {
        return this.post('/add-moderator', { user_id: userId });
    }

    static async awardBadge(userId, tournamentId, badgeName) {
        return this.post('/award-badge', {
            user_id: userId,
            tournament_id: tournamentId,
            badge_name: badgeName
        });
    }

    // =======================
    // FORUM ENDPOINTS
    // =======================

    static async getForumThreads(forumSlug) {
        if (forumSlug === 'fifa14') {
            return this.get('/fifa14-threads');
        } else if (forumSlug === 'others') {
            return this.get('/others-threads');
        } else {
            return this.get('/threads');
        }
    }

    static async createThread(threadData) {
        if (threadData.forum_slug === 'others') {
            return this.post('/others-create-thread', threadData);
        } else {
            return this.post('/create-thread', threadData);
        }
    }

    static async getThread(threadId) {
        return this.get(`/get-thread?threadId=${threadId}`);
    }

    static async postReply(replyData) {
        return this.post('/thread-reply', replyData);
    }

    // =======================
    // TOURNAMENT ENDPOINTS
    // =======================

    static async createTournament(tournamentData) {
        return this.post('/create', tournamentData);
    }

    static async joinTournament(tournamentId) {
        return this.post('/join', { tournament_id: tournamentId });
    }

    static async getFixtures(tournamentId) {
        return this.get(`/fixtures?tournament_id=${tournamentId}`);
    }

    static async getTournaments() {
        return this.get('/threads'); // Note: You might want to create a dedicated function
    }

    // =======================
    // SOCIAL ENDPOINTS
    // =======================

    static async followUser(userId) {
        return this.post('/follow', { followUserId: userId });
    }

    static async unfollowUser(userId) {
        return this.post('/unfollow-user', { unfollowUserId: userId });
    }

    static async followForum(forumId) {
        return this.post('/forum', { forumId });
    }

    static async unfollowForum(forumId) {
        return this.post('/unfollow-forum', { forumId });
    }

    // =======================
    // TEST ENDPOINT
    // =======================

    static async test() {
        return this.get('/test');
    }
}

// The rest of your utilities remain the same...
class ForumManager {
    static async loadThreads(forumSlug, containerId) {
        try {
            const data = await API.getForumThreads(forumSlug);
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
                            ${thread.reply_count || 0} replies
                            ${thread.tags && thread.tags.length > 0 ? 
                                `• ${thread.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}` : 
                                ''
                            }
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
            const data = await API.createThread({
                ...threadData,
                forum_slug: forumSlug
            });
            
            alert('Thread created successfully!');
            window.location.href = `/forums/${forumSlug}.html`;
            return data;
        } catch (error) {
            alert(`Error creating thread: ${error.message}`);
            throw error;
        }
    }

    static async loadThread(threadId) {
        try {
            const data = await API.getThread(threadId);
            return data;
        } catch (error) {
            throw new Error(`Failed to load thread: ${error.message}`);
        }
    }

    static async postReply(threadId, content) {
        try {
            const data = await API.postReply({
                threadId,
                content
            });
            
            alert('Reply posted successfully!');
            return data;
        } catch (error) {
            alert(`Error posting reply: ${error.message}`);
            throw error;
        }
    }
}

// TournamentManager, AdminManager, SocialManager remain the same...
class TournamentManager {
    static async createTournament(tournamentData) {
        try {
            const data = await API.createTournament(tournamentData);
            alert('Tournament created successfully!');
            return data.tournament;
        } catch (error) {
            alert(`Error creating tournament: ${error.message}`);
            throw error;
        }
    }

    static async joinTournament(tournamentId) {
        try {
            const data = await API.joinTournament(tournamentId);
            alert('Successfully joined tournament!');
            return data.participant;
        } catch (error) {
            alert(`Error joining tournament: ${error.message}`);
            throw error;
        }
    }

    static async loadFixtures(tournamentId, containerId) {
        try {
            const data = await API.getFixtures(tournamentId);
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

    static async loadTournaments(containerId) {
        try {
            const data = await API.getTournaments();
            const container = document.getElementById(containerId);
            
            if (data.tournaments && data.tournaments.length > 0) {
                container.innerHTML = data.tournaments.map(tournament => `
                    <div class="card tournament-card">
                        <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                            <h3 style="margin: 0; flex: 1;">${tournament.name}</h3>
                            <span class="tournament-status status-${tournament.status}">
                                ${tournament.status}
                            </span>
                        </div>
                        
                        <div style="color: var(--text-light); margin-bottom: 1rem;">
                            <strong>Game:</strong> ${tournament.game_version}<br>
                            <strong>Teams:</strong> ${tournament.current_teams}/${tournament.max_teams}<br>
                            <strong>Creator:</strong> ${tournament.creator}
                        </div>
                        
                        <p style="margin-bottom: 1.5rem; font-size: 0.9rem;">
                            ${tournament.description}
                        </p>
                        
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <a href="/tournaments/join.html?id=${tournament.id}" class="btn btn-primary" style="flex: 1;">
                                ${tournament.status === 'pending' ? 'Join Tournament' : 'View Details'}
                            </a>
                            <a href="/tournaments/fixtures.html?id=${tournament.id}" class="btn btn-outline">
                                Fixtures
                            </a>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="alert">No tournaments found.</div>';
            }
        } catch (error) {
            document.getElementById(containerId).innerHTML = 
                `<div class="alert alert-error">Error loading tournaments: ${error.message}</div>`;
        }
    }
}

// Initialize app on page load (keep the same)
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication for protected pages
    const protectedPages = ['/dashboard.html', '/profile/', '/forums/create-thread.html', '/admin/', '/tournaments/create.html'];
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

    // Add logout handler
    const logoutButtons = document.querySelectorAll('[onclick="logout()"]');
    logoutButtons.forEach(button => {
        button.onclick = Auth.logout;
    });
});

function updateAuthUI() {
    const user = Auth.getUser();
    const authElements = document.querySelectorAll('.auth-only');
    const guestElements = document.querySelectorAll('.guest-only');
    const adminElements = document.querySelectorAll('.admin-only');
    const moderatorElements = document.querySelectorAll('.moderator-only');

    if (Auth.isAuthenticated()) {
        authElements.forEach(el => el.style.display = 'block');
        guestElements.forEach(el => el.style.display = 'none');
        
        if (Auth.isAdmin()) {
            adminElements.forEach(el => el.style.display = 'block');
            moderatorElements.forEach(el => el.style.display = 'block');
        } else if (Auth.isModerator()) {
            adminElements.forEach(el => el.style.display = 'none');
            moderatorElements.forEach(el => el.style.display = 'block');
        } else {
            adminElements.forEach(el => el.style.display = 'none');
            moderatorElements.forEach(el => el.style.display = 'none');
        }

        // Update user info in navbar
        const userInfoElements = document.querySelectorAll('.user-info');
        userInfoElements.forEach(el => {
            if (user) {
                el.textContent = user.username;
                el.title = `Role: ${user.role}`;
            }
        });
    } else {
        authElements.forEach(el => el.style.display = 'none');
        guestElements.forEach(el => el.style.display = 'block');
        adminElements.forEach(el => el.style.display = 'none');
        moderatorElements.forEach(el => el.style.display = 'none');
    }
}

// Global logout function
function logout() {
    Auth.logout();
}

// Test API connection
async function testAPI() {
    try {
        const data = await API.test();
        console.log('API test successful:', data);
        return data;
    } catch (error) {
        console.error('API test failed:', error);
        throw error;
    }
}
