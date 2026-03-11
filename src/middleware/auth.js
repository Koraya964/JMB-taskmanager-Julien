import jwt from 'jsonwebtoken';


// Middleware JWT — vérifie le token dans le cookie ou le header Authorization.

const authMiddleware = (req, res, next) => {
  const token =
    req.cookies?.token ??
    req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); //verif du tokken avec le secret 
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

export default authMiddleware;
