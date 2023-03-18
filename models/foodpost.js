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
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
}, {toJSON: {virtuals:true}});

foodpostSchema.virtual('properties.popupText').get(function(){
    let priceIndicator = ""
    if(this.price > 20){
        priceIndicator = `<p><strong>$$$$</strong></p>`
    }else if(this.price > 15){
        priceIndicator = `<p><strong>$$$</strong>$</p>`
    }else if(this.price > 10){
        priceIndicator = `<p><strong>$$</strong>$$</p>`
    }else{
        priceIndicator = `<p><strong>$</strong>$$$</p>`
    }
    
    
    
    return `
    <h3>${this.name}</h3>
    <p>${this.location}</p>
    ${priceIndicator}
    <p><a href="/foodposts/${this._id}">See More</a></p>
    
    
    `
})

const Foodpost = mongoose.model("Foodpost",foodpostSchema);


module.exports = Foodpost;