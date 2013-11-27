var fs = require('fs');


var getAllKeys = function(obj,keysArr,vals, keychain) {
  var keysArr = keysArr || [];
  var vals = vals || [];
  var keychain = keychain || '';

  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; i ++) {
    var key = keys[i];
    var val = obj[key];
    if (val && Array.prototype.toString.call(val) === '[object Object]' && Object.keys(val).length !== 0) {
      getAllKeys(val, keysArr, vals, keychain + key + '__');//'_' is the separator between parent and kid keys
    } else {
      keysArr.push(keychain + key);
      if (typeof val === 'number') {
        vals.push(val);
      } else {
        vals.push("null");//replace null, undefined or {}

      }
    }
  }
  return[keysArr, vals];
};

var checkKeys = function(keyvals, checkKeys) {
  var parsedVals = [];
  var keys = keyvals[0];
  var vals = keyvals[1];
  var found = false;
  for (var i = 0; i < checkKeys.length; i ++) {
    for (var j = 0; j < keys.length; j ++) {
      if(checkKeys[i] === keys[j]) {
        parsedVals.push(vals[j]);
        found = true;
        break;
      }
    }
    if (found) {
        found = false;
        continue;
    }
    if (!found) {
      parsedVals.push("null");//must be a string rather than null val.
      found = false;
    }
  } 
    return parsedVals;
}

var checkCSVFolder = function(csvFolder) {
  fs.exists(csvFolder, function(exists){
    if (!exists) {
      fs.mkdir(csvFolder);
    }
  });
};

exports.checkCSVFolder = checkCSVFolder;
exports.getAllKeys = getAllKeys;
exports.checkKeys = checkKeys;


// var testObj = 
//       { area_statistics: {a:34,b:{bc:5}},
//         income: undefined,

//         age_and_sex: {a:333,c:444}  } ;
        
// var checkObj = 

//       { area_statistics: {a:34,b:{ac:3,bc:5}},
//         income: undefined,
//         housing: 4,
//         education: null,
//         race_and_ethnicity: {},
//         age_and_sex: {a:333,c:444}  } ;
        
// var a = checkKeys(getAllKeys(testObj),getAllKeys(checkObj)[0]);
// console.log(a);

