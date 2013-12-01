// Global require, module

var passwordHash = require('password-hash'),
    crypto = require('crypto'),
    q = require('q'),
    fs = require('fs'),
    csv = require('csv'),
    csvToDatabase = require('../helpers/csvToDatabase.js'),
    hat = require('hat'),
    mailer = require('../helpers/sendEmail.js'),

    User,
    Metadata,
    EmailToken,

    frontendControllers;


frontendControllers = {
  'init': function(Models) {
    User = Models.User;
    Metadata = Models.Metadata;
    EmailToken = Models.EmailToken;
  },

  'index': function(req, res) {
      res.render('index');
  },

  'loginSuccess': function(req, res) {
      req.session.passport.userType = "user";

      Metadata.Dataset.all({where: {user_id: req.user.id}}, function(err, datasets) {
        if (err) {
          res.writeHead(500);
          res.end("500 Internal Server Error error:", err);
        } else {

          User.all({where:{password: req.user.password}}, function(err, result) {
            if (err) {
              res.writeHead(500);
              res.end("500 Internal Server Error error:", err);
            } else {
              res.render('loginSuccessful', {
                datasets: datasets,
                apiKey: req.user.apikey
              });
            }
          });
        }
      });
  },

  'loginFail': function(req, res) {
    console.log('login fail route');
    res.writeHead(200);
    res.end('fail');
  },

  'userSignupVerify': function(req, res) {
    EmailToken.findOne({where: {token: req.params.token}},
      function (err, result) {
        if (err) {
          console.log("ERROR - userSignupVerify aborted!!");
        }

        if (result === null){ //no email token found
          res.writeHead(404);
          res.end();
        } else{
          var apiKey = hat(bits=128, base=16);
          var newUser = new User({
            name: result.name,
            email: result.email,
            password: result.password,
            account: "user",
            apikey: apiKey
          });

          User.findOne({where: {email: newUser.email}},
            function (err, result) {
              if (err) {
                console.log("ERROR - creating (userSignupVerify) user aborted!!");
                console.log("ERROR:",err);
              }

              if (result === null) { // create user
                newUser.save(function (err, data) {
                  if (err) console.log("ERR!!! - ",err);
                  res.render('login');
                });
              } else {
                console.log('That user exists: ', result);
                res.writeHead(500);
                res.end("500 Internal Server Error - user existed, could not create account");
              }
          });
        }
    });
  },

  'signup': function(req, res) {
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
        var confirmationLink = req.protocol + "://" + req.get('host') + req.url + "/" + newEmailToken.token;
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

        res.render('verifyEmail');
      });
    });
  },

  'checkEmailIfExists': function(req,res) {

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
  },

  'userReadInfo': function(req, res) {
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
  },

  'uploadFile': function(req, res) {
    // construct table meta json
    var d = new Date();
    var tableMetaData = {
      table_id: '',
      user_id: req.user.id,
      title: req.body.table_title,
      description: req.body.table_description,
      author: req.body.table_author,
      url: req.body.table_url,
      row_count: 100000, // hardcoded for now
      col_count: 6, //hardcoded for now
      created_at: d.toUTCString(),
      columns:[]
    };

    var newPath = __dirname + "/../helpers/uploads/file1.csv";
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
    };

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
        if(index===0){
          console.log("****TABLE ID", row[0]);
          tableMetaData.table_id = row[0];
          console.log("****TABLE ID", tableMetaData.table_id);
        }
        if (index===1){
          for(var i = 0; i < row.length; i++){
            var colObj = {
              "name": row[i],
              "datatype": "String",
              "description": row[i]
            };
            tableMetaData.columns.push(colObj);
          }
        }
      })
      .on('close', function(count){
        // when writing to a file, use the 'close' event
        // the 'end' event may fire before the file has been written
        console.log("***********tableMetaData", tableMetaData);
        csvToDatabase(newPath);
        Metadata.saveDataset(tableMetaData);
        console.log('Number of lines: '+count);
/////////
        var apiKey;
        var userTableMetaData;

        // read table meta data
        Metadata.Dataset.all({where:{user_id:req.user.id}}, function(err,result){
          if (err) {
            console.log("ERROR in reading Metadata.Dataset!");
            console.log(err);
            res.writeHead(500);
            res.end("500 Internal Server Error error:", err);
          } else {
            userTableMetaData = result;
            User.findOne({where:{id:req.user.id}}, function(err, result){
              if (err) {
                console.log("ERROR in reading API key!");
                res.writeHead(500);
                res.end("500 Internal Server Error error:", err);
              } else {
                console.log('Success in finding a user', result);
                apiKey = result.apikey;
                res.render('loginSuccessful', {tableMetaData: userTableMetaData,
                  apiKey: apiKey});
              }
            });
          }
        });
///////
      })
      .on('error', function(error){
        console.log(error.message);
      });
    });
 },

 'generateApiKey': function(req, res) {
    var apiKey = hat(bits=128, base=16);

    User.findOne({where:{password: req.user.password}}, function(err, user) {
        if (err) {
          console.log("ERROR in saving API key!");
          res.writeHead(500);
          res.end("500 Internal Server Error error:", err);
        } else {
          user.apikey = apiKey;
          User.upsert(user, function (err, data) {
            if (err){
              console.log('** ERROR in updating user API key **');
              console.log("ERR!!! - ",err);
            } else{
              console.log('** user update with API key is successful ** ');
            }

            return;
          });
        }
    });
  },

  'userTableMetaData': function(req, res) {
    console.log("In userTableMetaData");
    res.writeHead(200);
    res.end();
  }
};

module.exports = frontendControllers;
