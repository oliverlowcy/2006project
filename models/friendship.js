const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendshipSchema = new mongoose.Schema({
    requestee: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    requester: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    resolvedStatus: {
        type: Boolean
    }
    // date: { 
    //     type: Date, default: Date.now 
    // }
})


const Friendship = mongoose.model("Friendship",friendshipSchema);


module.exports = Friendship;