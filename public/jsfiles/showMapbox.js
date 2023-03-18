mapboxgl.accessToken = MapBoxToken;
navigator.geolocation.getCurrentPosition(successLocation,errorLocation,{enableHighAccuracy:true})

function successLocation(position){
    const now = new Date();
    const currentHour = now.getHours();
    let lightOrDark = "";

    if (currentHour >= 19 || currentHour < 7) {
        lightOrDark = "dark";
    } else {
        lightOrDark = "light";
    }
    setupMap([position.coords.longitude, position.coords.latitude],lightOrDark)

}

function errorLocation(){
    setupMap([-2.24,53.48])

}

function setupMap(center,lightOrDark) {
    
    let mapStyle = "mapbox://styles/mapbox/dark-v11";
    if(lightOrDark){
        mapStyle = "mapbox://styles/mapbox/" + lightOrDark + "-v11"
    }
    

    const map = new mapboxgl.Map({
    container: "map",
    // Choose from Mapbox"s core styles, or make your own style with Mapbox Studio
    style: mapStyle,
    center: center,
    zoom: 9
    });
    


    var directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken
    });

    map.addControl(directions,"top-left");

    map.on("load",  function() {
        directions.setOrigin(center); // can be address in form setOrigin("12, Elm Street, NY")
        directions.setDestination(destination); // can be address OR COORDINATES
    })

}