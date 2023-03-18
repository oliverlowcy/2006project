const express = require("express");
const expressrouter = express.Router();
const catchAsyncWrapper = require("../errorUtility/asyncWrapper");
const mbxgeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxgeocoding({accessToken:"pk.eyJ1Ijoib2xpdmVybG93MTMiLCJhIjoiY2xkOW00cXdiMDhydjNubnpteDRkejlpcSJ9.OpFQISdTL5ZV4WFR6a6M6w"})

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder2 = NodeGeocoder(options);

const userAuthenticated = require("../utility/middleware").userAuthenticated;
const isPostWriter = require("../utility/middleware").isPostWriter;
const validateFoodpost = require("../utility/middleware").validateFoodpost;
const Foodpost = require("../models/foodpost");
const Friendship = require("../models/friendship");
const User = require("../models/user");
const multer = require("multer")
const cloudinaryMod = require("../cloudinary")
const cloudinary = cloudinaryMod.cloudinary
const storage = cloudinaryMod.storage
const upload = multer({storage})

expressrouter.get("/new", userAuthenticated, (req,res) => {
    res.render("newfoodpost")
})


expressrouter.get("/:id/edit", userAuthenticated,isPostWriter, catchAsyncWrapper(async(req,res) => {
    const idToShow = req.params.id;
    const singleFoodPost = await Foodpost.findById(idToShow);
    if(singleFoodPost){
        res.render("edit",{singleFoodPost:singleFoodPost , rating:singleFoodPost.rating})
    }else{
        return res.redirect("/foodposts");
    }
}))


expressrouter.get("/", catchAsyncWrapper(async(req,res) => {

    let arrOfAllFoodPost = await Foodpost.find({}).populate("writer")
    const isUserAuthenticated = req.isAuthenticated();
    

    let allFriendRequests = []
    let onlyFriendsPosts = []
    let toShowFriendPosts = false;

    if(isUserAuthenticated){
        const currentUser = await User.findById(req.user._id)
        allFriendRequests = await Friendship.find({"requestee":currentUser._id, resolvedStatus: false}).populate("requester")
        if(req.query.onlyFriends){
            toShowFriendPosts = true;
            const listOfFriendsId = currentUser.friends;
            onlyFriendsPosts = await Foodpost.find({"writer": {$in : listOfFriendsId}}).populate("writer");
            arrOfAllFoodPost = onlyFriendsPosts;
        }
    }
        
    res.render("home",{arrOfFoodPost:arrOfAllFoodPost , isUserAuthenticated:isUserAuthenticated, allFriendRequests:allFriendRequests
         , toShowFriendPosts:toShowFriendPosts});
   

    

}))

expressrouter.get("/search" , async(req,res) => {
    let result = []
    let match = false;


    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        result = await Foodpost.find({name: regex}).populate("writer");
        if(result){
            match = true;
        }
        res.render("search" , {result : result , match : match})
        
    }
    

    res.render("search" , {result : result , match : match})

    
    
})



expressrouter.get("/:id", catchAsyncWrapper(async(req,res) => {
    const idToShow = req.params.id;
    const singleFoodPost = await Foodpost.findById(idToShow).populate({path: "reviews",populate: {path: "reviewer"}}).populate("writer");
    res.render("show",{singleFoodPost:singleFoodPost})
}))


expressrouter.put("/:id",userAuthenticated,isPostWriter, upload.array('image'), validateFoodpost, catchAsyncWrapper(async(req,res) => {
    
    var listOfImageObjectToAdd = []
    var imageObjToAdd = {}
    for (var x of req.files){
        imageObjToAdd = {}
        imageObjToAdd.url = x.path;
        imageObjToAdd.fileName = x.filename;
        listOfImageObjectToAdd.push(imageObjToAdd)
    }

 
    console.log(req.body)
    const idToEdit = req.params.id;
    const foodPostToEdit = await Foodpost.findByIdAndUpdate(idToEdit,req.body.foodpost)
    for(var y of listOfImageObjectToAdd){
        foodPostToEdit.images.push(y)
    }

    let queryLocation = req.body.foodpost.location + " Singapore";
    const geoData = await geocoder.forwardGeocode({
        query: queryLocation,
        limit : 1
    }).send()
    foodPostToEdit.geometry = geoData.body.features[0].geometry;

    if(req.body.deletedImages){
        for(var imageFileNameToDelete of req.body.deletedImages){
            await cloudinary.uploader.destroy(imageFileNameToDelete)
            await foodPostToEdit.updateOne({$pull : {images: {fileName : imageFileNameToDelete}}})
        }
    }

    await foodPostToEdit.save()
    const redirectLink = "/foodposts/" + req.params.id
    res.redirect(redirectLink)
}))



expressrouter.delete("/:id",userAuthenticated,isPostWriter,catchAsyncWrapper(async(req,res) => {
    const idToEdit = req.params.id;
    await Foodpost.findByIdAndDelete(idToEdit)
    const redirectLink = "/foodposts"
    res.redirect(redirectLink)

}))

expressrouter.post("/",userAuthenticated,upload.array('image'), validateFoodpost, catchAsyncWrapper(async(req,res) => {
    var listOfImageObjectToAdd = []
    var imageObjToAdd = {}
    for (var x of req.files){
        imageObjToAdd = {}
        imageObjToAdd.url = x.path;
        imageObjToAdd.fileName = x.filename;
        listOfImageObjectToAdd.push(imageObjToAdd)
    }

    let queryLocation = req.body.foodpost.location + " Singapore";
    const geoData = await geocoder.forwardGeocode({
        query: queryLocation,
        limit : 1
    }).send()

    const currentUser = await User.findById(req.user._id)
    const foodpostToSave = req.body.foodpost
    foodpostToSave.writer = currentUser._id;
    foodpostToSave.geometry = geoData.body.features[0].geometry;
    foodpostToSave.images = listOfImageObjectToAdd;
    const newFoodPost = new Foodpost(foodpostToSave)
    await newFoodPost.save();   
    res.redirect("/foodposts")
}))


function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = expressrouter;
