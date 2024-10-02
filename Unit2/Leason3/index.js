const express = require("express")
const ed = require("./ed")
const app = express()
const fs = require("fs")
const axios = require("axios").default

app.get('/url(/*)?', async (req, res) => {
  console.log(req.query)
  let url = req.url.split(")&url=").pop()
  let resp = await axios.get(url, {headers: {Accept:"application/json"}})
  // console.log("Converting Buffer to Array.")
  let arr = await ed.BufferToArray(Buffer.from(JSON.stringify(resp.data)))
  // console.log("Done - Encoding array to buffer", arr)
  // fs.writeFileSync("encoded.json", JSON.stringify(arr, null, 2))
  let buf = await ed.encode(arr)
  // fs.writeFileSync("encoded.png", buf)

  let arr2 = await ed.decode(buf)
  let data = await ed.ArrayToBuffer(arr2)
  console.log(arr2, data.toString())
  res.type("png").send(buf)
});

app.get("/example", async (req, res)=>{
  res.sendFile(path.join(__dirname, "example.png"))
})

app.listen("3000", () => {
  console.log(`Server running`);
});