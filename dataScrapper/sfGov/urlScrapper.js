title = $('#infoBox').find('.clipText').attr('title');
description = $('#infoBox').find('.currentViewName').text();
var dataDownloader = require('../helper/dataDownloader.js').dataDownloader;


var getURL = function (tag, pageUrl) {
  $('.sidebarOptionsContainer').find('a.export').trigger('click');//this must be triggered in domReady.
  $cellInner = $('.cellInner');
  return $cellInner.length <= 1? '' : $cellInner.find("[data-type=" + tag + "]").attr('href');
};

var downLoad = function() {
  var title = $('#infoBox').find('.clipText').attr('title');
  title = title.replace(/[^A-Za-z\d/_]/g, '_');
  
  //csv for original formated file, json for metadata(raw);
  sfGovDownLoad(getURL('CSV'), title, '.csv', function(){
    sfGovDownLoad(getURL('CSV'), title, '.json');
  });
};

var sfGovDownLoad = function(path, title, filetype, cb) {
  var url = 'http://data.sfgov.org' + path;
  var filepath = '../sfGov/'+ title + filetype;
  dataDownloader(url, filepath, cb);
};


