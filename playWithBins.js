// Play with converting an array of values to better human readable format using the ASCII chart

const parse = (value) => {
  console.log(value);
  let ascii = "",
    bin = "";
  for (let i = 0; i < value.byteLength; i++) {
    bin += `${value.getUint8(i)} `;
    asciiF = () => {
      let v;
      switch (value.getUint8(i)) {
        case 0xa0:
          v = "+ ";
          break;
        case 0x00:
          v = "<NUL> ";
          break;
        case 0x01:
          v = "<SOH> ";
          break;
        case 0x02:
          v = "<STX> ";
          break;
        case 0x03:
          v = "<ETX> ";
          break;
        case 0x04:
          v = "<EOT> ";
          break;
        case 0x05:
          v = "<ENQ> ";
          break;
        case 0x06:
          v = "<ACK> ";
          break;
        case 0x07:
          v = "<BEL> ";
          break;
        case 0x08:
          v = "<BS> ";
          break;
        case 0x09:
          v = "<HT> ";
          break;
        case 0x0a:
          v = "<LF/NL> ";
          break;
        case 0x0b:
          v = "<VT> ";
          break;
        case 0x0c:
          v = "<FF> ";
          break;
        case 0x0d:
          v = "<CR> ";
          break;
        case 0x0e:
          v = "<SO> ";
          break;
        case 0x0f:
          v = "<SI> ";
          break;
        case 0x10:
          v = "<DLE> ";
          break;
        case 0x11:
          v = "<DC1> ";
          break;
        case 0x12:
          v = "<DC2> ";
          break;
        case 0x13:
          v = "<DC3> ";
          break;
        case 0x14:
          v = "<DC4> ";
          break;
        case 0x15:
          v = "<NAK> ";
          break;
        case 0x16:
          v = "<SYN> ";
          break;
        case 0x17:
          v = "<ETB> ";
          break;
        case 0x18:
          v = "<CAN> ";
          break;
        case 0x19:
          v = "<EM> ";
          break;
        case 0x1a:
          v = "<SUB> ";
          break;
        case 0x1b:
          v = "<ESC> ";
          break;
        case 0x1c:
          v = "<FS> ";
          break;
        case 0x1d:
          v = "<GS> ";
          break;
        case 0x1e:
          v = "<RS> ";
          break;
        case 0x1f:
          v = "<US> ";
          break;
        default:
          v = `${String.fromCharCode(value.getUint8(i))} `;
          break;
      }
      return v;
    };
    ascii += asciiF();
  }
  return [bin, ascii];
};
let toWrtieArray = [
  '0x01',
  'h',
  '1',
  1
];
let buffer = new ArrayBuffer(toWrtieArray.length);
let view = new DataView(buffer, 0);
let v
for (let i = 0; i < toWrtieArray.length; i++) {
  if ( typeof toWrtieArray[i] === 'string' && toWrtieArray[i].charAt(1) === 'x' ) {
    let hexString = toWrtieArray[i]
    let hex = hexString.replace(/^0x/, '');
    v = hex.match(/[\dA-F]{2}/gi);
  }
  else if ( typeof toWrtieArray[i] === 'number' ) {
    v = toWrtieArray[i]
  }
  else {
    v = new TextEncoder().encode(toWrtieArray[i])
  }
  view.setUint8(i,v)
}

console.log(parse(view));
