// BASE SETUP
// =============================================================================

var express = require('express'),
	bodyParser = require('body-parser');
var cors=require('cors');
//var users=require('./routes/users');
var app = express();
app.use(bodyParser());
app.use(cors());
var env = app.get('env') == 'development' ? 'dev' : app.get('env');
var port = process.env.PORT || 8080;
var jwt    = require('jsonwebtoken');
var jwtDecode=require('jwt-decode');


// IMPORT MODELS
// =============================================================================
var Sequelize = require('sequelize');

// db config
var env = "dev";
var config = require('./database.json')[env];
var password = config.password ? config.password : null;

// initialize database connection
var sequelize = new Sequelize(
	config.database,
	config.user,
	config.password,
	{
    dialect: config.driver,
    logging: console.log,
		define: {
			timestamps: false
		}
	}
);
app.set('superSecret', config.secret);
var crypto = require('crypto');
var User=require('./models/users');
var Message=require('./models/messages');
var Session=require('./models/sessions');
//require('./routes/authenticate');
//require('./routes/users')(app);

// IMPORT ROUTES
// =============================================================================
var router = express.Router();


// on routes that end in /users
// ----------------------------------------------------

router.route('/authenticate')
.post(function(req,res){
	var username=req.body.username;
	var password=req.body.password;

	var shasum = crypto.createHash('sha1');
			shasum.update(password);
			password = shasum.digest('hex');


	var user=User.build({username:username});
	user.checkuser(function(users){
		if(users){
			var user_id=users.id;
			if(users.password!=password){
				res.send("password not matched");
			}
			else{
			var token=jwt.sign(users,app.get('superSecret'),{
				expiresInMinutes :1440
			});
			res.json({
				success:true,
				token:token,
				user_id:user_id
			});
			var session=Session.build();
			session.sessionUser(user_id,function(sesuser){
				if(sesuser){
					var session=Session.build();
					session.token=token;
					session.sessionUpdate(user_id,function(success){
					if(success){
					res.send("updated");
					}else{
					res.send("not");}
				},function(error){
				res.send("error");
			});
				}
			else{
				//res.send("cert");
				var session=Session.build();
				var session= Session.build({user_id:user_id,token:token});
				session.addSession(function(success){
				res.json({message:"Session created"});

				},function(err){
				res.send(err);
			});
			}
				},function(err){
				res.send(err);
			});
			
				}			
		}
	 else {
			res.send('user not found');
		}
	}, function(error){
			res.send("Failed");
		
	});
});


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


router.route('/logout')
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

router.route('/users')

// create a user (accessed at POST http://localhost:8080/api/users)
.post(function(req, res) {

	var username = req.body.username; //bodyParser does the magic
	var password = req.body.password;
	var shasum = crypto.createHash('sha1');
			shasum.update(password);
			password = shasum.digest('hex');
	var user = User.build({ username: username, password: password });

	user.addUser(function(success){
		res.json({ message: 'User created!' });
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
router.route('/users/:user_id')

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
router.route('/messages')

.post(function(req, res) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var token_decoded=jwtDecode(token);

	var user_id = req.body.user_id; //bodyParser does the magic
	var from_id = token_decoded.id;
	var descr   = req.body.descr;
	var message = Message.build({ user_id:user_id,from_id:from_id,descr:descr });

	message.addMessage(function(success){
		res.json({ message: 'Message Sent!' });
	},
	function(err) {
		res.send(err);
	});
})

.get(function(req, res) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var token_decoded=jwtDecode(token);

	var user_id = token_decoded.id;
	var message = Message.build();

	message.retrieveByIdMessage(user_id, function(messages) {
		if (messages) {
		  res.json(messages);
		} else {
		  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("some error");
	  });
});



// Middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});



// REGISTER OUR ROUTES
// =============================================================================
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);