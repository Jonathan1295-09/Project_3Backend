////////////////////////////////////////////
// Setup - Import deps and create app object
////////////////////////////////////////////
require("dotenv").config();
const DATABASE_URL = process.env.DATABASE_URL
const PORT = process.env.PORT
const express = require("express");
const app = express();
const mongoose = require("mongoose");
// Importing Middleware
const cors = require("cors");
const morgan = require("morgan");

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
const AlbumsSchema = new mongoose.Schema({
    albumName: String,
    artist: String,
    image: String,
    yearReleased: Number,
    linkToAlbum: String,
})

const Albums = mongoose.model("Albums", AlbumsSchema)

//////////////////////
// Declare Middleware
//////////////////////
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

/////////////////////////////
// Declare Routes and Routers
/////////////////////////////
// INDUCES - Index, New, Delete, Update, Create, Edit, Show

//Index// 
app.get("/albums", async (req,res) => {
    try{
        const album = await Albums.find({})
        res.json(album)
    }catch (error){
        res.status(400).json({error})
    }
});

//CREATE//
app.post("/albums/:id", async (req,res) => {
    try{
        // create album
        const album = await Albums.create(req.body)
        res.json(album)
    }catch (error){
        res.status(400).json({error})
    }
})

//Show//
app.get("/albums/:id", async (req,res) => {
    try{
        // get a album from the database
        const album = await Albums.findById(req.params.id)
        // return the album as json
        res.json(album)
    }catch (error) {
        res.status(400).json({error})
    }
})

///////////////////////////
// Server Listener
///////////////////////////
app.listen(PORT, () =>console.log(`Listening on Port ${PORT}`))