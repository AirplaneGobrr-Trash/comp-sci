const app = require("express").Router()
const ed = require("./ed")
const fs = require("fs")
const path = require("path")
const axios = require("axios").default

app.get('/url(/*)?', async (req, res) => {
  console.log(req.query)
  let url = req.url.split("url=").slice(1).join("url=")
  let resp = await axios.get(url, {headers: {Accept:"application/json"}})
  // console.log("Converting Buffer to Array.")
  let arr = await ed.BufferToArray(Buffer.from(JSON.stringify(resp.data)))
  // console.log("Done - Encoding array to buffer", arr)
  // fs.writeFileSync("encoded.json", JSON.stringify(arr, null, 2))
  let buf = await ed.encode(arr)
  // fs.writeFileSync("encoded.png", buf)

  // let arr2 = await ed.decode(buf)
  // let data = await ed.ArrayToBuffer(arr2)
  // console.log(arr2, data.toString())
  console.log("Sent!")
  res.type("png").send(buf)
});

app.get("/example", async (req, res)=>{
  res.sendFile(path.join(__dirname, "example.png"))
})

module.exports = app