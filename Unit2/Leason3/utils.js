const base64Data = [
    { char: "A" },
    { char: "B" },
    { char: "C" },
    { char: "D" },
    { char: "E" },
    { char: "F" },
    { char: "G" },
    { char: "H" },
    { char: "I" },
    { char: "J" },
    { char: "K" },
    { char: "L" },
    { char: "M" },
    { char: "N" },
    { char: "O" },
    { char: "P" },
    { char: "Q" },
    { char: "R" },
    { char: "S" },
    { char: "T" },
    { char: "U" },
    { char: "V" },
    { char: "W" },
    { char: "X" },
    { char: "Y" },
    { char: "Z" },
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
    { char: "9" },
    { char: "+" },
    { char: "/" }
  ]
  
  const hexData = [
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
    { char: "9" },
  ]
  
  const binaryData = [
    { char: "0" },
    { char: "1" }
  ]
  
  const RGBToHSL = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
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
  };
  
  const HSLToRGB = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
  };
  
  function closest(num, arr) {
    let curr = arr[0];
    let diff = Math.abs(num - curr);
    for (const element of arr) {
      let newdiff = Math.abs(num - element);
        if (newdiff < diff) {
            diff = newdiff;
            curr = element;
        }
    }
    return curr;
  }
  
  module.exports = {
    HSLToRGB,
    RGBToHSL,
    closest,
    base64Data,
    hexData,
    binaryData
  }