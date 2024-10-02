const utils = require("./utils")

let data = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
let datahex = data.toString("hex")

let justH = []

function interpolateValues(startValue, endValue, data) {
    const interpolatedValues = [];
    let dataLength = data.length -1

    for (let segmentNumber = 0; segmentNumber <= dataLength; segmentNumber++) {
        const interpolatedValue = Math.round(startValue + (segmentNumber / dataLength) * (endValue - startValue));
        interpolatedValues.push({ value: interpolatedValue, char: data[interpolatedValues.length].char});
    }

    return interpolatedValues;
}

let encodeData = interpolateValues(1, 330, utils.hexData)
let usingLookup = encodeData.map((v)=> v.value)

console.log(encodeData.find((v)=> v.char === "0").value)
console.log(encodeData.find((v)=> v.value === 302).char)
console.log(utils.hexData.findIndex((v)=> v.char === "0"))

for (let char of datahex.split("")) {
    if (char == "=") continue
    // let index = encodeData.findIndex((v) => v.char == char) + 1
    // let h = index * hShifter
    justH.push(encodeData.find((v)=> v.char === char).value)
}
console.log(justH)