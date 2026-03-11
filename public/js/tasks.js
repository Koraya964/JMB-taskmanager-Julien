/**
 * tasks.js
 * Logique de la page Tasks — JMB_TaskManager
 */

import { tasksAPI } from './api.js';
import { esc, CAT_LABEL, showAlert, requireAuth, logout } from './ui.js';

// Auth guard 
requireAuth();

// State 
let editingId = null;

// DOM refs 
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const filterCat = document.getElementById('filterCategory');
const filterStatus = document.getElementById('filterStatus');
const taskModal = document.getElementById('taskModal');
const modalInner = taskModal.querySelector('div');
const modalTitle = document.getElementById('modalTitle');
const mTitle = document.getElementById('mTitle');
const mDesc = document.getElementById('mDesc');
const mPriority = document.getElementById('mPriority');
const mTag = document.getElementById('mTag');
const mCategory = document.getElementById('mCategory');
const modalAlert = document.getElementById('modalAlert');
const saveBtn = document.getElementById('saveBtn');

// Priority indicator 
const PRIORITY_CONFIG = {
  low: { color: 'bg-emerald-500', label: 'low' },
  medium: { color: 'bg-amber-400', label: 'medium' },
  high: { color: 'bg-orange-500', label: 'high' },
  urgent: { color: 'bg-red-600', label: 'urgent' },
};

/**
 * Crée un indicateur de priorité avec pastille + label texte.
 * @param {string} priority
 * @returns {HTMLElement}
 */
const createPriorityIndicator = (priority) => {
  const { color, label } = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;

  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-center gap-1.5 font-mono';
  wrapper.title = `Priority: ${label}`;
  wrapper.innerHTML = `
    <span class="h-4 w-4 rounded-full ${color}" aria-hidden="true"></span>
    <span class="text-sm text-black">${label}</span>
  `;
  return wrapper;
};

// Render 

/**
 * Charge les tâches en appliquant les filtres actifs puis les rend.
 */
const loadTasks = async () => {
  const { ok, data } = await tasksAPI.getAll({
    category: filterCat.value,
    is_done: filterStatus.value,
  });
  if (!ok) return;
  renderTasks(data);
};

/**
 * Construit la liste de tâches dans le DOM.
 * @param {Object[]} tasks
 */
const renderTasks = (tasks) => {
  taskCount.textContent = `[ ${tasks.length} task(s) ]`;
  taskList.innerHTML = '';

  if (!tasks.length) {
    taskList.innerHTML = `
      <div class="text-center py-12 text-slate-500 border-2 border-dashed border-border rounded bg-card font-mono">
        null
      </div>`;
    return;
  }

  tasks.forEach((t) => {
    const taskEl = document.createElement('div');
    taskEl.className =
      'flex gap-4 items-start bg-card p-5 rounded border-2 border-border ' +
      'transition-all hover:border-primary';

    taskEl.innerHTML = `
      <button
        class="mt-1 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded border-2
                ${t.is_done ? 'bg-emerald-500 border-emerald-500' : 'border-border hover:border-primary'}"
        aria-label="${t.is_done ? 'Mark as undone' : 'Mark as done'}">
        ${t.is_done
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white"
                  stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                polyline points="20 6 9 17 4 12"/>
              </svg>`
        : ''}
      </button>

      <div class="flex-grow">
        <div class="flex flex-wrap items-start justify-between gap-3 mb-2">
          <span class="font-mono font-semibold text-text ${t.is_done ? 'line-through text-slate-500' : ''}">
            ${esc(t.title)}
          </span>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono" id="task-meta-${t.id}">
            ${t.tag ? `<span class="px-2 py-0.5 bg-slate-800 text-white rounded border border-border">${esc(t.tag)}</span>` : ''}
            <span class="font-bold text-primary">${CAT_LABEL[t.category] ?? t.category}</span>
          </div>
        </div>
        ${t.description ? `<p class="text-sm text-black mb-4 font-mono">${esc(t.description)}</p>` : ''}
        <div class="flex justify-end gap-3 font-mono">
          <button class="edit-btn text-xs text-primary hover:text-white" data-id="${t.id}">edit</button>
          <button class="del-btn  text-xs text-red-500 hover:text-red-900" data-id="${t.id}">del</button>
        </div>
      </div>
    `;

    // Priority indicator
    taskEl.querySelector(`#task-meta-${t.id}`).prepend(createPriorityIndicator(t.priority));

    // Toggle done
    taskEl.querySelector('button[aria-label]').addEventListener('click', () => toggleTask(t.id));

    // Edit / delete (event delegation via data-id)
    taskEl.querySelector('.edit-btn').addEventListener('click', () => editTask(t.id));
    taskEl.querySelector('.del-btn').addEventListener('click', () => deleteTask(t.id));

    taskList.appendChild(taskEl);
  });
};

// Modal helpers

/**
 * Ouvre la modal en mode création ou édition.
 * @param {Object|null} task  — null pour créer, objet tâche pour éditer
 */
const openModal = (task = null) => {
  editingId = task?.id ?? null;
  modalTitle.textContent = task ? `task_edit(${task.id})` : 'task_new()';
  mTitle.value = task?.title ?? '';
  mDesc.value = task?.description ?? '';
  mPriority.value = task?.priority ?? 'medium';
  mTag.value = task?.tag ?? '';
  mCategory.value = task?.category ?? 'semaine';

  modalAlert.classList.add('hidden');
  taskModal.classList.remove('opacity-0', 'pointer-events-none');
  modalInner.classList.remove('scale-95');
  requestAnimationFrame(() => mTitle.focus());
};

/**
 * Ferme la modal et nettoie l'URL.
 */
const closeModal = () => {
  taskModal.classList.add('opacity-0', 'pointer-events-none');
  modalInner.classList.add('scale-95');
  editingId = null;

  const url = new URL(window.location.href);
  url.searchParams.delete('edit');
  url.searchParams.delete('new');
  url.searchParams.delete('cat');
  window.history.replaceState({}, '', url);
};

// CRUD 

/**
 * Sauvegarde la tâche en cours (création ou édition).
 */
const saveTask = async () => {
  const title = mTitle.value.trim();
  if (!title) {
    showAlert(modalAlert, 'Le Titre ne peut pas être vide.');
    return;
  }

  const body = {
    title,
    description: mDesc.value.trim(),
    priority: mPriority.value,
    tag: mTag.value.trim(),
    category: mCategory.value,
  };

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  const { ok, data } = editingId
    ? await tasksAPI.update(editingId, body)
    : await tasksAPI.create(body);

  saveBtn.disabled = false;
  saveBtn.textContent = 'Save';

  if (!ok) {
    showAlert(modalAlert, data?.error ?? "Une erreur s'est produite .");
    return;
  }

  closeModal();
  loadTasks();
};

/**
 * Ouvre la modal d'édition pour une tâche donnée.
 * @param {number|string} id
 */
const editTask = async (id) => {
  const { ok, data } = await tasksAPI.getOne(id);
  if (ok) openModal(data);
};

/**
 * Bascule l'état is_done/undone d'une tâche.
 * @param {number|string} id
 */
const toggleTask = async (id) => {
  await tasksAPI.toggle(id);
  loadTasks();
};

/**
 * Supprime une tâche après confirmation.
 * @param {number|string} id
 */
const deleteTask = async (id) => {
  if (!confirm('Vous êtes sur de vouloir effacer cette tâche ?')) return;
  await tasksAPI.delete(id);
  loadTasks();
};

// URL parameter handler

/**
 * Lit les query params à l'init pour ouvrir directement création / édition.
 */
const handleUrlParams = async () => {
  const params = new URLSearchParams(window.location.search);
  const taskIdToEdit = params.get('edit');
  const isNew = params.get('new') === 'true';
  const cat = params.get('cat');

  if (taskIdToEdit) {
    await editTask(taskIdToEdit);
  } else if (isNew) {
    openModal();
    if (cat) mCategory.value = cat;
  }
};

// Events 
document.getElementById('addBtn').addEventListener('click', () => openModal());
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('logoutBtn').addEventListener('click', logout);
saveBtn.addEventListener('click', saveTask);
filterCat.addEventListener('change', loadTasks);
filterStatus.addEventListener('change', loadTasks);

// Fermeture modal au clic sur l'overlay
taskModal.addEventListener('click', (e) => {
  if (e.target === taskModal) closeModal();
});

// Raccourcis clavier
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveTask();
});

// Init 
loadTasks();
handleUrlParams();
