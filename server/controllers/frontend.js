var passwordHash = require('password-hash'),
    crypto = require('crypto'),
    q = require('q'),
    fs = require('fs'),
    csvLoader = require('../helpers/csvLoader.js'),
    hat = require('hat'),
    mailer = require('../helpers/sendEmail.js'),
    middleware = require('../middleware/middleware.js'),
    binaryCSV = require('binary-csv'),
    tagSearch = require('./api_tags.js'),
    metaSearch = require('./api_meta.js'),

    User,
    Dataset,
    Tag,
    Column,
    EmailToken,
    models,
    schema,

    frontendControllers,

    EventEmitter = require('events').EventEmitter,
    indexController = require('./index_controller.js');


frontendControllers = {

  'index': function(req, res) {
    indexController.init0(models);
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
          username: req.user[0].name
        }
      });
    }
  },


  'newdataset': function(req, res) {
    res.render('newdataset', {
      isAuthenticated: true,
      haveFile: false,
      user: {
        username: req.user[0].name
      }
    });
  },


  'profile': function(req, res) {
    req.session.passport.userType = "user";

    Dataset.findAll({
      where: { user_id: req.user[0].id }
    }).success(function(datasets) {
      console.log('found datasets');
      User.findAll({
        where:{password: req.user[0].password}
      }).success(function(user) {
        res.render('profile', {
          datasets: datasets,
          apiKey: user[0].api_key,
          isAuthenticated: true,
          user: {
            username: user[0].name
          }
        });
      });
    });
  },


  'loginFail': function(req, res) {
    console.log('login fail route');
    res.writeHead(200);
    res.end('fail');
  },


  'userSignupVerify': function(req, res) {

    EmailToken.find({
      where: {token: req.params.token}
    }).success(function(emailtoken) {
        if (emailtoken) {
          var apiKey = hat(bits=128, base=16);

          User.create({
            name: emailtoken.name,
            email: emailtoken.email,
            password: emailtoken.password,
            account: "user",
            api_key: apiKey
          }).success(function(user) {
             console.log('success!');
             res.render('login');
          });
        } else{
          res.writeHead(404);
          res.end();
        }
    });
  },


  'signup': function(req, res) {
    var token;
    crypto.randomBytes(20, function(ex, buf) {
      token = buf.toString('hex');

      EmailToken.create({
        name: req.body.name,
        email: req.body.email,
        password: passwordHash.generate(req.body.password),
        token: token
      }).success(function(emailtoken) {
        var confirmationLink = req.protocol + "://" +
            req.get('host') + req.url + "/" + emailtoken.token;

        var locals = {
          email: emailtoken.email,
          subject: 'Verify your Datsy account',
          name: emailtoken.name,
          confirmationLink: confirmationLink
        };

        mailer.sendOne('registrationVerif', locals, function(err, responseStatus, html, text) {
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
            username: req.user[0].name
          }
        });
      });
  },


  'saveDataset': function(req, res) {
    var controller = new EventEmitter();

    // Construct metadata JSON object

    var metadata = {
      table_name: req.body.dataset_title.replace(/ /g, '_').toLowerCase(),
      url: req.body.dataset_url,
      title: req.body.dataset_title,
      description: req.body.dataset_description,
      author: req.body.dataset_author,
      created_at: (new Date()).toUTCString(),
      view_count: 0,
      star_count: 0,
      row_count: req.body.count,
      col_count: 0,
      user_id: req.user[0].id
    };

    metadata.tags = req.body.dataset_tags.split(',');

    metadata.columns = [];
    for (key in req.body) {
      if (req.body.hasOwnProperty(key) && key.match('column_')) {
        metadata.columns.push({
          name: key.split('column_')[1],
          description: key.split('column_')[1],
          datatype: req.body[key]
        });
      }
    }

    metadata.col_count = metadata.columns.length;


    // Save to the datastore

    var csvPath = req.body.uploadFile;
    csvLoader.saveDataset(csvPath, metadata, models, function() {

      // Save the metadata

      models.saveDataset(metadata, function() {

        // Redirect to '/profile' with updated dataset object

        Dataset.findAll({
          where:{user_id: req.user[0].id}
        }).success(function(datasets) {
          if (!middleware.isAuth(req)) {
            res.render('index');
          } else {
            res.render('profile', {
              datasets: datasets,
              isAuthenticated: true,
              apiKey: req.user[0].api_key,
              user: {
                username: req.user[0].name
              }
            });
          }
        });
      });
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

  cleanTags: function(tags) {
    var filtered = [];
    for (var i = 0; i < tags.length; i ++) {
      filtered.push(tags[i].replace(/[^a-zA-Z0-9 ]|^\s*|\s*$/g, '').toLowerCase());
    }
    return filtered;
  },

  'apiSearchTags2': function(req, res){
    console.log("Retrieving all tags...");
    var result = {
      tag: [],
      total: 0
    };
    Metadata.Tag.all(function(err, data){
      if(err) {
        res.send("500 Internal Server Error error:", err);
      } else {
        console.log("Successfully retrieved all tags.");
        var i,j,tag, dataLeft = data.length, obj = {};

        for(i = 0; i < data.length; i++) {
          result.tag.push(data[i].label);
          tag = new Metadata.Tag({id:data[i].id});
          tag.dataset(function(err,dataset) {
            for(j = 0; j < dataset.length; j ++) {
              seenId = dataset[j].id;
              if (!obj[seenId]) {
                obj[seenId] = true;
              }
            }
            dataLeft --;
          });
        }
        var intervalID = setInterval(function(){
          if (dataLeft === 0) {
            result.total = Object.keys(obj).length;
            res.send(result);
            clearInterval(intervalID);
          }
        }, 100);
      }
    });
  },

  'apiSearchTags': function(req, res){
    tagSearch.init({
      User: User,
      Metadata: Metadata,
      EmailToken: EmailToken});
    tagSearch.restartSchema();
    console.log(typeof req.query.tag,'tag');
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
        if (err) {
          console.log("Error in reading Metadata.Dataset:", err);
        }
          console.log("Data in reading Metadata.Dataset:", data);
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
              console.log("Data in reading Metadata.DataColumn:", data);
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
                  console.log("Data in reading thisTable.all:", data);

                  metaDataResult[currentDatasetId]["row"] = data;
                  if (filterColumn.length != 0){
                    metaDataResult[currentDatasetId]["row"] = filterDatabaseColumn(metaDataResult[currentDatasetId]["row"], filterColumn);
                  };
                  finalMetaDataResult["Result"] = metaDataResult[currentDatasetId];
                  console.log("Final Meta Data Result:", finalMetaDataResult["Result"]);
                  res.send(finalMetaDataResult);
                });
              });
            })
          })(j);
        }
      });

      var doneId = setInterval(function(){
          if (resultLength === expectedResultLength){
            clearInterval(doneId);
          }
        }
        ,3000
      );
    } else {
      var message = "ERROR: the query string, 'name' is not found in the endpoint request";
      res.send(message);
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



module.exports = function(Models) {
    User = Models.User;
    Dataset = Models.Dataset;
    Tag = Models.Tag;
    Column = Models.Column;
    EmailToken = Models.EmailToken;
    models = Models;
    schema = Models.sequelize;

    return frontendControllers;
}
