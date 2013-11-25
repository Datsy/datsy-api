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
      getAllKeys(val, keysArr, vals, keychain + key + '-');//'_' is the separator between parent and kid keys
    } else {
      keysArr.push(keychain + key);
      if (typeof val === 'number') {
        vals.push(val);
      } else {
        vals.push('');//replace null, undefined or {}
      }
    }
  }
  return[keysArr, vals];
};

var checkCSVFolder = function(csvFolder) {
  fs.exists(csvFolder, function(exists){
    if (!exists) {
      fs.mkdir(csvFolder);
    }
  });
};

exports.checkCSVFolder = checkCSVFolder;
exports.getAllKeys = getAllKeys;

// var testObj = 
//   { demographics: 
//       { area_statistics: {a:34,b:{ac:3,bc:5}},
//         income: undefined,
//         housing: 4,
//         education: null,
//         race_and_ethnicity: {},
//         age_and_sex: {a:333,c:444}  } };
// console.log(getAllKeys(testObj)[1].join(','));

