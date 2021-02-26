const dotenv=require('dotenv')
var mongoClient=require('mongodb').MongoClient;
dotenv.config()
const state={
    db:null
};
//connecting to db
module.exports.connect=(done)=>{
    // Database connection
    const url=process.env.DB_URL;

    mongoClient.connect(url,{ useUnifiedTopology: true },(err,data)=>{
        if (err) return done(err)
        state.db=data.db("pizzaHub");
        done();
    });
};
module.exports.get=()=>{
    return state.db;
};