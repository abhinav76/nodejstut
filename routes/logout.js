var express = require('express');
var app = express();
var jwt    = require('jsonwebtoken');
var jwtDecode=require('jwt-decode');
var env = "dev";
var config = require('../database.json')[env];
app.set('superSecret', config.secret);
var crypto = require('crypto');
var User=require('../models/users');
var Message=require('../models/messages');
var Session=require('../models/sessions');
var router = express.Router();


router.use(function(req,res,next){
	 var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  // decode token
	  if (token) {
	  	
	     jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
	      if (err) {
	         return res.json({ success: false, message: 'Failed to authenticate token.' });    
	       } else {
	         // if everything is good, save to request for use in other routes
	         var session=Session.build();
	         session.checkSession(token,function(session){
	         	if(session){
	         		 req.decoded = decoded; 
	         		 next();
	         	} else{
	         		res.json({message:"Invalid Token"});
	         	}
	         },function(err){
	         	res.send("Error");
	         });
	         
	       }
	     });

	  } else {

	    // if there is no token
	    // return an error
	    return res.status(403).send({ 
	        success: false, 
	        message: 'No token provided.' 
	    });
	    
	  }
	});
router.route('/')
.delete(function(req,res){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var token_decoded=jwtDecode(token);
	var user_id=token_decoded.id;
	var session=Session.build();
	session.removeSession(user_id,function(sessions){
		if (sessions) {
		  res.json({ message: 'Session removed!' });
		} else {
		  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("User not found");
	});


});
module.exports = router;