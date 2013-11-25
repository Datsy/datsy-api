var azure = require('azure');

// ask Emma for config file
var conString = require('./azurecloudconfig.json').storage.conString; 
var retryOperations = new azure.ExponentialRetryPolicyFilter();
var blobService = azure.createBlobService(conString).withFilter(retryOperations);
// upload a block blob to cloud

blobService.createBlockBlobFromFile('csv'
, 'rawdata1.txt'
, 'rawcsv/cat_rawdata.csv'
, function(error){
    if(!error){
        // File has been uploaded
    }
});

// how to download blobs

var fs=require('fs');
blobService.getBlobToStream('csv'
, 'rawdata.txt'
, fs.createWriteStream('output/outputtest.txt')
, function(error){
    if(!error){
        // Wrote blob to stream
    }
});

// delete blob


blobService.deleteBlob('csv'
, 'rawdata1.txt'
, function(error){
    if(!error){
        // Blob has been deleted
    }
});