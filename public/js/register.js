import { authAPI } from './api.js';

//Redirect si déjà connecté 
const { ok } = await authAPI.me();

if (ok) {
  window.location.href = '/dashboard'
}

// DOM refs 
const usernameEl = document.getElementById('username');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const confirmPasswordEl = document.getElementById('confirmPassword');
const registerBtn = document.getElementById('registerBtn');
const alertEl = document.getElementById('alert');

//Password visibility toggles

/**
 * Bascule la visibilité d'un champ password.
 * @param {HTMLInputElement} inputEl
 */
const toggleVisibility = (inputEl) => {
  inputEl.type = inputEl.type === 'password' ? 'text' : 'password';
};

document.getElementById('togglePassword').addEventListener('click', () => {
  toggleVisibility(passwordEl);
});

document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
  toggleVisibility(confirmPasswordEl);
});

//Alert helper

/**
 * Affiche un message d'alerte dans le bloc dédié.
 * @param {string} message
 * @param {'error'|'success'} type
 */
const displayAlert = (message, type = 'error') => {
  alertEl.textContent = `> ${message}`;
  alertEl.className = 'mb-6 p-4 rounded text-sm font-mono';

  if (type === 'error') {
    alertEl.classList.add('bg-red-950', 'text-red-200', 'border', 'border-red-800');
  } else {
    alertEl.classList.add('bg-emerald-950', 'text-emerald-200', 'border', 'border-emerald-800');
  }

  alertEl.classList.remove('hidden');
};

//Register handler

/**
 * Valide le formulaire et tente l'inscription.
 */
const handleRegister = async () => {
  const username = usernameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passwordEl.value;
  const confirmPassword = confirmPasswordEl.value;

  // Validation côté client
  if (!username || !email || !password || !confirmPassword) {
    displayAlert('Tous les champs sont requis.');
    return;
  }
  if (password.length < 6) {
    displayAlert('Password trop court (min 6).');
    return;
  }
  if (password !== confirmPassword) {
    displayAlert('Les mots de passe ne correspondent pas.');
    return;
  }

  registerBtn.disabled = true;
  registerBtn.textContent = 'Registering...';

  const { ok, data } = await authAPI.register({ username, email, password });

  if (!ok) {
    displayAlert(data?.error ?? "Erreur lors de l'inscription.");
    registerBtn.disabled = false;
    registerBtn.textContent = 'register()';
    return;
  }

  // localStorage.setItem('token', data.token);
  window.location.href = '/dashboard';
};

//Events
registerBtn.addEventListener('click', handleRegister);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleRegister();
});
