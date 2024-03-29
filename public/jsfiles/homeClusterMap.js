mapboxgl.accessToken = MapBoxToken;
navigator.geolocation.getCurrentPosition(successLocation,errorLocation,{enableHighAccuracy:true})

function successLocation(position){
    
    initialiseMap(position.coords.longitude,position.coords.latitude)
}

function errorLocation(){

}



function initialiseMap(centreLong,centreLat){

    const now = new Date();
    const currentHour = now.getHours();
    let lightOrDark = "";

    if (currentHour >= 19 || currentHour < 7) {
        lightOrDark = "dark";
    } else {
        lightOrDark = "dark";
    }

    let mapStyle = "mapbox://styles/mapbox/dark-v11";
    if(lightOrDark){
        mapStyle = "mapbox://styles/mapbox/" + lightOrDark + "-v11"
    }

    const mycentre = [centreLong,centreLat];

    const map = new mapboxgl.Map({
        container: 'map',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: mapStyle,
        center: mycentre,
        zoom: 11
    });

    const centerMarker = new mapboxgl.Marker()
        .setLngLat(mycentre)
        .addTo(map);
    
    map.on('load', () => {
        // Add a new source from our GeoJSON data and
        // set the 'cluster' option to true. GL-JS will
        // add the point_count property to your source data.
        map.addSource('foodPosts', {
            type: 'geojson',
            // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
            // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
            data: foodPosts,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });
    
        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'foodPosts',
            filter: ['has', 'point_count'],
            paint: {
                // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                // with three steps to implement three types of circles:
                //   * Blue, 20px circles when point count is less than 100
                //   * Yellow, 30px circles when point count is between 100 and 750
                //   * Pink, 40px circles when point count is greater than or equal to 750
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    "#15f4ee",
                    5,
                    "#0eaaa6",
                    10,
                    "#08615f    "
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20,
                    5,
                    30,
                    10,
                    40
                ]
            }
        });
    
        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'foodPosts',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });
    
        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'foodPosts',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 4,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            }
        });
    
        // inspect a cluster on click
        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('foodPosts').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;
    
                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });
    
        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        map.on('click', 'unclustered-point', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            
    
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
    
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(
                    e.features[0].properties.popupText
                )
                .addTo(map);
        });
    
        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });
    });
}

