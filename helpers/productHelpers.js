var db=require('../config/connection');
var collection=require('../config/collections');
const { resolve } = require('promise');

module.exports={
    addProduct:(product,callback)=>{
        product.Price=parseInt(product.Price);
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
        });
    },
    getAllProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })
    }
}