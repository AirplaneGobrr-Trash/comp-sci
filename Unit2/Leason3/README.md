# Leason 3

# What is this?

On Code.org you can make HTTP requests but its limited to only [services they allow](https://studio.code.org/docs/ide/applab/expressions/startWebRequest)

But you CAN grab images and put them on a canvas from ANY server!

We can "abuse" this by returning the data of an HTTP as a picture.

This is an example of what a returned response looks like

![Bunch of blocks of colors](example.png)

# How does it work?

When we load a "picture" the URL we load looks like so: `http://localhost:3000/url?date=Wed Oct 02 2024 13:26:52 GMT-0700 (Pacific Daylight Time)&url=https://icanhazdadjoke.com/`

In applab it looks like this:
```js
createCanvas("request", width, height);
var date = new Date().valueOf();
drawImageURL("http://localhost:3000/?date="+date+"&url=https://icanhazdadjoke.com/");
```
(KEEP IN MIND THIS WON'T WORK, we are using localhost. Code.org servers can't connect to OUR local computer)

Why do we add a date? Well I am running this behind cloudflare, and Cloudflare caches any pictures or scripts to help speed up your site, well this is VERY nice we don't want the result of the dad joke API to be cached once, if we did that we'd get the same joke every time!

## The server.

The server is made with express, this is a SUPER simple HTTP server built in nodejs

On the server we extract the URL the user wants the server to ping out too.

We then make the request to the URL using axios

After this- this is where it gets hard.

Using this response data we then convert it to a Buffer then into an Array, this array has the colors of the data

## How do you know what colors to use?

On the server it has a custom lookup table, remeber how I said we turn the response into a Buffer? Well a Buffer can use lots of differnt kinds of encoding, like base64, hex, or even binary! The encoding we use for this is `hex` this was the easist to do decode on Code.org- I'll cover more about this later.

So using the Buffer we start running through it, looking up what value belongs to the index of the buffer,
EG => lets say we have a buffer that looks like this: `Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])` if we convert this buffer into a hex it looks like `627566666572` we then run each of these values through the lookup table this gives us `[302, 264, 311, 292, 302, 302, 302, 302, 302, 292, 311, 264]` these numbers are the colors in HSL!

### But wait- how do you get numbers (big numbers!) via the Buffer?

At the start of the code, we see which encoding type we are using (base64, hex, or binary) we then LOOKUP how many values the lookup table has, knowing that we when interpolate the numbers.

Lets say our lookup table has `35` values (aka the hex table) Well if you look up HSL, you can't REALLY tell the differace between `hsl(34, 100%, 50%)` and `hsl(35, 100%, 50%)` so we must devide up our lookup table into bigger values, so lets say we have `0`, `0` has an index of `26` on the lookup table but if we SCALE up the table to use more colors, `0` now becomes `245`, which is `hsl(245, 100%, 50%)`.

#### Why??

Well this project was adapted from an old project, the project would turn files into pictures and you could upload the pictures online

But the thing about uploading things online is that online services use lossy compression.

This means the 1:1 color will be lost so lets say we didn't devide up the lookup table to use custom values.

If you have 2 pixels that are `hsl(34, 100%, 50%)` and `hsl(36, 100%, 50%)` next to each other the lossy compression algorithm will see this and might set the color to `hsl(35, 100%, 50%)` for BOTH pixels! Thats NOT what our data was and now everything is corrupted!!

## Now we have the colors

So now we have a list of colors but no picture! So lets turn this list of colors into a picture. Again because this project was adapted from an old project there is MORE aint compresstion stuff in place, being **pixel blocks**

### What are pixel blocks???

Pixel blocks are well- Pixel blocks! They are chunks of pixels that are ALL the same color

In Code.org we don't need to worry about any comprestion so we set the pixelBlocks to a value of `2` this means that every color in our array will get a `2x2` block of pixels that are all the same color!

## So now we have a picture of random colors

Great! Now the HTTP response we made is encoded in the picture as blocks of colors

Code.org now sets this picture on a canvas

## Code.org.

On Code.org they have blessed us with a `getImageData` function, this allows us to get the RGBA of each pixel, using this we convert the RGBA into HSL (this uses some vodo magic I don't really understand), we do throw away the alpha channel from the RGBA as it's not need and doesn't matter as the only value we need from the HSL is the HUE.

Whoa! A Hue? That sounds alot like what we used to encode our data! And that would be correct! 🥳🥳🥳

We now just do the REVERSE of what we did to encode the picture, first we extract all the RGB values converting them into HSL values, now we have an array on Code.org full of HSL values, we then run this array of HSL values through our lookup table. 

This lookup table has values and chars, using the HUE value we look up what char mataches the value, so lets say we have a HUE of `302` this turns into `6`

So our HSL array looks like `[302, 264, 311, 292, 302, 302, 302, 302, 302, 292, 311, 264]` (hey thats the same from when we encoded it!)

We turn this into each char in hex, so this becomes........ `627566666572` GREAT!

What is `627566666572`?? Well its a hex string! Using magic on Code.org we can then turn this hex string into an ASII string which is.... the word `buffer` Great!

# Lets show what happens

Code.org requests the "image" `"http://localhost:3000/?date=<Date here>&url=https://icanhazdadjoke.com/"`

Now the server makes a request to `https://icanhazdadjoke.com/`

Encodes the data into hex that looks like `7b226964223a22766b56304c367763466c62222c226a6f6b65223a2244696420796f7520686561722061626f7574207468652072756e6e65722077686f2077617320637269746963697a65643f204865206a75737420746f6f6b20697420696e20737472696465222c22737461747573223a3230307d`

Now we encode the hex into hue values that look like: `[ 311,  10, 264, 264, 302, 330, 302, 283, 264, 264, 274,   1, 264, 264, 311, 302, 302,  10, 292, 302, 274, 245, 283,  20, 274, 302, 311, 311, 302, 274, 283, 302, 302,  20, 302, 264, 264, 264, 264,  20, 264, 264, 302,   1, 302,  48, 302,  10, 302, 292, 264, 264, 274,   1, 264, 264, 283, 283, 302, 330, 302, 283, 264, 245, 311, 330, 302,  48, 311, 292, 264, 245, 302, 321, 302, 292, 302, 255, 311, 264, 264, 245, 302, 255, 302, 264, 302,  48, 311, 292, 311, 283, 264, 245, 311, 283, 302, 321, 302, 292, ... ]`

Now we turn this into a picture that looks like: (small because 2 pixel block size!)

![hue picture](encoded.png)

Code.org loads this decodes the RGB into HSL and now we have `[ 311,  10, 264, 264, 302, 330, 302, 283, 264, 264, 274,   1, 264, 264, 311, 302, 302,  10, 292, 302, 274, 245, 283,  20, 274, 302, 311, 311, 302, 274, 283, 302, 302,  20, 302, 264, 264, 264, 264,  20, 264, 264, 302,   1, 302,  48, 302,  10, 302, 292, 264, 264, 274,   1, 264, 264, 283, 283, 302, 330, 302, 283, 264, 245, 311, 330, 302,  48, 311, 292, 264, 245, 302, 321, 302, 292, 302, 255, 311, 264, 264, 245, 302, 255, 302, 264, 302,  48, 311, 292, 311, 283, 264, 245, 311, 283, 302, 321, 302, 292, ... ]` (again)

Now we decode it into hex, `7b226964223a22766b56304c367763466c62222c226a6f6b65223a2244696420796f7520686561722061626f7574207468652072756e6e65722077686f2077617320637269746963697a65643f204865206a75737420746f6f6b20697420696e20737472696465222c22737461747573223a3230307d`

Now into text! `{"id":"vkV0L6wcFlb","joke":"Did you hear about the runner who was criticized? He just took it in stride","status":200}`

Now we just do `JSON.parse` and BOOM! We got an object from a remote server in Code.org!