const express = require('express');
const router = express.Router();
const { User } = require('../models');
// CODIGO MUERTO: se reemplaza con routes/auth.js
// =============================
// API: CREAR ADMIN (para testers)
// POST /admin/api/create
// =============================
router.post('/admin/api/create', async (req, res) => {
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
