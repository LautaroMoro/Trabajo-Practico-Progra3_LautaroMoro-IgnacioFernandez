module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) return next();
    req.flash('error', 'Debe iniciar sesión para acceder');
    return res.redirect('/admin/login');
  },
  forwardAuthenticated: (req, res, next) => {
    if (!req.session || !req.session.user) return next();
    return res.redirect('/admin/dashboard');
  }
};
