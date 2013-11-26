$(document).ready(function(){

  console.log("Here");
  var getUserTableMetaData = function(){
    $.ajax({
      url: 'http://127.0.0.1:5000/userTableMetaData',
      type: 'GET',
      data: {order: '-createdAt'},
      contentType: 'application/json',
      success: function (data) {
        console.log("Data return",data);
        // alert("success");
        // addNewMessages(data.results);
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('Failed to get user table meta data');
      }
    });
  };

  var getUserApiKey = function(){
  };

  $('#genApiKey').on('click', function(e){
    e.preventDefault();
    $.ajax({
      url: '/generateApiKey',
      type: 'GET',
      contentType: 'application/json',
      success: function (data) {
        console.log("Data return in gen api key",data);
       $('#apiKeyRow td').remove();
       $('#apiKeyRow').append('<td>' + data + '</td>');
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('Failed to get user table meta data');
      }
    });
  });

  getUserTableMetaData();
});