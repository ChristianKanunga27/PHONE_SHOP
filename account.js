
 
    (function () {
      'use strict';

      function getCurrentUser() {
        try {
          return JSON.parse(localStorage.getItem('currentUser')) || null;
        } catch (err) {
          return null;
        }
      }

      function ensureLoggedIn() {
        const user = getCurrentUser();
        if (!user) {
          window.location.href = 'login.html';
          return false;
        }
        return true;
      }
 
      function renderUser(user) {
        const displayNameEl = document.getElementById('displayName');
        const displayEmailEl = document.getElementById('displayEmail');
        const avatarEl = document.getElementById('avatar');
        const welcomeEl = document.getElementById('welcome');
        const editNameEl = document.getElementById('editName');

        displayNameEl.textContent = user.name || 'User';
        displayEmailEl.textContent = user.email || '';
        avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
        welcomeEl.textContent = 'Welcome back, ' + (user.name || user.email) + '.';
        editNameEl.value = user.name || '';
      }

      function logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'home.html';
      }
 
      function saveDisplayName() {
        const input = document.getElementById('editName');
        const newName = input.value.trim();
        if (!newName) return;  
        const user = getCurrentUser();
        if (!user) return;

        user.name = newName;
        localStorage.setItem('currentUser', JSON.stringify(user));
 
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const index = users.findIndex(u => u.email === user.email);
          if (index > -1) {
            users[index].name = newName;
            localStorage.setItem('users', JSON.stringify(users));
          }
        } catch (err) {
          console.warn('Failed to update users list:', err);
        }
 
        document.getElementById('displayName').textContent = newName;
        const msg = document.getElementById('saveMsg');
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 2000);
      }
  
      if (ensureLoggedIn()) {
        const user = getCurrentUser();
        renderUser(user);

        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('saveName').addEventListener('click', saveDisplayName);
      }

    })();