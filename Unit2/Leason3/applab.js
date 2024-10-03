var blockSize = 2;
var width = 320;
var height = 450;
var maxHSL = 330;
var serverURL = "<urlHere>";
var debug = false;

var hexData = [
  { char: "a" },
  { char: "b" },
  { char: "c" },
  { char: "d" },
  { char: "e" },
  { char: "f" },
  { char: "g" },
  { char: "h" },
  { char: "i" },
  { char: "j" },
  { char: "k" },
  { char: "l" },
  { char: "m" },
  { char: "n" },
  { char: "o" },
  { char: "p" },
  { char: "q" },
  { char: "r" },
  { char: "s" },
  { char: "t" },
  { char: "u" },
  { char: "v" },
  { char: "w" },
  { char: "x" },
  { char: "y" },
  { char: "z" },
  { char: "0" },
  { char: "1" },
  { char: "2" },
  { char: "3" },
  { char: "4" },
  { char: "5" },
  { char: "6" },
  { char: "7" },
  { char: "8" },
  { char: "9" }
];

var helpers = {
  RGBToHSL: function(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  var l = Math.max(r, g, b);
  var s = l - Math.min(r, g, b);
  var h = s
    ? l === r
      ? (g - b) / s
      : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
},
  decode: function(data) {
    if (debug) console.log("Starting decode");
    var hueArray = [];

    var rowWidth = width * 4; // Cache width * 4
    var zeroCounter = 0; // To track consecutive `0` values
    var threshold = 100; // Stop if 50 consecutive zeroes are encountered
    
    for (var y = 0; y < height; y += blockSize) {
        var rowOffset = y * rowWidth; // Cache row start
    
        for (var x = 0; x < width; x += blockSize) {
            var offset = rowOffset + x * 4; // Calculate pixel offset
    
            var r = data[offset];
            var g = data[offset + 1];
            var b = data[offset + 2];
    
            // Inline the RGB to HSL conversion (if it's small and efficient)
            var hsl = helpers.RGBToHSL(r, g, b);
            var hue = Math.round(hsl[0]);
    
            // Check if the hue is zero
            if (hue === 0) {
                zeroCounter++;
                if (zeroCounter >= threshold) {
                    if (debug) console.log('Stopping scan, 50 consecutive zero values found.');
                    break; // Exit the loop early
                }
            } else {
                zeroCounter = 0; // Reset counter when non-zero hue is found
                hueArray.push(hue); // Add the non-zero hue to the array
            }
        }
    
        // Exit the outer loop if we've hit the threshold
        if (zeroCounter >= threshold) {
            break;
        }
    }
    
    if (debug) console.log("Decode done!");

    return hueArray;
},
  interpolateValues: function (startValue, endValue, data) {
    var interpolatedValues = [];
    var dataLength = data.length -1;

    for (var segmentNumber = 0; segmentNumber <= dataLength; segmentNumber++) {
        var interpolatedValue = Math.round(startValue + (segmentNumber / dataLength) * (endValue - startValue));
        interpolatedValues.push({ value: interpolatedValue, char: data[interpolatedValues.length].char});
    }

    return interpolatedValues;
},
  findValue: function(arr, value) {
  var out = null;
  for (var i = 0; i < arr.length; i++) {
    // console.log(i, arr[i]);
    if (arr[i].value==value) {
      out = arr[i];
    }
  }
  return out; // If no element is found
},
  ArrayToHex: function(arr) {
    var outputB64 = [];

    if (debug) console.log("Decoding HSL To base64");
    for (var numIndex in arr) {
        var num = arr[numIndex];
        if (num == 0) continue;
        // let charIndex = (num / hShifter) - 1
        // outputB64.push(encodeData[charIndex].char)
        var letter = helpers.findValue(encodeData, num);
        // console.log("letter")
        // console.log(!letter)
        // if (!letter) {
        //     var letterValue = utils.closest(num, usingLookup);
        //     function finder(v){
        //       return v.value == letterValue;
        //     }
        //     letter = encodeData.find(finder);
        // }
        // console.log(letter)
        outputB64.push(letter.char);
    }

    if (debug) console.log("Joining Base64");
    // var b64String = outputB64.join().replaceAll(",", "")
    var out = "";
    for (var i in outputB64) {
      var char = outputB64[i];
      out = out + char;
    }
    return out;
    // var b64Output = Buffer.from(b64String, mode)
    // return b64Output
},
  hexToText: function(hex) {
  var result = '';
  for (var i = 0; i < hex.length; i += 2) {
    result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return result;
}

};

var encodeData = helpers.interpolateValues(1, maxHSL, hexData);

// Debug mode
function debugMode(value) {
  debug = value;
}


// Make a http GET request!
function makeGetRequest(url, callback) {
  var reqid = Math.floor(Math.random() * 9999);
  var canvasID = "request-"+reqid;
  
  createCanvas(canvasID, width, height);
  hideElement(canvasID);

  var date = new Date().valueOf();
  drawImageURL(serverURL+"?date="+date+"&url="+url);

  function decodeData() {
    var data = getImageData(0, 0, width, height).data;
    if (data[0] === 0 && data[1] === 0 && data[2] === 0 && data[3] === 0) {
      setTimeout(decodeData, 100); // slow ahh code.org api
    } else {
      if (debug) console.log("Got data!");
      deleteElement(canvasID);
      var dataReal = helpers.decode(data);
      if (debug) console.log("Decoded");
      if (debug) console.log("dataReal");
      if (debug) console.log(dataReal);
      var real = helpers.ArrayToHex(dataReal);
      if (debug) console.log("Got hex data");
      var veryReal = helpers.hexToText(real);
      if (debug) console.log("Done!");
      if (debug) console.log(veryReal);
      
      try {
        callback(JSON.parse(veryReal));
      } catch (e) {
        callback(veryReal);
      }
      
    }
  }
  return decodeData();
}

// Tests a HTTP GET Request to the dad joke API
function test() {
  debugMode(true);
  var start = new Date();
  makeGetRequest("https://icanhazdadjoke.com", function (joke){
    var end = new Date();
    console.log(end-start);
    console.log(joke);
  }, true);
}
