var locationDetected = false;

var dateString = "";

// Initialize Firebase
  var config = {
    apiKey: "AIzaSyCq0If8RaQIfDxHtGv-v5ee1prG9XKltTE",
    authDomain: "reservation-site-3c14a.firebaseapp.com",
    databaseURL: "https://reservation-site-3c14a.firebaseio.com",
    storageBucket: "reservation-site-3c14a.appspot.com",
    messagingSenderId: "95699800283"
  };
  firebase.initializeApp(config);

  //Connect to Database for reservations
  var database = firebase.database();


//Jquery functions

$('.datepicker').datepicker();

$('#restaurant-photo').hide().fadeIn(3000);
$('#map').removeAttr('style');

$('#reservation-form').on('submit',function(e){
	e.preventDefault();
	//Collect data
	var context = {
		name: $('.name-input').val(),
		day : $('.datepicker').val()
	}

	
	//Create/update reservations section in database
	var reservationsReference = database.ref('reservations');

	//Update database
	reservationsReference.push(context);	


	//Generate Handlebars template
	var source = $('#entry-template').html();
	var template = Handlebars.compile(source);
	var newHTML = template(context);
	$('#reservation-list').find('tbody').append(newHTML);


});

var scrolled = 0;
var currentPosition = 1;
var scrollDist = $('.hPage').width();

$('a').on('click',function(e){
	
	e.preventDefault();
	
	var nextPosition;
	switch($(this).text()){
		case 'Home':
		nextPosition = 1;
		break;

		case 'Reservations':
		nextPosition = 2;
		break;

		case 'Location':
		nextPosition = 3;
		break;

		case 'Reviews':
		nextPosition = 4;
		break;
	}

	scrolled += scrollDist *(nextPosition-currentPosition);
	currentPosition = nextPosition;

	$('.surroundContainer').animate({
		scrollLeft: scrolled
	});
	


});


//Google Maps Functions
function initMap() {

var map;
var restaurantLocation = {lat:40.805417, lng: -73.965442};


map = new google.maps.Map(document.getElementById('map'), {
  		center: restaurantLocation,
  		zoom: 15,
  		scrollwheel: false,
  		zoomControl: false,
  		mapTypeControl: false,
 		scaleControl: false,
  		streetViewControl: false,
  		rotateControl: false,
  		fullscreenControl: false

});

var marker = new google.maps.Marker({
	position: restaurantLocation,
	map: map,
	name: "We are here!"
});

calcDirections(restaurantLocation);

}


function calcDirections(location){
var directionsAPI= "https://maps.googleapis.com/maps/api/directions/json?";
var API_KEY = "AIzaSyBf7JTDFpXwBXmiiM_tuch8KEttamDI6TY";

	navigator.geolocation.getCurrentPosition(function(result){
	var userLocation = {
		lat: result.coords.latitude,
		lng: result.coords.longitude
	}
	console.log(userLocation);
	var originString = "origin="+userLocation.lat+","+userLocation.lng;
	var destinationString = "destination="+location.lat+","+location.lng;
	var modeString = "mode=transit";

	console.log(directionsAPI+originString+"&"+destinationString+"&"+modeString+"&language=en&key="+API_KEY);


	$.get(directionsAPI+originString+"&"+destinationString+"&"+modeString+"&language=en&key="+API_KEY,function(result){
			var source;
			var template;
			var context;
			var newHTML;
			

			$('#directions').append("<p>From "+result.routes[0].legs[0].start_address+" (approx.)</p><br>");


			var steps = result.routes[0].legs[0].steps;

			for(var i=0; i<steps.length; i++){			

				
				if(steps[i].travel_mode==="WALKING"){

					$('#directions').find('ul').append("<li>"+steps[i].html_instructions+"</li><br>");

				}else{
					
					source = $('#directions-template-transit').html();
					template = Handlebars.compile(source);
					var vehicleName = steps[i].transit_details.line.vehicle.name==="Subway" ? "train" : "bus";
					var imgSource = steps[i].transit_details.line.vehicle.name==="Subway" ? steps[i].transit_details.line.icon : steps[i].transit_details.line.vehicle.icon;
					imgSource = "https:"+imgSource;


					var busRoute = steps[i].transit_details.line.vehicle.name==="Subway" ? "" : steps[i].transit_details.line.short_name;

					context = {
						trainNumber : imgSource,
						headsign : steps[i].transit_details.headsign,
						departingStation : steps[i].transit_details.departure_stop.name,
						arrivingStation : steps[i].transit_details.arrival_stop.name,
						vehicle: vehicleName,
						busNumber: busRoute,
						numberOfStops: steps[i].transit_details.num_stops

					};

					newHTML = template(context);
					$('#directions').find('ul').append(newHTML);

				}

			}	

			$('#directions').find('ul').append("<li>We'll be right there!</li>");			
	});
});
}