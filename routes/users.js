var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/productHelpers');


/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProduct().then((products)=>{
    res.render('users/user-home',{products})
  })  
});

router.get('/login',(req,res)=>{
  res.render('users/login')
})

module.exports = router;
