const express = require('express');
const router = express.Router();
const { User } = require('../models');
const auth = require('../middleware/auth');

// =============================
// LOGIN VIEW
// =============================
router.get('/login', auth.forwardAuthenticated, (req, res) => {
  res.render('login', { 
    appName: 'AutoServicio - Admin', 
    students: 'Alumnos: Nombre Apellido'
  });
});

// =============================
// LOGIN POST
// =============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', 'Completar email y contraseña');
    return res.redirect('/admin/login');
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      req.flash('error', 'Usuario o contraseña inválidos');
      return res.redirect('/admin/login');
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      req.flash('error', 'Usuario o contraseña inválidos');
      return res.redirect('/admin/login');
    }

    // Guardar sesión (sin password)
    req.session.user = { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    };

    req.flash('success', 'Bienvenido ' + user.name);
    return res.redirect('/admin/dashboard');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Error del servidor');
    return res.redirect('/admin/login');
  }
});

// =============================
// DASHBOARD VIEW
// =============================
router.get('/dashboard', auth.ensureAuthenticated, async (req, res) => {
  res.render('dashboard', { 
    appName: 'AutoServicio - Admin',
    user: req.session.user
  });
});

// =============================
// LOGOUT
// =============================
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// =============================
// API: CREAR ADMIN (para testers)
// POST /admin/api/create
// =============================
router.post('/api/create', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Faltan campos' });

  try {
    const exists = await User.findOne({ where: { email } });

    if (exists)
      return res.status(409).json({ error: 'Usuario ya existe' });

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: 'admin' 
    });

    return res.status(201).json({
      message: 'Admin creado',
      id: user.id,
      email: user.email
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
