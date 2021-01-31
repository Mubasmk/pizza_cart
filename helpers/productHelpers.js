var db=require('../config/connection');
var collection=require('../config/collections');
const { resolve, reject } = require('promise');
const { PRODUCT_COLLECTION } = require('../config/collections');
const { response } = require('express');
var objectId=require('mongodb').ObjectID;

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
        });
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            });
        });
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
                resolve(response);
            });
        });
    },
    updateProduct:(proId,proDetails)=>{
        proDetails.Price=parseInt(proDetails.Price);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
            {
                $set:{
                    Title:proDetails.Title,
                    Item:proDetails.Item,
                    Category:proDetails.Category,
                    Variety:proDetails.Variety,
                    Price:proDetails.Price,
                    Description:proDetails.Description,
                    Ingredients:proDetails.Ingredients
                }
            }).then((response)=>{
                resolve();
            });
        });
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(users);
        })
    },
    deleteUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).removeOne({_id:objectId(userId)}).then((response)=>{
                resolve(response);
            });
        });
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray();
            resolve(orders);
        });
    }
}