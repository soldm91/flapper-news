var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

var crypto = require('crypto');

var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
  hash: String,
  salt: String
}, {collection : 'users'});



UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  return this.hash === hash;
};

/*
UserSchema.methods.setPassword = function(password){
	
	console.log("in set password passport");
	
  this.salt = password;

  this.hash = password;
};

UserSchema.methods.validPassword = function(password) {
  var hash = password;

  return this.hash === hash;
};
*/
UserSchema.methods.generateJWT = function() {

  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, 'SECRET');
};

//var User = mongoose.model('User');
//mongoose.model('User', UserSchema, 'users');
var User = mongoose.model('users', UserSchema);

passport.use(new LocalStrategy({passReqToCallback: true},
  function(req, username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
		  console.log("action: " + req.body.action);
		  if(req.body.action === "register"){
			  console.log("in if statement");
				var newUser = new User();
				console.log("in index js register init user");
				newUser.username = req.body.username;
				console.log("about to set password");
				newUser.setPassword(req.body.password);
				console.log("password set");
				return done(null, newUser);
		  }
        return done(null, false, { message: 'Incorrect username.' });
      }
	  
		console.log("action: " + req.body.action);
	  console.log("passport use");
	  console.log(user);
	  
	  //var theUser = new User();
	  //theUser.username = user.username;
	  //theUser.salt = user.salt;
	  //theUser.hash = user.hash;
	  
	  //console.log("theUser: " + theUser);
	  
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
  
));