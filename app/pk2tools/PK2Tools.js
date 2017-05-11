var Blowfish = require('./blowfish/Blowfish');
var hexdump = require('hexdump-js');
import clone from 'clone';
import {Uint64LE} from 'int64-buffer';
import {EventEmitter} from 'events';
import util from 'util';
import BinaryReader from './binary/BinaryReader';

module.exports = {
	create: create,
	PK2Tools: PK2Tools,
};

function create(options) {
	return new PK2Tools(options);
}

util.inherits(PK2Tools, EventEmitter);

var $PK2Tools = PK2Tools.prototype;
$PK2Tools.setKey = PK2Tools$setKey;
$PK2Tools.load = PK2Tools$load;
$PK2Tools.getRootFiles = PK2Tools$getRootFiles;
$PK2Tools.getRootFolders = PK2Tools$getRootFolders;
$PK2Tools.getFiles = PK2Tools$getFiles;
$PK2Tools.getSubFolders = PK2Tools$getSubFolders;
$PK2Tools.getFileBytes = PK2Tools$getFileBytes;
$PK2Tools._generateFinalBlowfishKey = PK2Tools$_generateFinalBlowfishKey;
$PK2Tools._read = PK2Tools$_read;
$PK2Tools._readSPK2Header = PK2Tools$_readSPK2Header;

function PK2Tools(options) {
	EventEmitter.call(this);

	options = this.options = {
		fileName: options && options.fileName || "PK2 File",
    	key: options && options.key || '169841',
    };

    this.asciiKey = this.options.key;
    this.key = this._generateFinalBlowfishKey(this.asciiKey);

    this.fileStream = null;
    this.size = null;

    this.blowfish = new Blowfish();
    this.blowfish.Initialize(this.key);
    
    this.header = null;

    this.folders = [];
    this.files = [];

    this.currentFolder = clone(Folder);
    this.currentFolder.name = this.options.fileName;
    this.currentFolder.nameSanitized = this.options.fileName;

    this.mainFolder = this.currentFolder;

}

function PK2Tools$load(fileArrayBuffer) {
	this.fileStream = new BinaryReader(fileArrayBuffer);
	this.size = this.fileStream.buffer.length;

	this.header = this._readSPK2Header(this.fileStream);

	if(this.header.name.includes("JoyMax File Manager!")) {
		this._read(this.fileStream.pointer);
		this.emit('fileLoaded');
	} else {
		this.emit('error', {message: "File is corrupted."});
	}

	
}

function PK2Tools$setKey(key) {
	this.options.key = key;

	this.asciiKey = this.options.key;
    this.key = this._generateFinalBlowfishKey(this.asciiKey);

    this.blowfish.Initialize(this.key);
}

function PK2Tools$getRootFiles() {
	return this.mainFolder.files
}

function PK2Tools$getRootFolders() {
	return this.mainFolder.subFolders
}

function PK2Tools$getFiles(parentFolder) {
	return parentFolder.files;
}

function PK2Tools$getSubFolders(parentFolder) {
	return parentFolder.subFolders;
}

function PK2Tools$getFileBytes(file) {
	this.fileStream.position = file.position;
	return this.fileStream.readByteArray(file.size);
}

function PK2Tools$_generateFinalBlowfishKey(asciiKey) {
	var baseKey, asciiKeyLength, aKey, bKey, bfKey;

	baseKey = new Buffer([0x03, 0xF8, 0xE4, 0x44, 0x88, 0x99, 0x3F, 0x64, 0xFE, 0x35, 0x00]);
	asciiKeyLength = Buffer.byteLength(asciiKey, 'ascii');

	//Max count of 56 key bytes
	if (asciiKeyLength > 56) {
		asciiKeyLength = 56;
	}

	//Get bytes from ascii
	aKey = Buffer.from(asciiKey, 'ascii');

	//This is the Silkroad base key used in all versions
	bKey = Buffer.alloc(56);

	//Copy key to array to keep the bKey at 56 bytes. bKey has to be bigger than aKey
	//to be able to xor every index of aKey.
	baseKey.copy(bKey, 0, 0, baseKey.length);

	// Joymax key modification algorithm for the final blowfish key
	bfKey = Buffer.alloc(asciiKeyLength);

	for (var i = 0; i < asciiKeyLength; ++i) {
		bfKey[i] = aKey[i] ^ bKey[i];
	}

	return bfKey;
}


function PK2Tools$_read(pointer) {
	var folders = [], entries = [];
	this.fileStream.pointer = pointer;
	var chunk = this.blowfish.Decode(Buffer.from(this.fileStream.readByteArray(2560)), 0, 2560);
	chunk = new BinaryReader(chunk);
	//console.log(hexdump(chunk.buffer.buffer));
	for (var i = 0; i < 20; i++) {
		var entry = clone(sPK2Entry);
		entry.type = chunk.readByte();
		entry.name = chunk.readString(81);
		entry.accessTime = chunk.readByteArray(8);
		entry.createTime = chunk.readByteArray(8);
		entry.modifyTime = chunk.readByteArray(8);
		entry.position = new Uint64LE(chunk.readByteArray(8)).toNumber();
		entry.size = chunk.readDWord();
		entry.nextChain = new Uint64LE(chunk.readByteArray(8)).toNumber();
		entry.padding = chunk.readWord();
		if (entry.type) {
			entries.push(entry);
		}
	}

	for (var entry of entries) {
		switch(entry.type) {
			case 0: //null entry
				break;
			case 1: //folder
				var nameSanitized = entry.name.replace(/\0/g, '');
				if(!entry.name.includes(".")) {
					var folder = clone(Folder);
					folder.name = entry.name;
					folder.nameSanitized = nameSanitized;
					folder.position = entry.position;
					folder.parentFolder = this.currentFolder;
					folders.push(folder);
					this.folders.push(folder);
					this.currentFolder.subFolders.push(folder);
				}
				break;
			case 2: //file
				var nameSanitized = entry.name.replace(/\0/g, '');
				var file = clone(File);
				file.name = entry.name;
				file.nameSanitized = nameSanitized;
				file.position = entry.position;
				file.size = entry.size;
				file.parentFolder = this.currentFolder;
				this.files.push(file);
				this.currentFolder.files.push(file);
				break;
			default:
				this.emit('error', {message: 'Wrong decryption key or file is corrupted.'});
				return;
		}
	}

	var lastEntry = entries[entries.length-1];

	//console.log('lastEntry1');
	//console.log(lastEntry);
	if(lastEntry.nextChain) {
		//console.log('lastEntry2');
		//console.log(lastEntry);
		this._read(lastEntry.nextChain);
	}

	for(var folder of folders) {
		this.currentFolder = folder;
		if (folder.position) {
			this._read(folder.position);
		}
	}
}

function PK2Tools$_readSPK2Header() {
	var header = sPK2Header;
	this.fileStream.pointer = 0;
	header.name = this.fileStream.readString(30);
	header.version = this.fileStream.readDWord();
	header.encryption = this.fileStream.readByte();
	header.verify = this.fileStream.readByteArray(16);
	header.reserved = this.fileStream.readByteArray(205);

	return header;
}

var sPK2Header = {
	name: null,
	version: null,
	encryption: null,
	verify: null,
	reserved: null,
}

var sPK2Entry = {
	type: null,
	name: null,
	nameASCII: null,
	accessTime: null,
	createTime: null,
	modifyTime: null,
	position: null,
	size: null,
	nextChain: null,
	padding: null,
}

var Folder = {
	name: null,
	nameSanitized: null,
	position: null,
	files: [],
	parentFolder: null,
	subFolders: [],
}

var File = {
	name: null,
	nameSanitized: null,
	position: null,
	size: null,
	parentFolder: null,
}