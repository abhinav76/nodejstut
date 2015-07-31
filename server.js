// BASE SETUP
// =============================================================================

var express = require('express'),
	bodyParser = require('body-parser');
var cors=require('cors');
var app = express();
app.use(bodyParser());
app.use(cors());
var env = app.get('env') == 'development' ? 'dev' : app.get('env');
var port = process.env.PORT || 8080;
var jwt    = require('jsonwebtoken');
var jwtDecode=require('jwt-decode');
var authenticate=require('./routes/authenticate');
var users=require('./routes/users');
var messages=require('./routes/messages');
var logout=require('./routes/logout');
var Message=require('./models/messages');
var User=require('./models/users');



// Message.belongsTo(User,{foreignKey:'user_id'});
// User.hasMany(Message,{foreignKey:'user_id'});
// IMPORT ROUTES
// =============================================================================
var router = express.Router();
// Middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});



// REGISTER OUR ROUTES
// =============================================================================
app.use('/api/authenticate',authenticate);
app.use('/api/users',users);
app.use('/api/messages',messages);
app.use('/api/logout',logout);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);