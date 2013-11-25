/* GET home page */

var index = function(Models){
  var indexRoutes = {};
  var passwordHash = require('password-hash');
  var crypto = require('crypto');
  var q = require('q');
  var fs = require('fs');
  var csv = require('csv');

  var JobApplicant = Models.JobApplicant;
  var EmailToken = Models.EmailToken;
  var mailer = require('../util/sendEmail.js');

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

  indexRoutes.workerSignupVerify = function(req, res){
    console.log("In SignupVerify");
    EmailToken.findOne({where: {token: req.params['token']}},
      function (err, result) {
        if (err) {
          console.log("ERROR - workerSignupVerify aborted!!");
        }
        console.log("in workerSignupVerify");
        if (result === null){ //no email token found
          res.writeHead(404);
          res.end();
        } else{
          var newUser = new JobApplicant({
            name: result.name,
            email: result.email,
            password: result.password,
            account: "user" 
          });
          // console.log("RESULT***",result);
          JobApplicant.findOne({where: {email: newUser}}, 
            function (err, result) {
              if (err) {
                console.log("ERROR - creating (workerSignupVerify) user aborted!!");
                console.log("ERROR:",err);
              }
                console.log("in JobApplicant findOne");
              if (result === null) { // create user
                // console.log('result is null, we are creating a new user');
                newUser.save(function (err, data) {
                  if (err) console.log("ERR!!! - ",err);
                    console.log('** workerSignupVerify is successful ** ');
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
    console.log(req.body.password);
    console.log(req.body);
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

    console.log("before createToken");
    createToken().then(function(){

      console.log("In createToken");
      newEmailToken.token = token;
      newEmailToken.save(function (err) {
        if (err) {
          console.log("ERROR in saving new email token!!!");
          console.log("ERROR:",err);
        }
        console.log("good");
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
            console.log("ERROR in sending registration verification email to job applicant!!!");
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
    JobApplicant.findOne({email: req.query.email}, 'email', 
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

  indexRoutes.workerReadInfo = function(req, res){
    var jobApplicantModel = JobApplicant;
    var newUser = new jobApplicantModel(req.body);
    
    jobApplicantModel.findOne({name: newUser.name, email: newUser.email}, 'name email', 
      function (err, result) {
        if (err) {
          console.log("ERROR - read worker info aborted!!");
        }
        if (result !== null) {
          // console.log("*****DATA*****",data);
          res.writeHead(200);
          res.end(result);
        }
    });
  };

  indexRoutes.uploadFile = function(req, res){
    console.log("****uploadFile", req.files);

    var newPath = __dirname + "/../util/uploads/file1.csv";
    
    var readFile = function(){
      var deferred = q.defer();
      fs.readFile(req.files.csvFile.path, function (err, data) {
        var newPath = __dirname + "/../util/uploads/file1.csv";
        console.log("**new path", newPath);
        fs.writeFile(newPath, data, function (err) {
          deferred.resolve('deferred resolved!!');
          // res.render('login');
        });
      });
      return deferred.promise;
    }
    
    readFile()
    .then(function(){
      // parse csv file
      csv()
      .from.path(newPath, { delimiter: ',', escape: '"' })
      .to.stream(fs.createWriteStream(__dirname+'/sample.out'))
      .transform( function(row){
        row.unshift(row.pop());
        return row;
      })
      .on('record', function(row,index){
        console.log('#'+index+' '+JSON.stringify(row));
      })
      .on('close', function(count){
        // when writing to a file, use the 'close' event
        // the 'end' event may fire before the file has been written
        console.log('Number of lines: '+count);
      })
      .on('error', function(error){
        console.log(error.message);
      });
      res.render('login');
    })
  

  };

  return indexRoutes;

}

module.exports = index;


