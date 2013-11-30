var datatypes = function (datum) {
  var data, type, i, point, datatypes = '';
  for (i = 0; i < datum.length; i ++) {
    data = datum[i];
    type = '';
    console.log(parseFloat(data));
    if (data !== 'NaN' && !isNaN(parseFloat(data))) {
      point = data.split('.')[1];
      console.log(point && point.length > 5);
      type = point && point.length > 5 ? 'FLOAT8':'FLOAT4';
    } else if (data === 'NaN') {
      type = 'FLOAT4';
    } else if (isNaN(parseFloat(data))) {
      if (data === 'true' || data === 'false') {
        type = 'BOOL';
      } else {
        type = (data.indexOf('-') !== -1 || data.indexOf(':') !== -1) ? 'TIME' : 'VARCHAR';
      }
    } else {
      type = '';
    }
    if (type === '') {
      console.log('unchecked data type');
      return;
    }
    datatypes += type;
    if (i < datum.length -1) {
      datatypes += ',';
    }
  }
  return datatypes;
};

exports.datatypes = datatypes;

// test = ['null','true','3.2342','2342142','assdf','saf:234'];
// console.log(datatypes(test));