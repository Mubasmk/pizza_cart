var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/productHelpers');


/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProduct().then((products)=>{
    res.render('users/user-home',{products})
  })  
});

module.exports = router;
