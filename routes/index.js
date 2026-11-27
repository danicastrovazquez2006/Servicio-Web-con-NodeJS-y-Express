var express = require('express');
var router = express.Router();
var db = require('../db');
var bcrypt = require('bcrypt');

router.get('/', function(req, res) {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { title: 'Login' });
});

router.post('/login', function(req, res) {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.user = user;
      res.redirect('/dashboard');
    } else {
      res.render('login', { error: 'Usuario o contraseña incorrectos' });
    }
  });
});

router.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.render('dashboard', { user: req.session.user });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;