var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/productHelpers');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/admin-home', { admin:true });
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
})
module.exports = router;
