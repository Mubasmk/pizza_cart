var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/productHelpers');
var userHelper=require('../helpers/userHelpers');

/* GET users listing. */
router.get('/', function(req, res, next) {
  let user=req.session.user;
  productHelper.getAllProduct().then((products)=>{
    res.render('users/user-home',{products,user})
  })  
});

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/');
  }else{
    res.render('users/login',{logErr:req.session.logErr});
  }
});

router.get('/signup',(req,res)=>{
  res.render('users/signup');
});

router.post('/signup',(req,res)=>{
userHelper.doSignup(req.body).then((response)=>{
  res.redirect('/login')
});
});

router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user;
      req.session.loggedIn=true;
      res.redirect('/');
    }else{
      req.session.logErr="Invalid username or password";
      res.redirect('/login');
    }
  });
});

router.get('/logout',(req,res)=>{
  req.session.user=null;
  req.session.loggedIn=false;
  res.redirect('/');
})

module.exports = router;
