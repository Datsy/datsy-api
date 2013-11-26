/* GET home page */

var index = function(Models){
  var indexRoutes = {};
  var passwordHash = require('password-hash');
  var crypto = require('crypto');
  var q = require('q');
  var fs = require('fs');
  var csv = require('csv');
  var csvToDatabase = require('../helpers/csvToDatabase.js');
  var hat = require('hat');
  var User = Models.User;
  var TableMetaData = Models.TableMetaData;
  var EmailToken = Models.EmailToken;
  var mailer = require('../helpers/sendEmail.js');

  indexRoutes.index = function(req, res){
    res.render('index', { title: 'Express' });
  };

  indexRoutes.loginSuccess = function(req, res){
    console.log('login success route');
    res.writeHead(200);
    res.end('success');
  }

  indexRoutes.loginFail = function(req, res){
    console.log('login fail route');
    res.writeHead(200);
    res.end('fail');
  }

  indexRoutes.userSignupVerify = function(req, res){
    console.log("In SignupVerify");
    EmailToken.findOne({where: {token: req.params['token']}},
      function (err, result) {
        if (err) {
          console.log("ERROR - userSignupVerify aborted!!");
        }
        console.log("in userSignupVerify");
        if (result === null){ //no email token found
          res.writeHead(404);
          res.end();
        } else{
          var newUser = new User({
            name: result.name,
            email: result.email,
            password: result.password,
            account: "user"
          });
          // console.log("RESULT***",result);
          User.findOne({where: {email: newUser.email}}, 
            function (err, result) {
              if (err) {
                console.log("ERROR - creating (userSignupVerify) user aborted!!");
                console.log("ERROR:",err);
              }
                console.log("in User findOne");
              if (result === null) { // create user
                console.log('result is null, we are creating a new user', newUser);
                newUser.save(function (err, data) {
                  if (err) console.log("ERR!!! - ",err);
                    console.log('** userSignupVerify is successful ** ');
                    // console.log("Result Obj***", data);
                    res.render('login');
                });
              } else{
                console.log('That user exists: ', result);
                res.writeHead(500);
                res.end("500 Internal Server Error - user existed, could not create account");
              }
          });
        }
    });
    // res.render('login');
  }

  indexRoutes.signup = function(req, res){
    console.log("In signup");
    var newEmailToken = new EmailToken({
      name: req.body.name,
      email: req.body.email,
      password: passwordHash.generate(req.body.password),
      phone: req.body.phone,
      token: ''
    });
    var token;

    function createToken(){
      var deferred = q.defer();
      crypto.randomBytes(20, function(ex, buf) {
        token = buf.toString('hex');
        deferred.resolve('deferred resolved!!');
      });
      return deferred.promise;
    }

    createToken().then(function(){

      newEmailToken.token = token;
      newEmailToken.save(function (err) {
        if (err) {
          console.log("ERROR in saving new email token!!!");
          console.log("ERROR:",err);
        }
      var deferred = q.defer();
        var confirmationLink = req.protocol + "://" + req.get('host') + req.url + "/" + newEmailToken.token;;
        var locals = {
          email: newEmailToken.email,
          subject: 'Verify your Datsy account',
          name: newEmailToken.name,
          confirmationLink: confirmationLink
        };
        mailer.sendOne('registrationVerif', locals, function(err, responseStatus, html, text){
          if (err){
            console.log("ERROR in sending registration verification email to user!!!");
            console.log("ERR MSG:", err);
          } else {
            console.log("Registration verification email sent successfully to:", locals.email);
          }
        });

        res.render('verifyEmail', { title: 'Express' });
      });
    })
  };

  indexRoutes.checkEmailIfExists = function(req,res){
   
    // console.log("Email:",req.query.email);
    User.findOne({email: req.query.email}, 'email', 
      function (err, result) {
        if (err) {
          console.log("ERROR - checkEmailIfExists aborted!!");
        }
        if (result === null) { 
          res.writeHead(200);
          res.end("true");
        } else{
          res.writeHead(204);
          res.end("false");
        }
    });
  };

  indexRoutes.userReadInfo = function(req, res){
    var userModel = User;
    var newUser = new user(req.body);
    
    userModel.findOne({name: newUser.name, email: newUser.email}, 'name email', 
      function (err, result) {
        if (err) {
          console.log("ERROR - read user info aborted!!");
        }
        if (result !== null) {
          // console.log("*****DATA*****",data);
          res.writeHead(200);
          res.end(result);
        }
    });
  };

  indexRoutes.uploadFile = function(req, res){
    // console.log("****uploadFile", req.files);

    var newPath = __dirname + "/../helpers/uploads/file1.csv";
    
    console.log("*****uploadFile req", req);

    var readFile = function(){
      var deferred = q.defer();
      fs.readFile(req.files.csvFile.path, function (err, data) {
        var newPath = __dirname + "/../helpers/uploads/file1.csv";
        // console.log("**new path", newPath);
        fs.writeFile(newPath, data, function (err) {
          deferred.resolve('deferred resolved!!');
          // res.render('login');
        });
      });
      return deferred.promise;
    }

    readFile()
    .then(function(){
      console.log("in writing to Azure database");
      csvToDatabase(newPath);
      // console.log("***form params", req);
      var tableMetaData = new TableMetaData({
        name: req.body.table_name,
        description: req.body.table_description,
        author: req.body.table_author
      });
      tableMetaData.save(function (err, data) {
        if (err){
          console.log('** ERROR in saving table meta data **');
          console.log("ERR!!! - ",err);
        } else{
          console.log('** success in saving meta data ** ');
        }
      });
    });

    res.render('loginSuccessful');

  //   .then(function(){
  //     // parse csv file
  //     csv()
  //     .from.path(newPath, { delimiter: ',', escape: '"' })
  //     .to.stream(fs.createWriteStream(__dirname+'/sample.out'))
  //     .transform( function(row){
  //       row.unshift(row.pop());
  //       return row;
  //     })
  //     .on('record', function(row,index){
  //       console.log('#'+index+' '+JSON.stringify(row));
  //     })
  //     .on('close', function(count){
  //       // when writing to a file, use the 'close' event
  //       // the 'end' event may fire before the file has been written
  //       console.log('Number of lines: '+count);
  //     })
  //     .on('error', function(error){
  //       console.log(error.message);
  //     });
  //     res.render('login');
  //   })
  };

  indexRoutes.generateApiKey = function(req, res){
    var apiKey = hat(bits=128, base=16);
 
    console.log("In generateApiKey", apiKey);
    console.log("User Session", req.session);
    console.log("User object", req.user);

    User.findOne({where:{id:req.user.id}}, function(err, result){
        if (err) {
          console.log("ERROR in saving API key!");
          res.writeHead(500);
          res.end("500 Internal Server Error error:", err);
        } else {
          console.log('Success in finding a user', result);
          result.apikey = apiKey;
          User.upsert(result, function (err, data) {
            if (err){
              console.log('** ERROR in updating user API key **');
              console.log("ERR!!! - ",err);
            } else{
              console.log('** user update with API key is successful ** ');
              res.send(apiKey);
            }
          });
        }
    })
  };

  indexRoutes.userTableMetaData = function(req, res){
    console.log("In userTableMetaData");
    res.writeHead(200);
    res.end();
  };

  return indexRoutes;

}

module.exports = index;


