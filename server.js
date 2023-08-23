////////////////////////////////////////////
// Setup - Import deps and create app object
////////////////////////////////////////////
require("dotenv").config();
const DATABASE_URL = process.env.DATABASE_URL
const PORT = process.env.PORT
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//////////////////////
// Database Connection
//////////////////////
mongoose.connect(DATABASE_URL)

// Connection Events
mongoose.connection
.on("open", () => console.log("You are connected to mongoose"))
.on("close", () => console.log("You are disconnected from mongoose."))
.on("error", (error) => console.log(error));

//////////////////////
// Models
//////////////////////

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
})

const User = mongoose.model("User", UserSchema)

const AlbumsSchema = new mongoose.Schema({
    albumName: String,
    artist: String,
    image: String,
    yearReleased: Number,
    linkToAlbum: String,
    username: String
})

const Albums = mongoose.model("Albums", AlbumsSchema)

//////////////////////
// Auth Middleware
//////////////////////

const authCheck = async (req, res, next) => {
    // check if the request has a cookie
    if(req.cookies.token) {
        // if there is a cookie, try to decode it
        const payload = await jwt.verify(req.cookies.token, process.env.SECRET)
        // store the payload in the request
        req.payload = payload;
        next();
    } else {
        // if there is no cookie, return an error
        res.status(400).json({error: "You are not authorized"})
    }
}

//////////////////////
// Declare Middleware
//////////////////////
// using cors prevents cors errors (allow all requests from other origins)
app.use(
    cors({
        origin: "https://personal-jukebox-nxb4.onrender.com",
        credentials: true,
    })
);
// cookie parser for reading cookies (you need this for auth)
app.use(cookieParser())
app.use(morgan("dev"));
app.use(express.json());

/////////////////////////////
// Declare Routes and Routers
/////////////////////////////
// INDUCES - Index, New, Delete, Update, Create, Edit, Show

//Index 
app.get("/albums", authCheck, async (req,res) => {
    try{
        const album = await Albums.find({username: req.payload.username})
        res.json(album)
    }catch (error){
        res.status(400).json({error})
    }
});

// DESTROY
app.delete("/albums/:id", authCheck, async (req, res) => {
    try{
        const album = await Albums.findByIdAndDelete(req.params.id)
    res.status(204).json(album)
} catch (error) {
    res.status(400).json({error})
}
});

// UPDATE
app.put("/albums/:id", authCheck, async (req, res) => {
    try {
        const album = await Albums.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.json(album);
    } catch (error) {
        res.status(400).json({error});
    }
});

//CREATE//
app.post("/albums", authCheck, async (req,res) => {
    try{
        req.body.username = req.payload.username
        // create album
        const album = await Albums.create(req.body)
        res.json(album)
    }catch (error){
        res.status(400).json({error})
    }
})

//Show//
app.get("/albums/:id", authCheck, async (req,res) => {
    try{
        // get a album from the database
        const album = await Albums.findById(req.params.id)
        // return the album as json
        res.json(album)
    }catch (error) {
        res.status(400).json({error})
    }
})

// test route
app.get("/", (req, res) => {
    res.send("Hello world!")
})

///////////////////////////
// Auth Routes
///////////////////////////

// Signup - Post
app.post("/signup", async (req, res) => {
    try {
        // deconstruct username and password from the body
        let {username, password} = req.body
        // hash the password 
        password = await bcrypt.hash(password, await bcrypt.genSalt(15))
        // create a new user in the database
        const user = await User.create({username, password})
        // send the new user a json
        res.json(user)
    } catch(error) {
        res.status(400).json({error})
    }
})

// Login - Post
app.post("/login", async (req, res) => {
    try {
        // deconstruct the username and password from the body
        const {username, password} = req.body
        // search the database for a user with the provided username
        const user = await User.findOne({username})
        // if no user is found, return an error
        if (!user) {
            throw new Error("No user with that username was found!")
        }
        // if a user is found, compare the provided password with the password on the user object
        const passwordCheck = await bcrypt.compare(password, user.password)
        //if the passwords don't match, return an error
        if (!passwordCheck) {
            throw new Error("Password does not match! Try again.")
        }
        // create a token with the username in the payload
        const token = jwt.sign({username: user.username}, process.env.SECRET)
        // send a response with a cookie that includes the token
        res.cookie("token", token, {
            httpOnly: true,
            path: "/",
            secure: true,
            sameSite: "none",
            maxAge: 31556952000,
        });
        res.json({message: "Login successful!"})
    } catch(error) {
        res.status(400).json({error: error.message})
    }
})

// Logout - Get
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({message: "You have been logged out successfully!"})
})

///////////////////////////
// Server Listener
///////////////////////////
app.listen(PORT, () =>console.log(`Listening on Port ${PORT}`))