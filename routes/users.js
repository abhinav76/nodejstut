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

// create a user (accessed at POST http://localhost:8080/api/users)
.post(function(req, res) {

	var username = req.body.username; //bodyParser does the magic
	var password = req.body.password;
	var user = User.build({ username: username, password: password });

	user.addUser(function(success){
		var userid=success.id;
		res.json(userid);
	},
	function(err) {
		res.send(err);
	});
})

// get all the users (accessed at GET http://localhost:8080/api/users)
.get(function(req, res) {
	var user = User.build();
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var token_decoded=jwtDecode(token);
	var user_id=token_decoded.id;
	 user.retrieveAllUser(user_id,function(users) {
	 	if (users) {
	 	res.json(users);
	 	} else {
	 	  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("User not found");
	  });
})
.put(function(req, res) {
	var user = User.build();
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var token_decoded=jwtDecode(token);
	var user_id=token_decoded.id;
	user.username = req.body.username;
	user.password = req.body.password;

	user.updateByIdUser(user_id, function(success) {
		console.log(success);
		if (success) {
			res.json({ message: 'User updated!' });
		} else {
		  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("User not gg found");
	  });
});


// on routes that end in /users/:user_id
// ----------------------------------------------------
router.route('/:user_id')

// update a user (accessed at PUT http://localhost:8080/api/users/:user_id)


// get a user by id(accessed at GET http://localhost:8080/api/users/:user_id)
.get(function(req, res) {
	var user = User.build();

	user.retrieveByIdUser(req.params.user_id, function(users) {
		if (users) {
		  res.json(users);
		} else {
		  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("User not found");
	  });
})

// delete a user by id (accessed at DELETE http://localhost:8080/api/users/:user_id)
.delete(function(req, res) {
	var user = User.build();

	user.removeByIdUser(req.params.user_id, function(users) {
		if (users) {
		  res.json({ message: 'User removed!' });
		} else {
		  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("User not found");
	  });
});

module.exports = router;