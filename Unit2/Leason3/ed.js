const sharp = require("sharp")
const qr = require("bwip-js")
const fs = require("fs")

const utils = require("./utils")
const base64Data = utils.base64Data
const hexData = utils.hexData
const binaryData = utils.binaryData

const blockSize = 2;
const mode = "hex"
const maxHSL = 330 // lower?

let using = null

switch (mode) {
    case "base64":
        using = base64Data
        break;

    case "hex":
        using = hexData
        break;

    case "binary":
        using = binaryData
        break

    default:
        break;
}

// 0 - maxHSL
// encodeData.length

function interpolateValues(startValue, endValue, data) {
    const interpolatedValues = [];
    let dataLength = data.length -1

    for (let segmentNumber = 0; segmentNumber <= dataLength; segmentNumber++) {
        const interpolatedValue = Math.round(startValue + (segmentNumber / dataLength) * (endValue - startValue));
        interpolatedValues.push({ value: interpolatedValue, char: data[interpolatedValues.length].char});
    }

    return interpolatedValues;
}

let encodeData = interpolateValues(1, maxHSL, using)
let usingLookup = encodeData.map((v)=> v.value)

let pixel = (iX,iY,iW) => (iY * iW + iX) * 3

/**
 * 
 * @param {Array<Number>} HSL_Array
 * @returns 
 */
async function encode1(HSL_Array) {
    // Image properties
    // const width = 3840;
    // const height = 2160;
    const width = 300;
    const height = 400;

    // Create an image buffer
    const imageBuffer = Buffer.alloc(width * height * 3);

    let totalBlocks = width / blockSize

    let cX = 0
    let cY = 0

    // Loop through each hue in the array
    leave: for (let index in HSL_Array) {
        let hue = HSL_Array[index]

        if (false) {

            // Calculate the position of the block
            let x = (index % (totalBlocks)) * blockSize;
            let y = Math.floor(index / (totalBlocks)) * blockSize;

            // Check if the block exceeds the current line

            if (x + blockSize >= width) {
                // Move to the next line
                x = 0;
                y += blockSize
            }

            // console.log("e")
            // if (y + blockSize >= height) {
            //     console.log("???")
            // }
            let pixel = () => (y * width + x) * 3 // 3 is to make space for RGB (?)
            if (imageBuffer.readUint8(pixel()) != 0) console.log(x, y, hue)
            while ((pixel) + 2 < imageBuffer.length && imageBuffer.readUint8(pixel) != 0) {
                x += 1
                if (x + blockSize >= width) {
                    // Move to the next line
                    x = 0;
                    y += blockSize
                }
            }


            // Convert hue to RGB
            const rgb = utils.HSLToRGB(hue, 50, 50);

            // Fill the block with the RGB color
            for (let i = 0; i < blockSize && x + i < width; i++) {
                for (let j = 0; j < blockSize && y + j < height; j++) {
                    const pixelIndex = ((y + j) * width + (x + i)) * 3;
                    if (pixelIndex + 2 < imageBuffer.length) {
                        imageBuffer.writeUInt8(rgb[0], pixelIndex); // Red
                        imageBuffer.writeUInt8(rgb[1], pixelIndex + 1); // Green
                        imageBuffer.writeUInt8(rgb[2], pixelIndex + 2); // Blue
                    } else {
                        break leave;
                    }
                }
            }
        }

        // Convert hue to RGB
        const rgb = utils.HSLToRGB(hue, 50, 50);
        // console.log(rgb)

        if (cX >= width) {
            cX = 0
            cY += blockSize
        }

        if ( cY >= height) {
            console.log("WARNING!")
        }

        let wherePlace = pixel(cX,cY,width)
        if (imageBuffer.readUint8(wherePlace) != 0) console.log(x, y, hue)

        let x = cX
        let y = cY

        // Fill the block with the RGB color
        for (let i = 0; i < blockSize && x + i < width; i++) {
            for (let j = 0; j < blockSize && y + j < height; j++) {
                const pixelIndex = ((y + j) * width + (x + i)) * 3;
                if (pixelIndex + 2 < imageBuffer.length) {
                    imageBuffer.writeUInt8(rgb[0], pixelIndex); // Red
                    imageBuffer.writeUInt8(rgb[1], pixelIndex + 1); // Green
                    imageBuffer.writeUInt8(rgb[2], pixelIndex + 2); // Blue
                }
            }
        }
        cX += blockSize
    };

    return await sharp(imageBuffer, { raw: { width, height, channels: 3 } }).png().toBuffer()
}

async function decode1(pictureBuffer) {
    let { data, info } = await sharp(pictureBuffer).raw().toBuffer({ resolveWithObject: true })

    const { width, height } = info;
    const hueArray = [];

    // console.log("data", data[0], data[1], data[2])

    // Iterate through the pixels and extract the HSL values
    for (let y = 0; y < height; y += blockSize) {
        for (let x = 0; x < width; x += blockSize) {
            const offset = (y * width + x) * 3;
            const r = data[offset];
            const g = data[offset + 1];
            const b = data[offset + 2];

            // Convert RGB to HSL
            const hsl = utils.RGBToHSL(r, g, b);

            // Add the hue value to the array
            let val = Math.round(hsl[0])
            if (val == 0) continue
            hueArray.push(val);
        }
    }

    return hueArray
}

async function BufferToArray(buffer) {
    let b64 = Buffer.from(buffer).toString(mode)
    console.log("b64", b64)
    let justH = []

    for (let char of b64.split("")) {
        if (char == "=") continue
        // let index = encodeData.findIndex((v) => v.char == char) + 1
        // let h = index * hShifter
        justH.push(encodeData.find((v)=> v.char === char).value)
    }
    return justH
}

async function ArrayToBuffer(arr) {
    let outputB64 = []

    console.log("Decoding HSL To base64")
    for (let num of arr) {
        if (num == 0) continue
        // let charIndex = (num / hShifter) - 1
        // outputB64.push(encodeData[charIndex].char)
        let letter = encodeData.find((v)=> v.value === num)
        if (!letter) {
            let letterValue = utils.closest(num, usingLookup)
            letter = encodeData.find((v)=> v.value == letterValue)
        }
        // console.log(letter)
        outputB64.push(letter.char)
    }

    console.log("Joining Base64 ")
    let b64String = outputB64.join().replaceAll(",", "")
    let b64Output = Buffer.from(b64String, mode)
    return b64Output
}

module.exports = {
    encode: encode1,
    decode: decode1,
    BufferToArray,
    ArrayToBuffer
}