/**
 * dashboard.js
 * Logique de la page Dashboard — JMB_TaskManager
 */

import { authAPI, tasksAPI } from './api.js';
import { requireAuth, logout } from './ui.js';

// Auth guard 
await requireAuth();

// DOM refs 
const colSemaine = document.getElementById('colSemaine');
const colUrgent = document.getElementById('colUrgent');
const colAujourdhui = document.getElementById('colAujourdhui');

// Colors for prios
const PRIORITY_CONFIG = {
  low: { color: 'bg-emerald-500', label: 'Basse' },
  medium: { color: 'bg-amber-400', label: 'Moyenne' },
  high: { color: 'bg-orange-500', label: 'Haute' },
  urgent: { color: 'bg-red-600', label: 'Urgente' },
};

/**
 * Priority visual indicator.
 * @param {string} priority
 * @returns {HTMLElement}
 */
const createPriorityIndicator = (priority) => {
  const { color, label } = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;

  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-center gap-1.5';
  wrapper.title = `Priority: ${label}`;
  wrapper.innerHTML = `<span class="h-4 w-4 rounded-full ${color}" aria-hidden="true"></span>`;
  return wrapper;
};

// Task card 

/**
 * Create a task card for the dashboard
 * @param {Object} task
 * @returns {HTMLElement}
 */
const createTaskCard = (task) => {
  const card = document.createElement('div');
  card.className =
    'cursor-pointer bg-bg border-2 border-border rounded p-3 transition-all ' +
    'hover:border-primary hover:shadow-lg flex items-center justify-between gap-2';
  card.addEventListener('click', () => navigateToEdit(task.id));

  // Left priorité + titre
  const leftPart = document.createElement('div');
  leftPart.className = 'flex items-center gap-3 truncate';
  leftPart.appendChild(createPriorityIndicator(task.priority));

  const title = document.createElement('span');
  title.className = `font-mono text-sm ${task.is_done ? 'line-through text-slate-500' : 'text-text'}`;
  title.textContent = task.title;
  leftPart.appendChild(title);

  // Right — tag optionnel
  const rightPart = document.createElement('div');
  rightPart.className = 'flex items-center gap-2 flex-shrink-0 text-xs';

  if (task.tag) {
    const tag = document.createElement('span');
    tag.className = 'px-2 py-0.5 font-mono bg-slate-800 text-white rounded border border-border';
    tag.textContent = task.tag;
    rightPart.appendChild(tag);
  }

  card.appendChild(leftPart);
  card.appendChild(rightPart);
  return card;
};

// Column renderer 

/**
 * Replacing column content with the task list
 * @param {HTMLElement} colEl
 * @param {Object[]} tasks
 */
const renderColumn = (colEl, tasks) => {
  colEl.innerHTML = '';

  if (!tasks.length) {
    colEl.innerHTML =
      '<div class="text-center py-6 text-slate-500 text-sm border-2 border-dashed border-border rounded">Aucune task()</div>';
    return;
  }

  tasks.forEach((task) => colEl.appendChild(createTaskCard(task)));
};

// Navigation helpers 

/**
 * Redirection to task page and opening the modification modal with the same cat
 * @param {string} category
 */
export const openTaskModal = (category) => {
  window.location.href = `/tasks?new=true&cat=${category}`; //un href dynamique via la catégorie
};

/**
 * Redirige vers la page tasks en ouvrant le modal d'édition pour une tâche.
 * @param {number|string} id
 */
export const navigateToEdit = (id) => {
  window.location.href = `/tasks?edit=${id}`;//redirection via url et id de l'objet
};

// Exposer pour les onclick inline dans le HTML
window.openTaskModal = openTaskModal;
window.navigateToEdit = navigateToEdit;

// Load dashboard 

/**
 * Updating dashboard with user and task infos.
 */
const loadDashboard = async () => {
  const { ok: meOk, data: me } = await authAPI.me();//route de vérification du status login de l'user
  if (meOk) {
    document.getElementById('welcomeMsg').textContent = `user@jmb: ${me.username}`;
  }

  const { ok, data: tasks } = await tasksAPI.getAll(); //Récupération de toutes les task en lien avec user et mise en forme qui en suit 
  if (!ok) return;

  document.getElementById('statTotal').textContent = tasks.length;
  document.getElementById('statDone').textContent = tasks.filter((t) => t.is_done).length;
  document.getElementById('statPending').textContent = tasks.filter((t) => !t.is_done).length;
  document.getElementById('statUrgent').textContent =
    tasks.filter((t) => t.category === 'urgent' && !t.is_done).length;

  renderColumn(colSemaine, tasks.filter((t) => t.category === 'semaine')); //cat week
  renderColumn(colUrgent, tasks.filter((t) => t.category === 'urgent'));//cat urgent
  renderColumn(colAujourdhui, tasks.filter((t) => t.category === 'aujourd_hui'));//cat today
};

// Events 
document.getElementById('logoutBtn').addEventListener('click', async () => { await logout() });//Logout button
document.getElementById('fabBtn').addEventListener('click', () => {
  window.location.href = '/tasks';//Floating action button, inspi de google
});

// Init 
loadDashboard();
