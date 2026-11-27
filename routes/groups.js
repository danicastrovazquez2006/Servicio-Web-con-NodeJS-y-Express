var express = require('express');
var router = express.Router();
var db = require('../db');

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.redirect('/dashboard');
}

router.get('/', isAdmin, (req, res) => {
  db.all(`SELECT * FROM groups`, [], (err, groups) => {
    res.render('groups/list', { groups });
  });
});

router.post('/create', isAdmin, (req, res) => {
  const { name } = req.body;
  db.run(`INSERT INTO groups (name) VALUES (?)`, [name], (err) => {
    res.redirect('/groups');
  });
});

router.get('/delete/:id', isAdmin, (req, res) => {
  db.run(`DELETE FROM groups WHERE id = ?`, [req.params.id], (err) => {
    res.redirect('/groups');
  });
});

module.exports = router;