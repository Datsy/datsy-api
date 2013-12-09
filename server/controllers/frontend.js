// Global require, module

var passwordHash = require('password-hash'),
    crypto = require('crypto'),
    q = require('q'),
    fs = require('fs'),
    csv = require('csv'),
    csvToDatabase = require('../helpers/csvToDatabase.js'),
    csvLoader = require('../helpers/csvLoader.js'),
    hat = require('hat'),
    mailer = require('../helpers/sendEmail.js'),
    middleware = require('../middleware/middleware.js'),
    binaryCSV = require('binary-csv'),
    tagSearch = require('./api_tags.js'),
    metaSearch = require('./api_meta.js'),
    User,
    Metadata,
    EmailToken,
    schema,
    frontendControllers,
    EventEmitter = require('events').EventEmitter,
    indexController = require('./index_controller.js');

var Schema = require('jugglingdb').Schema;
var _ = require("underscore");

var updateSchema = function(){
    var deferred = q.defer();
    console.log("updating schema");

    schema.autoupdate(function(msg){
      console.log("*** db schema update completed");
      deferred.resolve('deferred resolved!!');
    });

    return deferred.promise;
};

frontendControllers = {
  'init': function(Models, dataSchema) {
    User = Models.User;
    Metadata = Models.Metadata;
    EmailToken = Models.EmailToken;
    schema = dataSchema;
  },

  'index': function(req, res) {
    indexController.init0(User, Metadata, EmailToken, schema);
    indexController.init(req, res);
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
      haveFile: false,
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
              var view_count = 0;
              for (var i = 0; i < datasets.length; i++) {
                view_count += +datasets[i].view_count;
              }
              res.render('profile', {
                datasets: datasets,
                view_count: view_count,
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
          console.log("ERROR - no email token found!!");
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
    var csvPath = req.files.uploadFile.path,
        parser = binaryCSV(),
        count = 0,
        columns;

    var stream = fs.createReadStream(csvPath).pipe(parser)
      .on('data', function(line) {
        if (count === 0) {
          columns = line.toString().split(',');
          count++;
        } else {
          count++
        }
      })
      .on('close', function() {
        res.render('newdataset', {
          isAuthenticated: true,
          columns: columns,
          path: csvPath,
          count: count,
          file: req.files.uploadFile.name,
          user: {
            username: req.user.name
          }
        });
      });
  },

  'saveDataset': function(req, res) {
    var controller = new EventEmitter();

    // Construct metadata JSON object
    console.log("****req.body:", req.body);
    var tableMetaData = {
      user_id: req.user.id,
      title: req.body.dataset_title,
      description: req.body.dataset_description,
      author: req.body.dataset_author,
      url: req.body.dataset_url,
      created_at: (new Date()).toUTCString(),
      last_accessed: (new Date()).toUTCString(),
      row_count: req.body.count-1,
      view_count: 0,
      stars: 0
    };

    tableMetaData.table_name = tableMetaData.title.replace(/ /g, '_').replace(/\'/g, '').toLowerCase();
    tableMetaData.tags = req.body.dataset_tags.toLowerCase().split(',');
    // Save the selected CSV file to the server

    console.log("tableMetaData.table_name:", tableMetaData.table_name);
    console.log("tableMetaData.tags:", tableMetaData.tags);
    var csvPath = req.body.uploadFile;

    tableMetaData.columns = [];
    for (key in req.body) {
      if (req.body.hasOwnProperty(key) && key.match('column_')) {
        tableMetaData.columns.push({
          name: key.split('column_')[1],
          description: key.split('column_')[1],
          datatype: req.body[key]
        });
      }
    }

    // Set the col_count

    tableMetaData.col_count = tableMetaData.columns.length;

    // Save to the datastore

    csvLoader.saveDataset(csvPath, schema, tableMetaData, controller);
    controller.on('csvSaved', function(){
      // Save the metadata
      console.log('end csv, start saveDataset');
      Metadata.saveDataset(tableMetaData, controller);
      
    });

    controller.on('metaDataSaved', function(){
      console.log('end saveDataset, start giving res');

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
    });
    // Read table meta data

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

  'apiSearchMeta': function(req, res){
    metaSearch.init({
      User: User,
      Metadata: Metadata,
      EmailToken: EmailToken});

    metaSearch.restartSchema();

    console.log("In apiSearchMeta");
    console.log("Query String parameters:", req.query.tag);
      // 1) GET search/meta
      // 2) GET search/meta?tag=<tagname>
      // 3) GET search/meta?tag=<tagname>&tag=<tagname>
    var tag = req.query.tag;
    if(tag === undefined) {
      metaSearch.getAllMeta(req,res);
    } else if (typeof tag === 'string') {
      metaSearch.getSomeMeta(frontendControllers.cleanTags([tag]),req,res);
    } else if (Array.isArray(tag)){
      metaSearch.getSomeMeta(frontendControllers.cleanTags(tag),req,res);
    }
  },

  cleanTags: function(tags){
    var filtered = [];
    for (var i = 0; i < tags.length; i ++) {
      filtered.push(tags[i].replace(/[^a-zA-Z0-9 ]|^\s*|\s*$/g, '').toLowerCase());
    }
    return filtered;
  },

  'apiSearchTags': function(req, res){
    tagSearch.init({
      User: User,
      Metadata: Metadata,
      EmailToken: EmailToken});
    tagSearch.restartSchema();
    // console.log(typeof req.query.tag,'tag');
      // 1) GET search/tag
      // 2) GET search/tag?tag=<tagname>
      // 3) GET search/tag?tag=<tagname>&tag=<tagname>
    var tag = req.query.tag;
    if(tag === undefined) {
      tagSearch.getAllTags(req,res);
    } else if (typeof tag === 'string') {
      tagSearch.getSomeTags(frontendControllers.cleanTags([tag]),req,res);
    } else if (Array.isArray(tag)){
      tagSearch.getSomeTags(frontendControllers.cleanTags(tag),req,res);
    }
  }, 

  'apiSearchTable': function(req, res){
    var metaDataResult = {};
    var finalMetaDataResult = {};
    var resultLength = 0;
    var expectedResultLength = undefined;
    var rowNumber;
    var filterColumn = [];
    var tableNameNotValid = false;
    var returnedData = null;

    if (req.query.name !== undefined){
      // setup number of row to return
      if (req.query.row === undefined){
        // if row is not specified, default to this
        rowNumber = 5;    
      } else if (req.query.row === "ALL"){
        // this will read all rows
        rowNumber = '';
      } else {
        rowNumber = req.query.row;
      }

      // set up column type to return
      if (req.query.column === undefined){
        // if column is not specified, default to an empty array
        filterColumn = [];
      } else {
        if (typeof req.query.column === "string"){
          filterColumn.push(req.query.column);
        } else {
          filterColumn = req.query.column;
        }
      }

      var result = Metadata.Dataset.all({where:{table_name: req.query.name}}, function(err, data){
        console.log(req.query.name,'name');
        if (err) {
          console.log("Error in reading Metadata.Dataset:", err);
        } else if (data.length === 0){
          var message = "ERROR: table name doesn't exist";
          console.log(message);
          tableNameNotValid = true;
          returnedData = message;
        } else {
          expectedResultLength = data.length;
          resultLength = data.length;
          for (var i = 0; i < data.length; i++){
            metaDataResult[data[i].id] = {tableMeta: data[i]};
            // metaDataResult.push(metaData);
            var j = i;

            (function(j){

              Metadata.DataColumn.all({where:{dataset_id:data[0].id}}, function(err, data){
                if (err) {
                  console.log("Error in reading Metadata.DataColumn:", err);
                }
                // console.log("Data in reading Metadata.DataColumn:", data);
                var columnDefines = {};
                var currentDatasetId = data[j].dataset_id;
                for(var i = 0; i < data.length; i++){
                  columnDefines[data[i].name] = {type: data[i].datatype};
                }
                var thisTable = schema.define(metaDataResult[currentDatasetId]["tableMeta"]["table_name"],columnDefines);

                updateSchema().then(function(){
                  thisTable.all({limit:rowNumber}, function(err, data){
                    if (err) {
                      console.log("Error in reading thisTable.all:", err);
                    }
                    // console.log("Data in reading thisTable.all:", data);

                    metaDataResult[currentDatasetId]["row"] = data;
                    if (filterColumn.length != 0){
                      metaDataResult[currentDatasetId]["row"] = filterDatabaseColumn(metaDataResult[currentDatasetId]["row"], filterColumn);
                    };
                    finalMetaDataResult["Result"] = metaDataResult[currentDatasetId];
                    // console.log("Final Meta Data Result:", finalMetaDataResult["Result"]);
                    returnedData = finalMetaDataResult;
                  });
                });
              })
            })(j);
          }
        }
      });
  
      var doneId = setInterval(function(){
          console.log("This doneId = setInterval keep running");
          if ((resultLength === expectedResultLength || tableNameNotValid === true) && (returnedData !== null)) {
            console.log("This doneId = setInterval is CLEARED!!");
            clearInterval(doneId);
            res.send(returnedData);
          }
        }
        ,3000
      );

    } else {
      var message = "ERROR: the query string, 'name' is not found in the endpoint request";
      returnedData = message;
      res.send(returnedData); 
    }

    var filterDatabaseColumn = function(rowResult, filter){
      var newRowResult = [];
      var tempRow = {};
      for (var i = 0; i < rowResult.length; i++){
        for (var j = 0; j < filter.length; j++){
          if (rowResult[i][filter[j]] !== undefined){
            tempRow[filter[j]] = rowResult[i][filter[j]];
          }
        }
        newRowResult.push(tempRow);
        tempRow = {};
      }
      return newRowResult;
    }
  }
};


module.exports = frontendControllers;

