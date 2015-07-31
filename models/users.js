var Sequelize = require('sequelize');
var env = "dev";
var config = require('../database.json')[env];
var password = config.password ? config.password : null;
var express = require('express');
var app=express();
//var Message=require('../models/messages');
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
    password: DataTypes.STRING,
    //token:DataTypes.STRING
  }, {
    instanceMethods: {
      retrieveAllUser: function(user_id,onSuccess, onError) {
			User.findAll({where:{id:{ne:user_id}}}, {raw: true}).success(onSuccess).error(onError);
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

			User.update({ username: username,password: password}, {id: id} ).success(onSuccess).error(onError);
	   },
	  checkuser: function(onSuccess,onError){
	  	var username=this.username;
	  	User.find({where:{username:username}},{raw:true}).success(onSuccess).error(onError);
	},
		// updateToken: function(user_id,onSuccess,onError){
		// 	//var id=this.id;
		// 	var token=this.token;
		// 	User.update({token:token},{id:user_id}).success(onSuccess).error(onError);
		// },
      removeByIdUser: function(user_id, onSuccess, onError) {
			User.destroy({where: {id: user_id}}).success(onSuccess).error(onError);
	  }
    }
  });
// User.hasMany(Message,{foreignKey:'from_id'});
// Message.belongsTo(User,{foreignKey:'user_id'});
module.exports=User;