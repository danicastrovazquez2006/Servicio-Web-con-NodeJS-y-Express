var express = require('express');
var router = express.Router();
var db = require('../db');

router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const currentUser = req.session.user;

  db.all(`SELECT * FROM users WHERE group_id = ? AND id != ?`, [currentUser.group_id, currentUser.id], (err, groupUsers) => {
    db.all(`SELECT messages.*, sender.username as sender_name, receiver.username as receiver_name 
            FROM messages 
            JOIN users sender ON messages.sender_id = sender.id 
            JOIN users receiver ON messages.receiver_id = receiver.id 
            WHERE messages.sender_id = ? OR messages.receiver_id = ?`, 
            [currentUser.id, currentUser.id], (err, messages) => {
      res.render('messages/index', { groupUsers, messages, currentUser });
    });
  });
});

router.post('/send', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const sender_id = req.session.user.id;
  const { receiver_id, content } = req.body;

  db.get(`SELECT * FROM users WHERE id = ? AND group_id = ?`, [receiver_id, req.session.user.group_id], (err, receiver) => {
    if (!receiver) {
      return res.status(403).send("Error: Solo puedes enviar mensajes a usuarios de tu mismo grupo.");
    }

    db.run(`INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`,
      [sender_id, receiver_id, content],
      (err) => {
        res.redirect('/messages');
      }
    );
  });
});

module.exports = router;