(function() {
// Retrieve
    var MongoClient = require('mongodb').MongoClient, assert = require('assert');

    module.exports = {
        authorizeLogin:validateUser
    };
    function validateUser(mode, req, res){
        var resData;
        MongoClient.connect("mongodb://MuthuNithya:862014@ds033143.mongolab.com:33143/dreamlion", function (err, db) {
            if (!err) {
                console.log("We are connected");
            }
            var collection = db.collection("master_userlist");
            switch (mode){
                case 'login':
                    resData = authorizeLogin(collection, req,res, db);
                    break;
                case 'signup':
                    resData = createUser(collection, req,res, db);
                    break;
            }
        });
        return;
    }
    function authorizeLogin(collection, req,res, db){
        var fetchUser = {};
        collection.findOne({emailId: req.emailId}, function (err, item) {
            if(!assert.equal(null, err)){
                if(item && item.emailId === req.emailId){
                    console.log('item ',item);
                    if(item.password === req.password){
                        fetchUser = {
                            status: "success",
                            username: item.username,
                            userid: item._id
                        };
                        console.log('step1 ',fetchUser);
                        res.send({result:[fetchUser]});
                        db.close();
                    } else{
                        //emailId is invalid
                        var resObj = {
                            "status": "failure",
                            "err_msg": "EmailId/Password is invalid"
                        };
                        console.log('step2 ',resObj);
                        res.send({result:[resObj]});
                        db.close();
                    }
                }else{
                    //emailId is invalid
                    var resObj = {
                        "status": "failure",
                        "err_msg": "EmailId/Password is invalid"
                    };
                    console.log('step2 ',resObj);
                    res.send({result:[resObj]});
                    db.close();
                }
            }else if (err){
                var resObj = {
                    "status": "failure",
                    "err_msg": "Unexpected Service Failure",
                    "err_field": "login"
                };
                console.log('step3 ',resObj);
                res.send({result:[resObj]});
                db.close();
            }
            return;
        });
    }

    function createUser(collection, req, res, db){
        //duplicate check
        collection.findOne({emailId: req.emailId}, function (err, item) {
            if(item && item.emailId === req.emailId){
                var resObj = {
                    "status": "failure",
                    "err_msg": "emailId already exists",
                    "err_field": "emailId"
                };
                res.send({result:[resObj]});
                db.close();

            }else{
                // Insert a single document
                if(req.emailId && req.password && req.username){
                    collection.insert([req], function (err, result) {
                        if(!assert.equal(null, err)){
                            res.send({result:[{"status": "success"}]});
                            db.close();
                        }else if (err){
                            var resObj = {
                                "status": "failure",
                                "err_msg": "Unexpected Service Failure",
                                "err_field": "login"
                            };
                            res.send({result:[resObj]});
                            db.close();
                        }
                    })
                }
            }
        });
        return;
    }
})();
