
var dataDownloader = require('../helper/dataDownloader.js').dataDownloader;
var $ = require('jquery');
var scraper = require('scraper');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
// var phantom = require('node-phantom');
// var casper = require("casper").create();
// var casper = require('casper').create();

var startUrl = "http://data.sfgov.org/browse?limitTo=datasets&utf8=%E2%9C%93";
var pageCount = 0;

var scrapeUrls = function(urls,pageTotal) {
  var i, options, dbUrls=[];
  var controller = new EventEmitter();
  console.log(urls);
  options = {'reqPerSec': 0.2}; // Wait 5sec between each external request
  i = 0;
    scraper(urls, function(err, $, options) {
      if (err) {throw err;}
      console.log('downloading url from',urls[i]);
      $('[itemprop="url"]').each(function() {
        dbUrls.push([$(this).attr('href'), $(this).text().trim().replace(/[^A-Za-z\d\_]/g, '_')]);
      });
      i ++;
      controller.emit('urlDownload', i);
    });
  controller.on('urlDownload', function(i){
    console.log(i, 'pages downloaded');
    if (i >= urls.length) {
      console.log('download',dbUrls.length, 'urls from all pages');
//      fs.writeFileSync('dataUrl.txt',dbUrls.join('\n'), function(err){
//        if(err) throw err;
//      });
      downLoadCsv(dbUrls);
    }
  });
};

var downLoadCsv = function(urls) {
  var controller = new EventEmitter();
  var download = function(i){
    console.log('csvUrl', urls[i][0]);
    sfGovDownLoad(csvUrl(urls[i][0]), urls[i][1], '.csv', function() {
      sfGovDownLoad(jsonUrl(urls[i][0]), urls[i][1], '.json', function(){
        controller.emit('downloadNext', i);
      });
    });
  };

  download(0);

  controller.on('downloadNext',function(i){

    console.log('start downloading the ?th url', i);
    i += 1;
    if (i < urls.length) {
      download(i);
    }
  });
};

var csvUrl = function(url){
  var arr = url.split('/');
  return '/api/views/' + arr[arr.length-1] +'/rows.csv';
};

var jsonUrl = function(url){
  var arr = url.split('/');
  return '/api/views/' + arr[arr.length-1] +'/rows.json';
};


var generateUrls = function(baseUrl, start, end) {
  var arr = [];
  for (var i = start; i <= end; i ++) {
    arr.push(baseUrl + '&page=' + i);
  }

  return arr;
};

var sfGovDownLoad = function(path, title, filetype, cb) {
  var url = 'http://data.sfgov.org' + path;
  var filepath = '../sfGov/data/'+ title + filetype;
  console.log(url);
  dataDownloader(url, filepath, cb);
};
// downLoadCsv([[ 'https://data.sfgov.org/Transportation/Bicycle-Parking-Public-/w969-5mn4',
    // 'Bicycle_Parking__Public_' ]] );


// description = $('#infoBox').find('.currentViewName').text();

scrapeUrls(generateUrls(startUrl,2,15));

