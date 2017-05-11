var $BinaryReader = BinaryReader.prototype;
$BinaryReader.readByte = BinaryReader$readByte;
$BinaryReader.readWord = BinaryReader$readWord;
$BinaryReader.readDWord = BinaryReader$readDWord;
$BinaryReader.readQWord = BinaryReader$readQWord;
$BinaryReader.readString = BinaryReader$readString;
$BinaryReader.readFloat = BinaryReader$readFloat;
$BinaryReader.readBool = BinaryReader$readBool;
$BinaryReader.readByteArray = BinaryReader$readByteArray;
$BinaryReader.rawByteArray = BinaryReader$rawByteArray;

module.exports = BinaryReader;

function BinaryReader(data) {    
    this.buffer = Buffer.from(data);
    this.pointer = 0;
}

function BinaryReader$readByte() {
	var tmp = this.buffer.readUInt8(this.pointer);
    this.pointer++;
    return tmp;
}

function BinaryReader$readWord() {
	var tmp = this.buffer.readUInt16LE(this.pointer); 
    this.pointer += 2;
    return tmp;
}

function BinaryReader$readDWord() {
	var tmp = this.buffer.readUInt32LE(this.pointer); 
    this.pointer += 4;
    return tmp;
}

function BinaryReader$readQWord() {
	var tmp = this.buffer.readDoubleLE(this.pointer); 
    this.pointer += 8;
    return tmp;
}

function BinaryReader$readString(len) {
	if(Number.isInteger(len)) {
		var tmp = this.buffer.toString('ascii', this.pointer, this.pointer + len); 
		this.pointer += len;
		return tmp;
	} else {
		return false;
	}
}

function BinaryReader$readFloat() {
    var tmp = this.buffer.readFloatLE(this.pointer); 
    this.pointer += 4;
    return tmp;
}

function BinaryReader$readBool() {
	var tmp = this.buffer.readUInt8(this.pointer);
	this.pointer++;
    if (tmp == 1) {
        return true;
    }
    else {
        return false;
    }
}

function BinaryReader$readByteArray(size) {
	var tmp = this.buffer.slice(this.pointer, this.pointer + size);
	this.pointer += size;
    return tmp;
}

function BinaryReader$rawByteArray() {
    return this.buffer;
}