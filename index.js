if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();


// ==============================================================
const userRoutes = require("./routers/userRoutes");
const foodpostRoutes = require("./routers/foodpostRoutes");
const reviewRoutes = require("./routers/reviewRoutes");

const session = require("express-session");
const ExpressError = require("./errorUtility/ExpressError");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const sessionExpiryDuration = 1000 * 60 * 60 * 24 * 7

app.use(session({
    secret: "mysecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + sessionExpiryDuration,
        maxAge: sessionExpiryDuration
    }
}))

const flash = require("connect-flash");
app.use(flash());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ==============================================================




const methodOverride = require("method-override")
app.use(methodOverride("_method"))
const Foodpost = require("./models/foodpost");
const Review = require("./models/review");
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/2006project",{useNewUrlParser:true,useUnifiedTopology:true})
    .then(function(){
        console.log("Connection Open");
    })
    .catch(function(err){
        console.log("Oh no error");
    })


app.use(express.urlencoded({ extended: true }))
const path = require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));



app.use((req, res, next) => {
    res.locals.currentUser = req.user;  //currentUser will be undefined if not authenticated
    res.locals.error = req.flash("error");
    next();
})


app.use("/profile", userRoutes);
app.use("/foodposts", foodpostRoutes)
app.use("/foodposts/:id/reviews", reviewRoutes)

app.get("/", async(req,res) => {
    res.render("landingPage")
})



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})



app.listen(3000, () => {
    console.log("Serving on port 3000")
})
