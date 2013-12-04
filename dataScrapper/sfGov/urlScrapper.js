
var dataDownloader = require('../helper/dataDownloader.js').dataDownloader;
var $ = require('jquery');
var phantom = require('phantom');

console.log(phantom.create);

var EventEmitter = require('events').EventEmitter;
var controller = new EventEmitter();

var url = "http://data.sfgov.org/browse?limitTo=datasets&utf8=%E2%9C%93";
var url2 = "https://data.sfgov.org/browse?limitTo=datasets&utf8=%E2%9C%93&page=2";
var pageCount = 0;

var urlLeft;

var phantomScrape = function(urls){
  var i = 0;
  phantom.create(function(ph) {
     ph.createPage(function(page) {
      openPageGetUrl(page, urls[i]);
      var intervalID = setInterval(function(){
        if (urlLeft === 0) {
          i += 1;
          openPageGetUrl(page, urls[i]);
        }
        if (index === urls.length) {
          ph.exit();
          clearInterval(intervalID);
        }
      }, 100);
    });
  });
};


       page.open(url, function(status) {
        console.log("opening webpage", url, status);
          page.render('./screenshot/temp.jpg',function(a,b,c) { //the first variable saves an screenshot to the file specified.
            onPageLoad();
            page.open(url2, function(status) {
              console.log("opening webpage", url, status);
                page.render('./screenshot/temp2.jpg',function(a,b,c) { //the first variable saves an screenshot to the file specified.
                  console.log('2nd page');
                });

            });
            // controller.on('urlDownlad', function(){
            //   ph.exit();
            // });
          });
      });
    });

  });
};




var onPageLoad = function() {
  console.log('page loaded');
};

phantomScrape(url);

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


description = $('#infoBox').find('.currentViewName').text();

// sfGovDownLoad("/api/search/views.json?accessType=WEBSITE&limit=10&page=1&limitTo=tables&datasetView=dataset&row_count=3&_=1386106144950",'webpage','.json');
// var data = require('webpage.json');
// console.log(data.)