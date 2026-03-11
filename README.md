# JMB Task Manager

> Mini Gestionnaire de Tâches Sécurisé
> Travail en groupe de 3 · Durée : 3 jours

---

## Stack technique

| Couche          | Technologie                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| Runtime         | Node.js ≥ 20 (ES modules natifs)                                                   |
| Serveur         | Express 5                                                                          |
| Base de données | MySQL 8 (mysql2/promise)                                                           |
| Auth            | JWT (jsonwebtoken) + Argon2                                                        |
| Sécurité        | Helmet, CORS, cookie httpOnly, express-session                                     |
| Front-end       | HTML5 sémantique, CSS3 (custom properties) et TailwindCSS, Vanilla JS ES6+ modules |

---

## Installation

### 1 — Prérequis

- **Node.js ≥ 20**
- **MySQL 8+**

### 2 — Cloner

```bash
git clone https://github.com/Koraya964/JMB-taskmanager.git
cd jmb-taskmanager
```

### 3 — Dépendances

```bash
npm install
```

### 4 — Configuration

```bash
cp .env
```

Éditez `.env` :

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=jmb_taskmanager
JWT_SECRET=un truc super secret ici woah
SESSION_SECRET=et la même chose que plus haut
NODE_ENV=development
```

### 5 — Base de données

```bash
mysql -u root -p < db/schema.sql
```

### 6 — Lancer

```bash
# Production
npm start

# Développement (rechargement auto, Node ≥ 18)
npm run dev
```

Application disponible sur → **http://localhost:3000**

---

## Structure du projet

```
jmb-taskmanager/
├── server.js                         # Point d'entrée (ES module)
├── package.json
├── .env
├── .gitignore
│
├── db/
│   └── schema.sql                    # Tables users + tasks
│
├── src/
│   ├── models/
│   │   └── db.js                     # Pool MySQL2
│   ├── middleware/
│   │   └── auth.js                   # Vérification JWT (pour la sécu des routes)
│   ├── controllers/
│   │   ├── authController.js         # register / login / logout / me
│   │   └── taskController.js         # CRUD tâches + toggle + filtres
│   └── routes/
│       ├── authRoutes.js             # POST /api/auth/*
│       └── taskRoutes.js             # /api/tasks/* (protégées JWT via le authMiddleware)
│
└── public/
    ├── css/
    │   └── app.css                   # Design system complet (variables CSS)(pas présent ici car aucune surcouche de css utilisé)
    ├── js/
    │   ├── api.js                    # Couche fetch ES6+ module
    │   ├── ui.js                     # Helpers UI partagés
    |   ├── dashboard.js              # Loading des task par catégorie avec les interractions
    |   ├── register.js               # Handle du register avec son dynamique
    |   ├── tasks.js                  # Logique fontend et gestion des erreurs pour les tasks
    |   └── login.js                  # Gestion de la connection et création du token
    └── pages/
        ├── login.html                # Connexion (Figma maquette 1)
        ├── register.html             # Inscription (Figma maquette 2)
        ├── tasks.html                # Liste tâches + modal (Figma maquette 3 & 5)
        └── dashboard.html            # Vue 3 colonnes (Figma maquette 4)
```

---

## API REST

### Auth `/api/auth`

| Méthode | Route       | Corps                           | Description                |
| ------- | ----------- | ------------------------------- | -------------------------- |
| `POST`  | `/register` | `{ username, email, password }` | Créer un compte            |
| `POST`  | `/login`    | `{ email, password }`           | Se connecter               |
| `POST`  | `/logout`   | —                               | Se déconnecter             |
| `GET`   | `/me`       | —                               | Infos utilisateur connecté |

### Tâches `/api/tasks` _(JWT requis)_

| Méthode  | Route         | Description                                                 |
| -------- | ------------- | ----------------------------------------------------------- |
| `GET`    | `/`           | Lister (filtres : `category`, `priority`, `tag`, `is_done`) |
| `GET`    | `/:id`        | Détail d'une tâche                                          |
| `POST`   | `/`           | Créer une tâche                                             |
| `PUT`    | `/:id`        | Modifier une tâche                                          |
| `PATCH`  | `/:id/toggle` | Basculer terminée / non terminée                            |
| `DELETE` | `/:id`        | Supprimer                                                   |

---

## Schéma de données

```sql
users  (id, username, email, password_hash, created_at, updated_at)
tasks  (id, user_id, title, description, priority, tag, is_done, category, created_at, updated_at)

priority → ENUM('low', 'medium', 'high', 'urgent')
category → ENUM('semaine', 'urgent', 'aujourd_hui')
```

---

## Choix techniques

- **ES Modules** (`"type": "module"`) — syntaxe `import/export` native Node.js
- **Argon2** pour le hachage des mots de passe (recommandation OWASP 2024)
- **JWT httpOnly cookie** — évite les attaques XSS sur le token
- **mysql2/promise** — pool de connexions, API async/await native
- **CSS Custom Properties** — design system cohérent sans framework CSS
- **Vanilla JS modules** — zéro dépendance front-end, bundle-free
