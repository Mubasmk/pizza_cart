var db=require('../config/connection');
var collection=require('../config/collections');
const { resolve } = require('promise');
var bcrypt=require('bcrypt');

module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.ops[0]);
            });
        });
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={};
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email});
            console.log("user",user);
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if (status){
                        console.log("Login success");
                        response.user=user;
                        response.status=true;
                        resolve(response);
                    }else{
                        console.log("Login failed");
                        resolve({status:false});
                    }
                })
            }else{
                console.log("Login failed");
                resolve({status:false});
            }
        })
    }
}