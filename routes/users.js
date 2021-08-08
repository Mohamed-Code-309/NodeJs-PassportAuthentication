const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const passport = require('passport'); //19

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register
router.get('/register', (req, res) => res.render('register'));


// Register Handle
router.post('/register', (req, res) => {

    const { name, email, password, password2 } = req.body;

    //do validations before submit
    let errors = [];  
    //1.check required fields
    if(!name || !email || !password || !password2){
        errors.push({ msg: 'Please fill in all fields'})
    }
    //2.Check Password Match
    if(password !== password2){
        errors.push({ msg: 'Passwords do not match'})
    }

    //3.Check Password length
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    //check for errors
    if(errors.length > 0){
        //re-render the registeration form
        res.render('register', {
            errors,
            name, email, password, password2 
        })
    } else {
        //validation passed
        //add user to Mongodb 
        User.findOne({email : email})
            .then( user => {
                if(user){
                    //add new error and re-render the page
                    errors.push({msg: "Email is already exist"})
                    res.render('register', {
                        errors,
                        name, email, password, password2 
                    })
                }
                else{
                    //add new user (new instance will not added to the database)
                    const newUser = new User({
                        name : name, email: email, password: password
                    })

                    //console.log('new user', newUser)                
                    //Hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            //Set Password to Hash
                            newUser.password = hash;
                            newUser.save()
                                .then(user => { //redirect the user to login page if it is saved
                                   req.flash('success_msg', 'You are now registered and can log in') 
                                   res.redirect('/users/login') 
                                })  
                                .catch(err => console.log(err))
                        })
                    })
                }
            });
    }

})

//19- Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

//20-Logout
router.get('/logout', (req, res) => {
    req.logOut(); //in passport middleware
    req.flash("success_msg", "You are logged out")
    res.redirect('/users/login')
})



module.exports = router;
