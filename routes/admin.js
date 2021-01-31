const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/productHelpers');
var userHelper=require('../helpers/userHelpers');

/* GET home page. */
router.get('/', function(req, res, next) {
  productHelper.getAllProduct().then((products)=>{
    res.render('admin/admin-home', { products,admin:true });
  })
});

router.get('/add-products',(req,res)=>{
  res.render('admin/add-products',{admin:true});
});

router.post('/add-products',(req,res)=>{
productHelper.addProduct(req.body,(id)=>{
  let image=req.files.Image;
  image.mv('./public/images/'+id+'.jpg',(err,done)=>{
    if(!err){
      res.render('admin/add-products',{admin:true});
    }else{
      console.log(err);
    }
  })
})
});

router.get('/delete-products/:id',(req,res)=>{
  let proId=req.params.id;
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin');
  })
});

router.get('/update-products/:id',async(req,res)=>{
  let products=await productHelper.getProductDetails(req.params.id);
  res.render('admin/update-products',{products,admin:true})
});

router.post('/update-products/:id',(req,res)=>{
  let id=req.params.id;
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin');

    if(req.files.Image){
      let image=req.files.Image;
      image.mv('./public/images/'+id+'.jpg');
    };
  });
});

router.get('/product-details/:id',async(req,res)=>{
  let products=await productHelper.getProductDetails(req.params.id);
  res.render('admin/product-details',{products,admin:true});
});

router.get('/view-users',(req,res)=>{
  productHelper.getAllUsers().then((users)=>{
    console.log("user",users);
    res.render('admin/view-users',{users,admin:true});
  });
});

router.get('/delete-user/:id',(req,res)=>{
  let userId=req.params.id;
  productHelper.deleteUser(userId).then((response)=>{
    res.redirect('/admin/view-users');
  });
});

router.get('/view-orders',(req,res)=>{
  productHelper.getAllOrders().then((orders)=>{
    console.log("order::",orders);
    res.render('admin/view-orders',{admin:true,orders});
  });
});

router.get('/order-products/:id',async(req,res)=>{
  let products=await userHelper.getUserOrderProduct(req.params.id);
  res.render('admin/order-products',{products,admin:true});
})
module.exports = router;
