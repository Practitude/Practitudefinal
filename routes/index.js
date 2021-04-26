const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
// Welcome Page
router.get('/', (req, res) => res.render('welcome'));
module.exports = router;

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    name: req.user.name
  })
);
