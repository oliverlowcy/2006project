const foodPostSchema= require("./schemas.js").foodPostSchema;
const reviewSchema= require("./schemas.js").reviewSchema;


const ExpressError = require("../errorUtility/ExpressError");
const Foodpost = require("../models/foodpost");
const Review = require("../models/review");


function validateFoodpost(req, res, next){
    const errorMsg = foodPostSchema.validate(req.body).error;
    if (errorMsg) {
        throw new ExpressError("Error with foodpost validation", 400)
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

module.exports = {validateFoodpost,validateReview,userAuthenticated,isPostWriter,isPostReviewer}

