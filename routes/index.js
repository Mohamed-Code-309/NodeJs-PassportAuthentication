const express = require('express');
const router = express.Router();
const { enusreAuthenticated } = require('../config/auth')

// Welcome Page
router.get('/', (req, res) => {
    //res.send('welcome')
    res.render('welcome') 
});

//display the user name
router.get('/dashboard', enusreAuthenticated, (req, res) => res.render('dashboard', {
    name: req.user.name
})); 


module.exports = router;
