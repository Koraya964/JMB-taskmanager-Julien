/**
 * login.js
 * Logique de la page Login — JMB_TaskManager
 */

import { authAPI } from './api.js';

// Redirect si déjà connecté
const { ok } = await authAPI.me();

if (ok) {
  window.location.href = '/dashboard'
}

//DOM refs
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const alertEl = document.getElementById('alert');

// Alert helper
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

// Login handler

/**
 * Tente une authentification avec les valeurs du formulaire.
 */
const handleLogin = async () => {
  const email = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) {
    displayAlert('Email et mot de passe requis.');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Connection...';

  const { ok, data } = await authAPI.login({ email, password }); //envoie à l'api les input

  if (!ok) { //Données non valide on remonte l'erreur et on remet le bouton en login()
    displayAlert(data?.error ?? 'Identifiants invalides.');
    loginBtn.disabled = false;
    loginBtn.textContent = 'login()';
    return;
  }
  //Connexion ok, on set le token dans le local et on redirige vers le dashboard
  window.location.href = '/dashboard';
};

// Events loginBtn.addEventListener('click', handleLogin); (gestion de l'event avec la touche enter)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});
