const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos.' });
    }
    req.session.user = user;
    res.redirect('/dashboard');
  });
});

router.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user;

  db.get('SELECT name FROM groups WHERE id = ?', [user.group_id], (err, groupRow) => {
    const groupName = groupRow ? groupRow.name : 'Sin grupo asignado';

    db.get('SELECT COUNT(*) AS count FROM users', (err, uRow) => {
      db.get('SELECT COUNT(*) AS count FROM groups', (err, gRow) => {
        db.get(
          'SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? OR sender_id = ?',
          [user.id, user.id],
          (err, mRow) => {
            res.render('dashboard', {
              user,
              groupName,
              stats: {
                users: uRow ? uRow.count : 0,
                groups: gRow ? gRow.count : 0,
                messages: mRow ? mRow.count : 0
              }
            });
          }
        );
      });
    });
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;