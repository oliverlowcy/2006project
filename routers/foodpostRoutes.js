const express = require("express");
const expressrouter = express.Router();
const catchAsyncWrapper = require("../errorUtility/asyncWrapper");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var ggGeocoder = NodeGeocoder(options);

const userAuthenticated = require("../utility/middleware").userAuthenticated;
const isPostWriter = require("../utility/middleware").isPostWriter;
const validateFoodpost = require("../utility/middleware").validateFoodpost;
const validateNewFoodpost = require("../utility/middleware").validateNewFoodpost;
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

expressrouter.get("/search" , catchAsyncWrapper(async(req,res) => {
    let result = []
    let emptyResult = false;

    if(req.query.search) {
        if(req.query.searchUser){
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            result = await User.find({username: regex});
            if(!(result.length)){
                emptyResult = true;
            }else{
                if(result.length > 5){
                    result = result.slice(0,5)
                }
            }
            return res.render("searchUser" , {result : result , emptyResult:emptyResult})
        }else{
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            result = await Foodpost.find({name: regex}).populate("writer");
            if(!(result.length)){
                emptyResult = true;
            }else{
                if(result.length > 5){
                    result = result.slice(0,5)
                }
            }
            return res.render("searchFoodpost" , {result : result , emptyResult:emptyResult})
        }
        
        
    }else{
        return res.render("search");
    }
    

    
    
}))

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

    const idToEdit = req.params.id;
    let foodPostToEdit = await Foodpost.findByIdAndUpdate(idToEdit,req.body.foodpost)
    for(var y of listOfImageObjectToAdd){
        foodPostToEdit.images.push(y)
    }
    

    if(req.body.deletedImages){
        for(var imageFileNameToDelete of req.body.deletedImages){
            await cloudinary.uploader.destroy(imageFileNameToDelete)
            await foodPostToEdit.updateOne({$pull : {images: {fileName : imageFileNameToDelete}}})
        }
    }

    
    let queryLocation = req.body.foodpost.location + " Singapore";
    await ggGeocoder.geocode(queryLocation, function (err, data) {
        

      
        let lat = 1.3342641;
        let long = 103.8490489;

        if(!(err || !data.length)){
            lat = data[0].latitude;
            long = data[0].longitude;
            foodPostToEdit.geometry = {
                type: "Point",
                coordinates: [long,lat]
            }  
        }else{
            foodPostToEdit.geometry = {
                type: "Point",
                coordinates: [long,lat]
            }  
        }


    })

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

expressrouter.post("/",userAuthenticated,upload.array('image'), validateNewFoodpost, catchAsyncWrapper(async(req,res) => {

    var listOfImageObjectToAdd = []
    var imageObjToAdd = {}
    for (var x of req.files){
        imageObjToAdd = {}
        imageObjToAdd.url = x.path;
        imageObjToAdd.fileName = x.filename;
        listOfImageObjectToAdd.push(imageObjToAdd)
    }


    const currentUser = await User.findById(req.user._id)
    const foodpostToSave = req.body.foodpost
    foodpostToSave.writer = currentUser._id;

    let queryLocation = req.body.foodpost.location + " Singapore";
    await ggGeocoder.geocode(queryLocation, function (err, data) {
        
        //ERROR HANDLING INSERT HERE

        
        let lat = 1.3342641;
        let long = 103.8490489;

        if(!(err || !data.length)){
            lat = data[0].latitude;
            long = data[0].longitude;
            foodpostToSave.geometry = {
                type: "Point",
                coordinates: [long,lat]
            }  
        }else{
            foodpostToSave.geometry = {
                type: "Point",
                coordinates: [long,lat]
            }  
        }

        
        

    })
    foodpostToSave.images = listOfImageObjectToAdd;
    const newFoodPost = new Foodpost(foodpostToSave)
    await newFoodPost.save();   
    res.redirect("/foodposts")
}))

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}





module.exports = expressrouter;
