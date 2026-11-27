var express = require('express');
var router = express.Router();
var db = require('../db');
var bcrypt = require('bcrypt');
var multer = require('multer');
var path = require('path');

const storage = multer.diskStorage({
  destination: './public/images/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.redirect('/dashboard');
}

router.get('/', isAdmin, (req, res) => {
  db.all(`SELECT users.*, groups.name as group_name FROM users LEFT JOIN groups ON users.group_id = groups.id`, [], (err, users) => {
    res.render('users/list', { users });
  });
});

router.get('/create', isAdmin, (req, res) => {
  db.all(`SELECT * FROM groups`, [], (err, groups) => {
    res.render('users/create', { groups });
  });
});

router.post('/create', isAdmin, upload.single('photo'), async (req, res) => {
  const { username, password, role, group_id } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const photo = req.file ? '/images/uploads/' + req.file.filename : null;

  db.run(`INSERT INTO users (username, password, role, photo, group_id) VALUES (?, ?, ?, ?, ?)`,
    [username, hashedPassword, role, photo, group_id || null],
    (err) => {
      res.redirect('/users');
    }
  );
});

router.get('/delete/:id', isAdmin, (req, res) => {
  db.run(`DELETE FROM users WHERE id = ?`, [req.params.id], (err) => {
    res.redirect('/users');
  });
});

module.exports = router;