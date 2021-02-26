var db = require('../config/connection');
var collection = require('../config/collections');
const { resolve, reject } = require('promise');
var bcrypt = require('bcryptjs');
const { response } = require('express');
var objectId = require('mongodb').ObjectID;
const Razorpay=require('razorpay');
const { promises } = require('fs');
//import razorpay instance
var instance = new Razorpay({
    key_id: 'rzp_test_xaxHRF6TFiQXJN',
    key_secret: 'lOVtp1v3K35gsFPOvJFpO8JF'
});

module.exports = {
    //signup function
    doSignup: (userData) => {
        return new Promise(async(resolve, reject) => {
            //user password encrypted
            userData.Password = await bcrypt.hash(userData.Password, 10);
            //inserting user input to db 
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.ops[0]);
            });
        });
    },

    //login function
    doLogin: (userData) => {
        return new Promise(async(resolve, reject) => {
            let response = {};
            //find user in db using entered email 
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email });
            console.log(user);
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("Login success");
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        console.log("Login failed");
                        resolve({ status: false });
                    }
                })
            } else {
                console.log("Login failed");
                resolve({ status: false });
            }
        });
    },

    //product adding to cart collection in db
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async(resolve, reject) => {
            //check user has existed cart collection
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });
            if (userCart) {
                //updating user cart 
                let proExist = userCart.products.findIndex(product => product.item == proId);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) }, {
                        $inc: { 'products.$.quantity': 1 }
                    }).then(() => {
                        resolve();
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
                        $push: { products: proObj }
                    }).then((response) => {
                        resolve();
                    })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                //if user doesn't has exist cart,creating cart
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve();
                });
            };
        });
    },
    
    //get cart items from db
    getCartProducts: (userId) => {
        return new Promise(async(resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([{
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(cartItems)
        });
    },

    //get cart item count
    getCartCount: (userId) => {
        return new Promise(async(resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });
            if (cart) {
                count = cart.products.length;
            }
            resolve(count);
        });
    },

    //change cart item quantity in cart
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count);
        details.quantity = parseInt(details.quantity);

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) }, {
                    $pull: {
                        products: {
                            item: objectId(details.product)
                        }
                    }
                }).then((response) => {
                    resolve({ removeProduct: true })

                })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) }, {
                    $inc: { 'products.$.quantity': details.count }
                }).then((response) => {
                    resolve({ status: true });
                });
            };
        });
    },

    //calculate total amount of cart items
    getTotalAmount: (userId) => {
        return new Promise(async(resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([{
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply: ['$quantity', '$product.Price']
                            }
                        }
                    }
                }
            ]).toArray()
            resolve(total[0].total)
        })
    },

    //delete cart items
    deleteCartItem: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) }, {
                $pull: {
                    products: {
                        item: objectId(details.product)
                    }
                }
            }).then((response) => {
                resolve({ removeCartItem: true })
            });
        });
    },

    //get cart product list
    getCartProductList: (userId) => {
        return new Promise(async(resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });
            resolve(cart.products);
        });
    },

    //function for order placing
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, total);
            let status = order['payment-method'] === 'COD' ? 'Order confirmed' : 'pending';
            let d = new Date();
            var days=1;
            var deliveryDate=new Date(d.getTime()+(days*24*60*60*1000));
            let orderObj = {
                deliveryDetails: {
                    Name: order.delName,
                    Address: order.delAddress,
                    City: order.delCity,
                    Pincode: order.delPincode,
                    Landmark: order.delLandmark,
                    Mobile: order.delMobile
                },
                userId: objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                status: status,
                date: d.toLocaleDateString(),
                expectedDel:deliveryDate.toLocaleDateString()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).removeOne({ user: objectId(order.userId) });
                resolve(response.ops[0]._id);
            });
        });
    },

    //get user total orders
    getUserOrder: (userId) => {
        return new Promise(async(resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray();
            resolve(orders);
        });

    },

    //get user each order
    getUserOrder1: (orderId) => {
        return new Promise(async(resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray();
            resolve(orders);
        });

    },

    //get user order product details
    getUserOrderProduct: (orderId) => {
        return new Promise(async(resolve, reject) => {
            let products = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(products)
        });
    },

    //generate razorpay payment
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
            var options = {
                amount: total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log(err);
                }else{
                    console.log("new Order",order);
                    resolve(order);
                }
              });
        });
    },

    //verify razorpay payment
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto=require('crypto');
            let hmac=crypto.createHmac('sha256','lOVtp1v3K35gsFPOvJFpO8JF');
            hmac.update(details['payment[razorpay_order_id']+'|'+details['payment[razorpay_payment_id']);
            hmac=hmac.digest('hex');

            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        });
    },

    //change payment status after razorpay payment
    changePaymentStatus:(orderId)=>{
        console.log("orderId::",orderId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
            {
                $set:{status:'Order confirmed'}
            }).then(()=>{
                resolve();
            });
        });
    }
};