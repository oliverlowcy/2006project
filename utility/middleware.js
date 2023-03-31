const foodPostSchema= require("./schemas.js").foodPostSchema;
const reviewSchema= require("./schemas.js").reviewSchema;


const ExpressError = require("../errorUtility/ExpressError");
const Foodpost = require("../models/foodpost");
const Review = require("../models/review");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var ggGeocoder = NodeGeocoder(options);


async function validateFoodpost(req, res, next){
    const errorMsg = foodPostSchema.validate(req.body).error;
    const url = req.originalUrl;
    const id = (url.split("/")[2]).split("?")[0];
    let redirectLink = "/foodposts/" + id + "/edit";   

    let queryLocation = req.body.foodpost.location + " Singapore";
    await ggGeocoder.geocode(queryLocation, function (err, data) {
        if((err || !data.length)){
            req.flash("error", "Update unsuccessful, Location Not Found!");
            res.redirect(redirectLink)
        }
    })


    if (errorMsg) {
        req.flash("error", "Update unsuccessful, Please Try Again");
        res.redirect(redirectLink)
    } else {
        next();
    }
}

async function validateNewFoodpost(req, res, next){
    const errorMsg = foodPostSchema.validate(req.body).error;
    

    let queryLocation = req.body.foodpost.location + " Singapore";
    await ggGeocoder.geocode(queryLocation, function (err, data) {
        if((err || !data.length)){
            req.flash("error", "Location Not Found !");
            res.redirect("/foodposts/new")
        }
    })


    if (errorMsg) {
        req.flash("error", "Post unsuccessful, Please Try Again");
        res.redirect("/foodposts/new")
    } else {
        next();
    }
}

function validateReview(req, res, next){
    const errorMsg = reviewSchema.validate(req.body).error;
    if (errorMsg) {
        throw new ExpressError("Error with review validation", 400)
    } else {
        next();
    }
}

function userAuthenticated(req, res, next){
    const isUserAuthenticated = req.isAuthenticated();
    if(isUserAuthenticated){
        next()
    }else{
        req.session.returnTo = req.originalUrl
        req.flash("error", "You are not signed in!");
        return res.redirect("/profile/login");
    }
}


async function isPostWriter (req, res, next){
    const authenticatedUserId = req.user._id;
    const foodpostid = req.params.id;
    const foodpost = await Foodpost.findById(foodpostid);
    if(foodpost){
        if(foodpost.writer.equals(authenticatedUserId)){
            next()
        }else{
            const redirectLink = "/foodposts/" + foodpostid
            return res.redirect(redirectLink);
        }
    }


}

async function isPostReviewer(req, res, next){
    const authenticatedUserId = req.user._id;
    const reviewId = req.params.idOfReview;
    const review = await Review.findById(reviewId);
    if(review){
        if(review.reviewer.equals(authenticatedUserId)){
            next()
        }else{
            const foodpostId = req.params.id;
            const redirectLink = "/foodposts/" + foodpostId
            return res.redirect(redirectLink);
        }
    }
    
}

module.exports = {validateFoodpost,validateReview,userAuthenticated,isPostWriter,isPostReviewer,validateNewFoodpost}

