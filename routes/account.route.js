const express = require('express');
const router = express.Router();
const accountModel = require('../models/account.model');


/* GET login page. */
router.get('/login', function(req, res) {
  res.render('vwAccount/login', { layout:false});
});

/* GET register page. */
router.get('/register', function(req, res) {
  res.render('vwAccount/register', { layout:false});
});

route.get('/is-available', async function(req,res){
    const email = req.query.email;
    const user = await accountModel.singleByEmail(email);
    if(!user)
     return res.json(true);
    return res.json(false);
});



module.exports = router;
