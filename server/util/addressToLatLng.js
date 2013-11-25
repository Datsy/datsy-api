<script type="text/javascript" src="http://maps.google.com/maps/spi/js?sensor=false"></script>
<script type="text/javascript">

var geocder = new.google.maps.Geocoder();
var address = "new york";

geocoder.geocode({'address': address}, function(results, status){
  if (status === google.maps.GeocoderStatus.OK) {
    var latitude = results[0].geometry.location.lat;
    var longitude = results[0].geometry.location.lng;
    alert(latitude);
  }
});
</script>