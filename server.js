import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rateLimit from 'express-rate-limit'

import authRoutes from './src/routes/authRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 3000;

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL ?? `http://localhost:${PORT}`,
  credentials: true,
}));

// Rate limiter pour éviter les attaques DDOS (15 minutes de timeout après 100 requete par la même ip adress)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET ?? 'pas_tres_secure',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Static files
app.use(express.static(join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

//Link page with routes
const page = (name) => (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');//Primordial si on ne veut pas que le replace soit dumb 
  res.sendFile(join(__dirname, 'public', 'pages', `${name}.html`));
}
app.get('/', page('login'));
app.get('/register', page('register'));
app.get('/dashboard', page('dashboard'));
app.get('/tasks', page('tasks'));

// 404
app.use((_, res) => res.status(404).json({ error: 'Route introuvable' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () =>
  console.log(`\n  JMB Task Manager → http://localhost:${PORT}\n`)
);
