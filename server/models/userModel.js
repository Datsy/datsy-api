var passwordHash = require('password-hash');

var userModel = function(schema){

  var User = schema.define("user", {
    name: {type: String},
    email: {type: String},
    password: {type: String},
    account: {type: String}
  });


  User.prototype.isValidUserPassword = function(email, rawPassword, done) {
    console.log("is valid user password")
    User.findOne({where: {email : email}}, function(err, data){
      console.log(data)
      // if(err) throw err;
      if(err){
        console.log('login error');
        return done(err);
      }
      if(!data){
        console.log('user not found');
        return done(null, false, { message : 'Incorrect email.' });
      }
      var matched = passwordHash.verify(rawPassword, data.password);
      if (!matched){
        console.log('passwords didnt match');
        return done(null, false, {
          message : 'Incorrect password'
        });
      } else {
        console.log('user login successful');
        return done(null, data);
      }
    });
  };

  // User.prototype.signup = function(name, email, password, done){
  //   console.log("In userSchema ")
  //   var user = this;
  //   user.create({
  //   name: name,
  //   email : email,
  //   password : password
  //   }, function(err, user){
  //     if(err) throw err;
  //     // if (err) return done(err);
  //     done(null, user);
  //   });
  // }

  return User;
}
  
module.exports = userModel;








