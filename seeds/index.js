const mongoose = require("mongoose");
const Malls = require("./malls")
const Foods = require("./foods")
const FoodPost = require("../models/foodpost")
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: "AIzaSyAMgPb1ljtTOxNK2dJ8ymiBKBMkBMf8zas",
  formatter: null
};
 
var ggGeocoder = NodeGeocoder(options);

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/2006project",{useNewUrlParser:true,useUnifiedTopology:true})
    .then(function(){
        console.log("Connection Open");
    })
    .catch(function(err){
        console.log("Oh no error");
    })


async function seedDB(){
    await FoodPost.deleteMany({})
    let randomNum1 = 0;
    let randomNum2 = 0;
    let thelocation = " "
    for (let i =0;i<20;i++){
        randomNum1 = Math.floor(Math.random() * 20);
        randomNum2 = Math.floor(Math.random() * 20);
        thelocation = Malls[randomNum1];

        
        const foodpost = new FoodPost({
            name: Foods[randomNum2],
            writer:"63d7874608c5c2c0b0320891",
            price: randomNum2,
            location: thelocation,
            description : "A DESCRIPTION HERE",
            rating:2,
        })

        let queryLocation = thelocation + " Singapore";
        await ggGeocoder.geocode(queryLocation, function (err, data) {
        
            let lat = 0;
            let long = 0; 

            if(!(err || !data.length)){
                lat = data[0].latitude;
                long = data[0].longitude;
                foodpost.geometry = {
                    type: "Point",
                    coordinates: [long,lat]
                }  
            }else{
                foodpost.geometry = {
                    type: "Point",
                    coordinates: [long,lat]
                }  
            }

            
    
        })

        await foodpost.save();
    }
}

seedDB()