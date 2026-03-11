import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import db from '../models/db.js';


//Options du cookies qui stock le JWT 
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 3600000,
};

// Durée de vie du JWT de 1h 
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

// POST /api/auth/register
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) //Comparateur pour vérifier si tout les champs sont remplis
    return res.status(400).json({ error: 'Tous les champs sont requis' });

  if (password.length < 12) //Comparateur de mot de passe length pour que le mot de passe soit bien à 12
    return res.status(400).json({ error: 'Mot de passe trop court (12 car. min.)' });

  try {
    const [existing] = await db.query( // Vérifie l'existing des index email ou username, pour ne pas avoir de doublons (sinon embêtant pour les task) 
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0) // Comparateur de l'existing si il est sup à 0 donc un doublon ça remonte un 409(conflit dans la demande)
      return res.status(409).json({ error: 'Identifiant déjà utilisé' });

    // Hash du mot de passe en argon et INSERT dans la bdd en requête prep
    const hash = await argon2.hash(password);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash]
    );

    const token = signToken({ id: result.insertId, username, email });
    res.cookie('token', token, COOKIE_OPTS);//Création du tokken avec les COOKIE_OPTS
    return res.status(201).json({ message: 'Compte créé' });//si Ok on fait une 201 (create)
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) //vérification si les champs sont remplies
    return res.status(400).json({ error: 'Email et mot de passe requis' });

  try { //try de la recherche emailDB et emailInput sinon 401(unauthorized)
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length)
      return res.status(401).json({ error: 'Identifiant incorrect' });
    //row[0] match on verify le password_hash avec l'input plaintext
    const user = rows[0];
    const valid = await argon2.verify(user.password_hash, password);
    if (!valid)
      return res.status(401).json({ error: 'Identifiant incorrect' }); //MDP incorrect

    const token = signToken({ id: user.id, username: user.username, email: user.email });
    res.cookie('token', token, COOKIE_OPTS); //login success (200) res de token avec ses OPTS
    return res.status(200).json({ message: 'Connexion réussie' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/auth/logout (un simple clear cookie)
export const logout = (_req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Déconnecté' });
};

// GET /api/auth/me vérification du status auth
export const me = (req, res) =>
  res.json({ id: req.user.id, username: req.user.username, email: req.user.email });
