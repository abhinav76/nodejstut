var Sequelize = require('sequelize');

// db config
var env = "dev";
var config = require('../database.json')[env];
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
var DataTypes = require("sequelize");
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
	   }
	  
	}
});
module.exports=Message;