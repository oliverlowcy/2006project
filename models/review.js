const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    reviewer: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    // date: { 
    //     type: Date, default: Date.now 
    // }
})


const Review = mongoose.model("Review",reviewSchema);


module.exports = Review;