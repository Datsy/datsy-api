var phantom = require('phantom');

var phantomScrape = function(urls){
  var i = 0;
  phantom.create(function(ph) {
     ph.createPage(function(page) {
      openPageGetUrl(page, urls[i]);
      var intervalID = setInterval(function() {
        if (urlLeft === 0) {
          i += 1;
          if (i < urls.length) { openPageGetUrl(page, urls[i]); }
        }
        if (i === urls.length) {
          ph.exit();
          clearInterval(intervalID);
        }
      }, 100);
    });
  });
};

var openPageGetUrl = function(page, url){
  page.open(url, function(status) {
    console.log("opening webpage", url, status);
    page.render('./screenshot/temp.jpg',function() { //the first variable saves an screenshot to the file specified.
      extractDBUrl();
    });
  });
};

////////////////////////////////this following files break b/c it cannot trigger click event with jsdom.
//jsdom does not do ajax call.

var dataDownloader = require('../helper/dataDownloader.js').dataDownloader;
var $ = require('jquery');
var scraper = require('scraper');
var EventEmitter = require('events').EventEmitter;
var phantom = require('phantom');

var startUrl = "http://data.sfgov.org/browse?limitTo=datasets&utf8=%E2%9C%93";
var pageCount = 0;

var scrapeUrls = function(urls,pageTotal) {
  var urlLeft, options, dbUrls=[];
  var controller = new EventEmitter();
  urlLeft = urls.length;
  options = {'reqPerSec': 0.2}; // Wait 5sec between each external request
  scraper(urls, function(err, $, options) {
      if (err) {throw err;}

      $('[itemprop="url"]').each(function() {
        dbUrls.push($(this).attr('href'));
      });
      urlLeft --;
      controller.emit('urlDownload', urlLeft);
  });

  controller.on('urlDownload', function(i){
    console.log(dbUrls[i], 'pages needs to be downloaded');
    if (i === 0) {
      console.log('download url from all pages');
      console.log(dbUrls.length);
      downLoadCsv(dbUrls);
    }
  });
};

var downLoadCsv = function(urls) {
  var urlLeft, options, dbUrls=[];
  var controller = new EventEmitter();
  urlLeft = urls.length;
  // options = {'reqPerSec': 0.2}; // Wait 5sec between each external request
  var scrapeCSV = function(url){
    scraper(url, function(err, $) {
        if (err) {throw err;}
        urlLeft --;
        downLoad($,controller, urlLeft);
    });
  };

  scrapeCSV(urls[0]);
  controller.on('downloadNext', function(i){
    console.log(urls[urls.length - i], 'pages needs to be downloaded in downLoadCSV');
    if (i <= 0) {
      console.log('download url from all pages in downLoadCSV');
    } else {
      scrapeCSV(urls[urls.length -i]);
    }
  });

};

var phantomScrape = function(urls){
  var i = 0;
  phantom.create(function(ph) {
     ph.createPage(function(page) {
      openPageGetUrl(page, urls[i]);
      var intervalID = setInterval(function() {
        if (urlLeft === 0) {
          i += 1;
          if (i < urls.length) { openPageGetUrl(page, urls[i]); }
        }
        if (i === urls.length) {
          ph.exit();
          clearInterval(intervalID);
        }
      }, 100);
    });
  });
};

var openPageGetUrl = function(page, url){
  page.open(url, function(status) {
    console.log("opening webpage", url, status);
    page.render('./screenshot/temp.jpg',function() { //the first variable saves an screenshot to the file specified.
      extractDBUrl();
    });
  });
};

var generateUrls = function(baseUrl, pageTotal) {
  var arr = [];
  for (var i = 1; i <= pageTotal; i ++) {
    arr.push(baseUrl + 'page=' + i);
  }
  return arr;
};

var downLoad = function($,controller, urlLeft) {
  var title = $('#infoBox').find('.clipText').attr('title');
  title = title.replace(/[^A-Za-z\d/_]/g, '_');
  console.log('title', title);
  //csv for original formated file, json for metadata(raw);
  console.log('csvUrl',getURL($,'CSV'));

  getURL($,'CSV',controller);

  controller.on('initDownLoad', function(hrefs){
    if (hrefs[0] && hrefs[1]) {
      sfGovDownLoad(href, title, '.csv', function() {
        sfGovDownLoad(getURL($,'JSON'), title, '.json', function(){
          controller.emit('downloadNext', urlLeft);
        });
      });
    } else {
      controller.emit('downloadNext', urlLeft);
    }
  });
};

var getURL = function ($, tag, controller) {
  var $exportDom = $('.sidebarOptionsContainer').find('a.export');
  console.log('getURL', $exportDom.text());
  $exportDom.on('click', function(e){
    e.preventDefault();
    e.stopPropagation();

    var csvUrl = $('.cellInner').find("[data-type=CSV]").attr('href');
    var jsonUrl = $('.cellInner').find("[data-type=JSON]").attr('href');
    console.log(csvUrl,jsonUrl,'clicked');
    // controller.emit('initDownLoad', [csvUrl, jsonUrl]);
  });
  $exportDom.trigger('click');//this must be triggered in domReady. and after the .on. b/c of the asynchronous. 
};

var sfGovDownLoad = function(path, title, filetype, cb) {
  var url = 'http://data.sfgov.org' + path;
  var filepath = '../sfGov/data/'+ title + filetype;
  dataDownloader(url, filepath, cb);
};


// description = $('#infoBox').find('.currentViewName').text();

scrapeUrls(generateUrls(startUrl,1));

