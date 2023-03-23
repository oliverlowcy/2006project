
mapboxgl.accessToken = MapBoxToken;
navigator.geolocation.getCurrentPosition(successLocation,errorLocation,{enableHighAccuracy:true})

async function successLocation(position){
    console.log("MINE CENTER IS ", position.coords.longitude , "," , position.coords.latitude)
    let distanceArr = []
    const x = document.getElementsByClassName("post")
    for (let doc of x){
        // console.log(doc.children[3].textContent)
        // to know the coordinates of each location in food post

        // console.log(doc.children[3].textContent.split(","))

        // var apiLink = "https://api.mapbox.com/optimized-trips/v1/mapbox/driving/"
        // apiLink = apiLink + position.coords.longitude + "," + position.coords.latitude + ";" + doc.children[3].textContent + "?&access_token=pk.eyJ1Ijoib2xpdmVybG93MTMiLCJhIjoiY2xkOW00cXdiMDhydjNubnpteDRkejlpcSJ9.OpFQISdTL5ZV4WFR6a6M6w"
        // const response = await fetch(apiLink);
        // const json = await response.json();
        // const distanceTo = (json.trips[0].legs[0].distance)/1000

        const dist = await getDistance(position.coords.longitude,position.coords.latitude,doc.children[4].textContent.split(",")[0],doc.children[4].textContent.split(",")[1])



        const node = document.createElement("p");
        const textnode = document.createTextNode("Estimated distance is " + dist + " km");
        node.appendChild(textnode);
        doc.appendChild(node);
        distanceArr.push(dist)




    }

    
}





function errorLocation(){

}

async function getDistance(sourceLong,sourceLat,destLong,destLat){
    let apiLink = "https://api.mapbox.com/optimized-trips/v1/mapbox/driving/";
    apiLink = apiLink + sourceLong + "," + sourceLat + ";" + destLong + "," + destLat + "?&access_token=" + MapBoxToken;
    const response = await fetch(apiLink);
    const json = await response.json();
    const distanceTo = (json.trips[0].legs[0].distance)/1000
    return Math.round(distanceTo * 10) / 10
}