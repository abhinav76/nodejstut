var Sequelize = require('sequelize');
var express = require('express'),
	bodyParser = require('body-parser');
	var app = express();
app.use(bodyParser());
// db config
var env = "dev";
var config = require('../database.json')[env];
var password = config.password ? config.password : null;
var User=require('../models/users');

// initialize database connection
var sequelize = new Sequelize(
	config.database,
	config.user,
	config.password,
	{
	//timezone:"+5:30",
    dialect: config.driver,
    logging: console.log,
		define: {
			timestamps: false
		}
	}
);
var DataTypes = require("sequelize");
var Message=sequelize.define('messages',{
	user_id:{
		type:DataTypes.INTEGER,
		validate:{
			isNumeric:true,
			notEmpty:true
		}
	},
	from_id:{
		type:DataTypes.INTEGER,
		validate:{
			isNumeric:true
		}
	},
	descr:{
		type:DataTypes.STRING,
		validate:{
			notEmpty:true
		}
	},
	createdAt:{type:DataTypes.DATE,defaultValue:DataTypes.NOW}
},{
	instanceMethods : {
		 // retrieveAllMessage: function(onSuccess, onError) {
			// Message.findAll({}, {raw: true}).success(onSuccess).error(onError);
	  // },
	  // retrieveAllMessage: function(onSuccess, onError) {
			// Message.findAll({}, {raw: true}).success(onSuccess).error(onError);
	  
       retrieveByIdMessage: function(user_id, onSuccess, onError) {
			// Message.findAll({
				
			// 	where: {user_id: user_id}}, {raw: true}).success(onSuccess).error(onError);
			Message.findAll({where:{user_id:user_id},order:'createdAt DESC',
				include:[{
					model:User,required:true,attributes:['username']}]},{raw:true}).success(onSuccess).error(onError);
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
	   }
	  
	}
});
//console.log(User);
Message.belongsTo(User,{foreignKey:'from_id'});
User.hasMany(Message,{foreignKey:'from_id'});
module.exports=Message;