mapboxgl.accessToken = MY_MAPBOX_API_TOKEN;
navigator.geolocation.getCurrentPosition(successLocation,errorLocation,{enableHighAccuracy:true})

function successLocation(position){
    console.log(position)
    setupMap([position.coords.longitude, position.coords.latitude])

}

function errorLocation(){
    setupMap([-2.24,53.48])

}

function setupMap(center) {
    const map = new mapboxgl.Map({
    container: "map",
    // Choose from Mapbox"s core styles, or make your own style with Mapbox Studio
    style: "mapbox://styles/mapbox/navigation-night-v1",
    center: center,
    zoom: 9
    });
    


    var directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken
    });

    map.addControl(directions,"top-left");

    map.on("load",  function() {
        console.log("center is " + center)
        directions.setOrigin(center); // can be address in form setOrigin("12, Elm Street, NY")
        directions.setDestination(destination); // can be address OR COORDINATES
    })

}