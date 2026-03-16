const jwt = require('jsonwebtoken');
const { User } = require('../models');

const optionalAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return next();
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findByPk(payload.id);
    if (user) req.user = { id: user.id, email: user.email };
  } catch (e) {
    // ignore invalid token
  }
  return next();
};

const authRequired = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { id: user.id, email: user.email };
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { optionalAuth, authRequired };
