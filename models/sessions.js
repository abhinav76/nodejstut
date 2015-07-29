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
Session=sequelize.define('sessions',{
	user_id:DataTypes.INTEGER,
	token:DataTypes.STRING
},{
	instanceMethods: {
		  addSession: function(onSuccess, onError) {
			var user_id = this.user_id;
			var token = this.token;
			Session.build({ user_id: user_id, token: token})
			    .save().success(onSuccess).error(onError);
	   },
	   checkSession:function(token,onSuccess,onError){
	   	Session.find({where:{token:token}},{raw:true}).success(onSuccess).error(onError);

	   },
	   sessionUser:function(user_id,onSuccess,onError){
	   	Session.find({where:{user_id:user_id}},{raw:true}).success(onSuccess).error(onError);

	   },
	   sessionUpdate:function(user_id,onSuccess,onError){
	   var token=this.token;
	   Session.update({token:token},{user_id:user_id}).success(onSuccess).error(onError);
	},
	removeSession: function(user_id, onSuccess, onError) {
			Session.destroy({user_id: user_id}).success(onSuccess).error(onError);
	  }
}
});
module.exports=Session;