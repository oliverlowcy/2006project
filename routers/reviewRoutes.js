const express = require("express");
const expressrouter = express.Router({ mergeParams: true });

const userAuthenticated = require("../utility/middleware").userAuthenticated;
const isPostWriter = require("../utility/middleware").isPostWriter;
const validateFoodpost = require("../utility/middleware").validateFoodpost;
const validateReview = require("../utility/middleware").validateReview;

const catchAsyncWrapper = require("../errorUtility/asyncWrapper");


const Foodpost = require("../models/foodpost");
const Review = require("../models/review");
const { isPostReviewer } = require("../utility/middleware");





expressrouter.post("/",userAuthenticated,validateReview, catchAsyncWrapper(async(req,res) => {
    const idOfFoodPostToAddReviewOn = req.params.id;
    const newReview = new Review(req.body.review)
    newReview.reviewer = req.user._id;
    const foodPostObjToAddReview = await Foodpost.findById(idOfFoodPostToAddReviewOn)
    foodPostObjToAddReview.reviews.push(newReview)

    await newReview.save();
    await foodPostObjToAddReview.save()


    const redirectLink = "/foodposts/" + idOfFoodPostToAddReviewOn
    res.redirect(redirectLink)


}))


expressrouter.delete("/:idOfReview", userAuthenticated, isPostReviewer, catchAsyncWrapper(async (req, res) => {
    const idOfFoodPost = req.params.id;
    const reviewId = req.params.idOfReview;
    await Foodpost.findByIdAndUpdate(idOfFoodPost, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    const redirectLink = "/foodposts/" + idOfFoodPost
    res.redirect(redirectLink)
}))

module.exports = expressrouter