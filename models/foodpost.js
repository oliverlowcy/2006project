const mongoose = require("mongoose");
const Review = require("./review")
const Schema = mongoose.Schema;

const foodpostSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    images: [
        {
            url : String,
            fileName : String
        }
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    locationInCoordinates: [
        {
            type: Number
        }
    ],
    // longitude,latitude
    writer: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    rating: {
        type: Number,
        required: true
    },
    // date: { 
    //     type: Date, default: Date.now 
    // }
})


const Foodpost = mongoose.model("Foodpost",foodpostSchema);


module.exports = Foodpost;