var azure = require('azure');

var retryOperations = new azure.ExponentialRetryPolicyFilter();
var blobService = azure.createBlobService().withFilter(retryOperations);
// upload a block blob to cloud
// blobService.createBlockBlobFromFile('csv'
// , 'rawdata1.txt'
// , 'rawdata.txt'
// , function(error){
//     if(!error){
//         // File has been uploaded
//     }
// });

// how to download blobs
// var fs=require('fs');
// blobService.getBlobToStream('csv'
// , 'rawdata.txt'
// , fs.createWriteStream('output/outputtest.txt')
// , function(error){
//     if(!error){
//         // Wrote blob to stream
//     }
// });

delete blob
blobService.deleteBlob('csv'
, 'rawdata1.txt'
, function(error){
    if(!error){
        // Blob has been deleted
    }
});