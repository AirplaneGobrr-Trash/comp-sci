const express = require("express")
const app = express();

let pictureEncoder = require("./Unit2/Leason3/index")
app.use(pictureEncoder)

app.listen("3005", ()=>{
    console.log("Running on :3005")
})