const express = require("express");
const expressrouter = express.Router();
const passport = require("passport");
const catchAsyncWrapper = require("../errorUtility/asyncWrapper");
const User = require("../models/user");
const Friendship = require("../models/friendship");
const FoodPost = require("../models/foodpost");
const { userAuthenticated } = require("../utility/middleware");




expressrouter.get("/register", (req, res) => {
    res.render("register");
});

expressrouter.post("/register", catchAsyncWrapper(async (req, res, next) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const newUserToRegister = {email,username};

    try {
        const user = new User(newUserToRegister);
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, function(err) {
            if (err) return next(err);
            res.redirect("/foodposts");
        })
    } catch (errors) {
        req.flash("error", errors.message);
        res.redirect("/profile/register");
    }
}));


expressrouter.get("/login", (req, res) => {
    res.render("login");
})

expressrouter.post("/login", passport.authenticate("local", { failureFlash: true ,keepSessionInfo: true,failureRedirect: "/profile/login" }), (req, res) => {
    console.log(req.session);
    var redirectUrl = "";
    if(req.session.returnTo){
        redirectUrl = req.session.returnTo;
    }else{
        redirectUrl = "/foodposts";
    }
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

expressrouter.get("/logout", async(req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/foodposts");
    });
})

expressrouter.post("/acceptFriend/:id", userAuthenticated, async(req, res) => {

    const userIdTofind = req.params.id;
    const currentUser = await User.findById(req.user._id)
    const userToFind = await User.findById(userIdTofind)
    currentUser.friends.push(userToFind._id)
    userToFind.friends.push(currentUser._id)
    await currentUser.save()
    await userToFind.save()

    const friendshipRelation1 = await Friendship.findOne({"requester":currentUser._id,"requestee":userToFind._id,"resolvedStatus":false})
    const friendshipRelation2 = await Friendship.findOne({"requestee":currentUser._id,"requester":userToFind._id,"resolvedStatus":false})

    let friendShipObjToResolve = null;
    if(friendshipRelation1){
        friendShipObjToResolve = friendshipRelation1;
    }else{
        friendShipObjToResolve = friendshipRelation2;
    }

    friendShipObjToResolve.resolvedStatus = true 
    await friendShipObjToResolve.save()


    const redirectLink = "/profile/" + userIdTofind;
    res.redirect(redirectLink)

    console.log(userIdTofind);
})


expressrouter.post("/addFriend/:id", userAuthenticated, async(req, res) => {

    // console.log(req.params.id);
    // res.send("OK")
    const userIdToFind = req.params.id;
    const currentUser = await User.findById(req.user._id);
    const userToFind = await User.findById(userIdToFind) ;

    const newFriendship = {};
    newFriendship.requestee = userToFind._id;
    newFriendship.requester = currentUser._id;
    newFriendship.resolvedStatus = false;
    const myfriendship = new Friendship(newFriendship);
    await myfriendship.save();  

    console.log(req.params.id)
    const redirectLink = "/profile/" + userIdToFind;
    res.redirect(redirectLink)
    
})

expressrouter.delete("/removeFriend/:id", userAuthenticated, async(req, res) => {


    const userIdToFind = req.params.id;
    const userToFind = await User.findById(userIdToFind) ;
    const currentUser = await User.findById(req.user._id);
    
    const left = await Friendship.findOne({"requestee":userToFind._id , "requester":currentUser._id ,resolvedStatus:true});
    const right = await Friendship.findOne({"requester":userToFind._id , "requestee":currentUser._id ,resolvedStatus:true});

    if(left){
        await Friendship.findOneAndDelete({"requestee":userToFind._id , "requester":currentUser._id ,resolvedStatus:true});
    }else if(right){
        await Friendship.findOneAndDelete({"requester":userToFind._id , "requestee":currentUser._id ,resolvedStatus:true});
    }

    await User.findByIdAndUpdate(userIdToFind, { $pull: { friends: req.user._id }});
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: userIdToFind }});

    
    const redirectLink = "/profile/" + userIdToFind;
    res.redirect(redirectLink)
    
})


expressrouter.get("/:id", userAuthenticated, async(req, res) => {

    const currentUser = await User.findById(req.user._id)
    const userToFind = await User.findById(req.params.id).populate("friends")

    const currentUserRequested = await Friendship.find({"requester":currentUser._id,"requestee":userToFind._id,"resolvedStatus":false})
    const currentUserHasBeenRequested = await Friendship.find({"requestee":currentUser._id,"requester":userToFind._id,"resolvedStatus":false})
    const alreadyFriendsAndWasRequestedByCurrentUser = await Friendship.find({"requester":currentUser._id,"requestee":userToFind._id,"resolvedStatus":true})
    const alreadyFriendsAndWasRequestedByUserToFind = await Friendship.find({"requestee":currentUser._id,"requester":userToFind._id,"resolvedStatus":true})

    let allFriendRequests = []
    allFriendRequests = await Friendship.find({"requestee":userToFind._id, resolvedStatus: false}).populate("requester")



    let friendOption = -1;
    if(currentUser._id.toHexString() == userToFind._id.toHexString()){
        // means is my own profile
        friendOption = 1;

    }else if(alreadyFriendsAndWasRequestedByCurrentUser.length || alreadyFriendsAndWasRequestedByUserToFind.length){
        // means they are already friends
        friendOption = 2;

    }else if(currentUserRequested.length){
        // means current user sent the friend request
        friendOption = 3;

    }else if(currentUserHasBeenRequested.length){
        // means current user WAS SENT the friend request
        friendOption = 4;

    }else{
        // COMPLETELY NO FRIENDSHIP RELATIONSHIP AT ALL
        friendOption = 5;
    }

    const foodPostsByUser = await FoodPost.find({"writer": userToFind._id}).populate("writer");




    res.render("profilePage",{userToFind:userToFind , friendOption:friendOption,allFriendRequests:allFriendRequests,foodPostsByUser:foodPostsByUser})
 
})

module.exports = expressrouter;

