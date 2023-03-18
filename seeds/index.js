const mongoose = require("mongoose");
const Malls = require("./malls")
const Foods = require("./foods")
const FoodPost = require("../models/foodpost")
const mbxgeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxgeocoding({accessToken:"pk.eyJ1Ijoib2xpdmVybG93MTMiLCJhIjoiY2xkOW00cXdiMDhydjNubnpteDRkejlpcSJ9.OpFQISdTL5ZV4WFR6a6M6w"})

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
    let randomNum = 0;
    let thelocation = " "
    for (let i =0;i<20;i++){
        randomNum = Math.floor(Math.random() * 20);
        thelocation = Malls[randomNum];

        const geoData = await geocoder.forwardGeocode({
            query: thelocation + " Singapore",
            limit : 1
        }).send()


        
        const foodpost = new FoodPost({
            name: Foods[randomNum],
            writer:"63d7874608c5c2c0b0320891",
            price: randomNum,
            location: thelocation,
            rating:2,
            geometry : geoData.body.features[0].geometry
        })

        await foodpost.save();
    }
}

seedDB()