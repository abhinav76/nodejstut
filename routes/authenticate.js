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
router.route('/')
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

module.exports = router;
