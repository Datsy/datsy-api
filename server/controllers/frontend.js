// Global require, module

var passwordHash = require('password-hash'),
    crypto = require('crypto'),
    q = require('q'),
    fs = require('fs'),
    csv = require('csv'),
    csvToDatabase = require('../helpers/csvToDatabase.js'),
    hat = require('hat'),
    mailer = require('../helpers/sendEmail.js'),
    middleware = require('../middleware/middleware.js'),

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
    if (!middleware.isAuth(req)) {
      res.render('index');
    } else {
      res.render('index', {
        isAuthenticated: true,
        user: {
          username: req.user.name
        }
      });
    }
  },

  'login': function(req, res) {
    res.render('login');
  },

  'about': function(req, res) {
    if (!middleware.isAuth(req)) {
      res.render('about');
    } else {
      res.render('about', {
        isAuthenticated: true,
        user: {
          username: req.user.name
        }
      });
    }
  },

  'newdataset': function(req, res) {
    res.render('newdataset', {
      isAuthenticated: true,
      user: {
        username: req.user.name
      }
    });
  },

  'profile': function(req, res) {
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
              res.render('profile', {
                datasets: datasets,
                apiKey: req.user.apikey,
                isAuthenticated: true,
                user: {
                  username: req.user.name
                }
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

    // Construct metadata JSON object

    var tableMetaData = {
      user_id: req.user.id,
      title: req.body.dataset_title,
      description: req.body.dataset_description,
      author: req.body.dataset_author,
      url: req.body.dataset_url,
      row_count: 0, // hardcoded for now
      col_count: 0, //hardcoded for now
      created_at: (new Date()).toUTCString()
    };

    tableMetaData.table_name = tableMetaData.title.replace(/ /g, '_').toLowerCase();
    tableMetaData.tags = req.body.dataset_tags.split(',');

    // Save the selected CSV file to the server

    var csvPath = req.files.uploadFile.path;

    var readFile = function(){
      var deferred = q.defer();
      fs.readFile(req.files.uploadFile.path, function (err, data) {
        fs.writeFile(csvPath, data, function (err) {
          deferred.resolve('deferred resolved!!');
        });
      });
      return deferred.promise;
    };

    readFile()
    .then(function() {
      // Parse csv file

      csv()
      .from.path(csvPath, { delimiter: ',', escape: '"' })
      .on('record', function(row, index) {
        if (index === 1) {
          tableMetaData.columns = [];
          for(var i = 0; i < row.length; i++) {
            tableMetaData.columns.push({
              name: row[i],
              description: row[i]
            });
          }
        } else if (index === 2) {
          for(var j = 0; j < row.length; j++) {
            tableMetaData.columns[j].datatype = row[j];
          }
        }
      })
      .on('end', function(count) {
    console.log('PASSING THE FILE TO CSVTODATABASE');
        csvToDatabase(csvPath);
    console.log('PASSING THE FILE TO METADATA MODEL');
        Metadata.saveDataset(tableMetaData);


        // Read table meta data

        Metadata.Dataset.all({where:{user_id: req.user.id}}, function(err, datasets) {
          if (err) {
            res.writeHead(500);
            res.end("500 Internal Server Error error:", err);
          } else {
            if (!middleware.isAuth(req)) {
              res.render('index');
            } else {
              res.render('profile', {
                datasets: datasets,
                isAuthenticated: true,
                apiKey: req.user.apikey,
                user: {
                  username: req.user.name
                }
              });
            }
          }
        });
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
  },

  'getAllTags': function(req, res) {
    console.log("Retrieving all tags...");
    Metadata.Tags.all(function(err, result){
      if(err) {
        res.writeHead(500);
        res.end("500 Internal Server Error error:", err);
      } else {
        console.log("Successfully retrieved all tags.");
        res.writeHead(200);
        res.render('', {}); // create new view?
      }
    });
  }
};


module.exports = frontendControllers;

