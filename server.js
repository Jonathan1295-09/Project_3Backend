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

app.get("/", (req, res) => {
    res.send("Hello world!")
})

///////////////////////////
// Server Listener
///////////////////////////
app.listen(PORT, () =>console.log(`Listening on Port ${PORT}`))