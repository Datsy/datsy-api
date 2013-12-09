var Schema = require('jugglingdb').Schema,
    User,
    Metadata,
    EmailToken,
    schema,
    Tag,
    Dataset,
    EventEmitter = require('events').EventEmitter;
var apiControllers = {
  'init': function(Models) {
    User = Models.User;
    Metadata = Models.Metadata;
    EmailToken = Models.EmailToken;
    console.log('init apitag search');
  },

  restartSchema: function(){
    // schema = new Schema('postgres', {
    //   username: "masterofdata",
    //   password: "gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234",
    //   host: "137.135.14.92",
    //   database: "datsydata"
    // });

    // Tag = schema.define('datasettag', {
    //   label: {type: String, unique: true}
    // });

    // Dataset = schema.define('datasetmeta', {
    //   table_name: {type: String, unique: true},
    //   user_id: {type: Number},
    //   url: {type: String},
    //   title: {type: String},
    //   description: {type: String},
    //   author: {type: String},
    //   created_at: {type: Date},
    //   last_access: {type: Date},
    //   view_count: {type: Number},
    //   star_count: {type: Number},
    //   row_count: {type: Number},
    //   col_count: {type: Number}, 
    //   last_viewed:{type: Date},
    //   view_count:{type: Number},
    //   token: {type: String}
    // });

    // Dataset.hasAndBelongsToMany(Tag, {as: 'datasettag', foreignKey: 'tag_id'});
    // Tag.hasAndBelongsToMany(Dataset, {as: 'dataset', foreignKey: 'datasettag_id'});

  },

  getAllTags : function(req, res) {
    console.log("Retrieving all tags...");
    var controller = new EventEmitter();

    var result = {
      tag: [],
      total: 0
    };
    var tagsID = [];

  //query  the datasettag db to get all tags
    Metadata.Tag.all(function(err, data) {
      if(err) {
        res.send("500 Internal Server Error error:", err);
      } else {
        if (data.length === 0) {
          res.send(result);
          return;
        }
        for(i = 0; i < data.length; i++) {
          result.tag.push(data[i].label);
          tagsID.push(data[i].id);
        }
        apiControllers.getMetaTableIDwithTagID(tagsID, controller);
      }
    });

    controller.on('getMetaTableId',function(metaTablsIds){
      result.total = metaTablsIds.length;
      res.send(result);
    });
  },

  getSomeTags: function(tags,req,res) {
    var controller = new EventEmitter(),
        tagIDs = [],
        tagsLeft = tags.length,
        result = {
          tag: [],
          total: 0
        };
    for (var i = 0; i < tags.length; i ++) {
      Metadata.Tag.all({where:{label: tags[i]}}, function(err, data) {
        if(err) {
          res.send("500 Internal Server Error error:", err);
        } else {
          if (data.length === 0) {
            res.send(result);
            return;
          }
          for (var j = 0; j < data.length; j ++) {
            tagIDs.push(data[j].id);
          }
          tagsLeft --;
          
          var intervalID = setInterval(function(){
            if (tagsLeft === 0) {
              apiControllers.getMetaTableIDwithSearchTagID(tagIDs,controller);
              clearInterval(intervalID);
            }
          }, 100);
        }
      });
    }

    controller.on('getMetaTableId',function(metaTablsIds){
      result.total = metaTablsIds.length;
      apiControllers.getTagsWithMetaTableID(metaTablsIds,controller);
    });

    controller.on('getTagsWithMetaTableID',function(filteredTagsIDs){
      apiControllers.getTagNameWithID(filteredTagsIDs, controller);
      // res.send(result);
    });

    controller.on('getTagNameWithID',function(tagLabels){
      result.tag = tagLabels;
      res.send(result);
    });
  },

  getTagNameWithID: function(tags, controller) {
    var tagLabels = [],
        tagsLeft = tags.length;
    for (var i = 0; i < tags.length; i ++) {
      Metadata.Tag.all({where:{id: tags[i]}}, function(err, data) {
        if(err) {
          res.send("500 Internal Server Error error:", err);
        } else {
          for (var j = 0; j < data.length; j ++) {
            tagLabels.push(data[j].label);
          }
          tagsLeft --;
        }
      });
    }

    var intervalID = setInterval(function(){
      if (tagsLeft === 0) {
        controller.emit('getTagNameWithID', tagLabels);
        clearInterval(intervalID);
      }
    }, 100);

  },

  getTagsWithMetaTableID: function(metaTablsIds,controller) {
    var i,j,tag,seenId, dataLeft = metaTablsIds.length, obj = {};
    for(i = 0; i < metaTablsIds.length; i ++) {
      dataset = new Metadata.Dataset({id:metaTablsIds[i]});
      dataset.datasettag(function(err,tag) {
        for(j = 0; j < tag.length; j ++) {
          seenId = tag[j].id;
          if (!obj[seenId]) {
            obj[seenId] = true;
          }
        }
        dataLeft --;
      });
    }

    var intervalID = setInterval(function(){
      if (dataLeft === 0) {
        controller.emit('getTagsWithMetaTableID',Object.keys(obj));
        clearInterval(intervalID);
      }
    }, 100);
  },

  getMetaTableIDwithTagID: function(tagIDs, controller) {
    var i,j,tag,seenId, dataLeft = tagIDs.length, obj = {};
    for(i = 0; i < tagIDs.length; i ++) {
      tag = new Metadata.Tag({id:tagIDs[i]});
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
        controller.emit('getMetaTableId',Object.keys(obj));
        clearInterval(intervalID);
      }
    }, 100);
  },

  getMetaTableIDwithSearchTagID: function(tagIDs, controller) {
    //to fix. 
    var filterController = new EventEmitter();
    var i,j,tag,seenId, dataLeft = tagIDs.length, obj = {};
    for(i = 0; i < tagIDs.length; i ++) {
      tag = new Metadata.Tag({id:tagIDs[i]});
      tag.dataset(function(err,dataset) {
        var currentSet = {};
        for(j = 0; j < dataset.length; j ++) {
          currentSet[dataset[j].id] = true;
        }
        dataLeft --;
        filterController.emit('searchNext', currentSet)
      });
    }

    filterController.on('searchNext', function(currentSet){

      if (dataLeft === tagIDs.length -1) {
        obj = currentSet;
      } else {
        for (var key in obj) {
          if (currentSet[key] === undefined) {obj[key] = false};
        }
      }

      if(dataLeft === 0) {
        var filteredMetaIDs = [];
        for (var key in obj) {
          if (obj[key]) {filteredMetaIDs.push(key); }
        }
        controller.emit('getMetaTableId',filteredMetaIDs);
      }
    });
  }

};

module.exports = apiControllers;
