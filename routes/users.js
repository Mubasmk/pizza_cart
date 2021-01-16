var express = require('express');
const { Db } = require('mongodb');
var router = express.Router();
var productHelper=require('../helpers/productHelpers');
var userHelper=require('../helpers/userHelpers');
var verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login');
  };
};
/* GET users listing. */
router.get('/',async function(req, res, next) {
  let user=req.session.user;
  let cartCount=null;
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id);
  }
  productHelper.getAllProduct().then((products)=>{
    res.render('users/user-home',{products,user,cartCount})
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
});

router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelper.getCartProducts(req.session.user._id);
  res.render('users/cart',{products});
});

router.get('/addCart/:id',(req,res)=>{
  console.log("api call");
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  });
});

router.post('/change-product-quantity',(req,res,next)=>{
  userHelper.changeProductQuantity(req.body).then((response)=>{
    res.json(response);
  })
})

module.exports = router;
