// BASE SETUP
// =============================================================================

var express = require('express'),
	bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

var env = app.get('env') == 'development' ? 'dev' : app.get('env');
var port = process.env.PORT || 8080;
var jwt    = require('jsonwebtoken');

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
var DataTypes = require("sequelize");

var User = sequelize.define('users', {
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    instanceMethods: {
      retrieveAllUser: function(onSuccess, onError) {
			User.findAll({}, {raw: true}).success(onSuccess).error(onError);
	  },
      retrieveByIdUser: function(user_id, onSuccess, onError) {
			User.find({where: {id: user_id}}, {raw: true}).success(onSuccess).error(onError);
	  },
      addUser: function(onSuccess, onError) {
			var username = this.username;
			var password = this.password;

			var shasum = crypto.createHash('sha1');
			shasum.update(password);
			password = shasum.digest('hex');

			User.build({ username: username, password: password })
			    .save().success(onSuccess).error(onError);
	   },
	  updateByIdUser: function(user_id, onSuccess, onError) {
			var id = user_id;
			var username = this.username;
			var password = this.password;

			var shasum = crypto.createHash('sha1');
			shasum.update(password);
			password = shasum.digest('hex');

			User.update({ username: username,password: password},{where: {id: id} }).success(onSuccess).error(onError);
	   },
	  checkuser: function(onSuccess,onError){
	  	var username=this.username;
	  	User.find({where:{username:username}},{raw:true}).success(onSuccess).error(onError);
	},
      removeByIdUser: function(user_id, onSuccess, onError) {
			User.destroy({where: {id: user_id}}).success(onSuccess).error(onError);
	  }
    }
  });

var Message=sequelize.define('messages',{
	user_id:DataTypes.INTEGER,
	from_id:DataTypes.INTEGER,
	descr:DataTypes.STRING
},{
	instanceMethods : {
		 // retrieveAllMessage: function(onSuccess, onError) {
			// Message.findAll({}, {raw: true}).success(onSuccess).error(onError);
	  // },
	  retrieveAllMessage: function(onSuccess, onError) {
			Message.findAll({}, {raw: true}).success(onSuccess).error(onError);
	  },
       retrieveByIdMessage: function(user_id, onSuccess, onError) {
			Message.findAll({where: {user_id: user_id}}, {raw: true}).success(onSuccess).error(onError);
			// Message.findAll({
			// 	include:[{
			// 		model:User,required:true}]},{raw:true}).success(onSuccess).error(onError);
	  },
      addMessage: function(onSuccess, onError) {
			var user_id = this.user_id;
			var from_id = this.from_id;
			var descr=this.descr;

			// var shasum = crypto.createHash('sha1');
			// shasum.update(password);
			// password = shasum.digest('hex');

			Message.build({ user_id: user_id, from_id: from_id,descr:descr })
			    .save().success(onSuccess).error(onError);
	   },
	  
	}
})

 Message.belongsTo(User,{foreignKey:'user_id'});
 User.hasMany(Message,{foreignKey:'user_id'});


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
			if(users.password!=password){
				res.send("password not matched");
			}
			else{
			var token=jwt.sign(users,app.get('superSecret'),{
				expiresInMinutes :1440
			});
			res.json({
				success:true,
				token:token
			});
		}} else {
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

	    // verifies secret and checks exp
	    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
	      if (err) {
	        return res.json({ success: false, message: 'Failed to authenticate token.' });    
	      } else {
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;    
	        next();
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




router.route('/users')

// create a user (accessed at POST http://localhost:8080/api/users)
.post(function(req, res) {

	var username = req.body.username; //bodyParser does the magic
	var password = req.body.password;

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

	user.retrieveAllUser(function(users) {
		if (users) {
		  res.json(users);
		} else {
		  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("User not found");
	  });
});


// on routes that end in /users/:user_id
// ----------------------------------------------------
router.route('/users/:user_id')

// update a user (accessed at PUT http://localhost:8080/api/users/:user_id)
.put(function(req, res) {
	var user = User.build();

	user.username = req.body.username;
	user.password = req.body.password;

	user.updateByIdUser(req.params.user_id, function(success) {
		console.log(success);
		if (success) {
			res.json({ message: 'User updated!' });
		} else {
		  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("User not found");
	  });
})

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
.get(function(req, res) {
	var message = Message.build();

	message.retrieveAllMessage(function(messages) {
		if (messages) {
		  res.json(messages);
		} else {
		  res.send(401, "Messages not found");
		}
	  }, function(error) {
		res.send("Some error");
	  });
})
.post(function(req, res) {

	var user_id = req.body.user_id; //bodyParser does the magic
	var from_id = req.body.from_id;
	var descr   = req.body.descr;
	var message = Message.build({ user_id:user_id,from_id:from_id,descr:descr });

	message.addMessage(function(success){
		res.json({ message: 'Message Sent!' });
	},
	function(err) {
		res.send(err);
	});
});
router.route('/messages/:user_id')
.get(function(req, res) {
	var message = Message.build();

	message.retrieveByIdMessage(req.params.user_id, function(messages) {
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