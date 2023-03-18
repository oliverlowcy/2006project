
mapboxgl.accessToken = MapBoxToken;
navigator.geolocation.getCurrentPosition(successLocation,errorLocation,{enableHighAccuracy:true})

async function successLocation(position){
    console.log("MINE CENTER IS ", position.coords.longitude , "," , position.coords.latitude)
    let distanceArr = []
    const x = document.getElementsByClassName("post")
    for (let doc of x){
        // console.log(doc.children[3].textContent)
        // to know the coordinates of each location in food post
        var apiLink = "https://api.mapbox.com/optimized-trips/v1/mapbox/driving/"
        apiLink = apiLink + position.coords.longitude + "," + position.coords.latitude + ";" + doc.children[3].textContent + "?&access_token=pk.eyJ1Ijoib2xpdmVybG93MTMiLCJhIjoiY2xkOW00cXdiMDhydjNubnpteDRkejlpcSJ9.OpFQISdTL5ZV4WFR6a6M6w"
        const response = await fetch(apiLink);
        const json = await response.json();
        const distanceTo = (json.trips[0].legs[0].distance)/1000

        const node = document.createElement("p");
        const textnode = document.createTextNode("Estimated distance is " + Math.round(distanceTo * 10) / 10 + " km");
        node.appendChild(textnode);
        doc.appendChild(node);
        distanceArr.push((json.trips[0].legs[0].distance)/1000)




    }

    
}





function errorLocation(){
    

}

