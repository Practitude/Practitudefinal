const express = require('express');
const router = express.Router();
// Load User model
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');



// login Page
router.get('/login', (req, res) => res.render('login'));
// register Page
router.get('/register', (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
    const { name, email,roll,batch, password, password2 } = req.body;
    let errors = [];

    //check required fields
    if (!name || !email || !roll|| !batch || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
      }
      

    //check passwords match
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
      }

    //check pswd length
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
      }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            roll,
            batch,
            password,
            password2
          });
    }else {
        
      //validation passed
      User.findOne({email: email})
      .then(user => {
        if(user) {
          //user exists
          errors.push({ msg: 'email is already registered' });
          res.render('register', {
            errors,
            name,
            email,
            roll,
            batch,
            password,
            password2
          });
        } else{  
          const newUser = new User({
            name,
            email,   //.check("email","Email not valid").contains("jmit.ac.in"),
            roll,
            batch,
            password
          });
       
          
          //hash passwor
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              //set password to hashed
              newUser.password = hash;
              //save user
              newUser
                .save()
                .then(user => {
                  req.flash('success_msg', 'You are now registered and can log in');
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
          });

        }
      });
    }
  });

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;