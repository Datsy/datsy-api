var tableMetaHelper = function(){
  var helperObject = {};  

  helperObject.saveDatasetInDb = function(jsonMetadata) {
    
    var dataset         = new Dataset();
    dataset.url         = jsonMetadata.url;
    dataset.name        = jsonMetadata.name;
    dataset.title       = jsonMetadata.title;
    dataset.description = transformForPostgres(jsonMetadata.description);
    dataset.author      = jsonMetadata.author;
    dataset.user_id     = jsonMetadata.user_id;
    dataset.numcols     = jsonMetadata.numcols;
    
    dataset.save(function(err, dataset) {
      if(err) {
        console.log(err);
      } else {
        saveDatasetColumnsInDb(dataset);
      }
    });
  },

  helperObject.saveDatasetInDbFromFile = function(filepath) {
    var json = require(filepath);
    saveDatasetInDb(json);
  },

  helperObject.saveDatasetColumnsInDb = function(dataset) {
    for(var i = 0; i < dataset.columns.length; i++) {
      var column = dataset.columns[i];
      DatasetColumns.create({
        table_id: dataset.id,
        colName: column.name,
        colDatatype: column.datatype,
        colMeaning: column.meaning
      }, function(err, data) {
        if(err) {
          console.log(err);
        } else {
          return data;
        }
      });
    }
  },

  helperObject.getColumnsByDatatype = function(datatypeString) {
    return DatasetColumns.all({colDatatype: datatypeString}, function(err, DatasetColumns){
      if(err) {
        console.log(err);
      } else {
        return DatasetColumns;
      }
    });
  },

  helperObject.getDatasetsByTagName = function(tagName) {
    // tagName -> array of Datasets
    var tag = getTagByName(tagName);
    return DataTags.all({where: {id: tag.id, dataCategory: 'set'}}, function(err, DatasetIds){
      if(err) {
        console.log(err);
      } else {
        return Datasets.all({id: DatasetIds});
      }
    });
  },

  helperObject.getColumnsByTagName = function(tagName) {
    var tag = getTagByName(tagName);
    var tagId = tag.id;
    return DataTags.all({where: {id: tagId, dataCategory: 'column'}}, function(err, ColumnIds){
      if(err) {
        console.log(err);
      } else {
        return DatasetColumns.all({id: ColumnIds});
      }
    });
  },
  
  helperObject.getTagByName = function(tagName) {
    return Tags.findOne({where: {label: tagName}});
  }

  helperObject.transformForPostgres = function(string) {
    return string.replace("\n", " ");
  }

  return helperObject;

}