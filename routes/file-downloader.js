var express = require('express');
var router = express.Router();

// add multer lib to support file uploads
var multer  = require('multer');
var upload = multer({ storage: multer.memoryStorage() });
const ID3Writer = require('browser-id3-writer');
var lamejs = require('lamejs');
var arrayBufferToBuffer = require('arraybuffer-to-buffer');


//Implementing music file processing here
router.post('/', upload.single('pcmbinary'), function(req, res) {
  if (!req.file) {
    res.status(500).send('error: no file');
  }

  if (false) {
    res.status(500).send('error: this is not a mp3 file');
  } else {
    var editedMusicBuffer = processAudio(req); //req.file;
    var editedMetadata = JSON.parse(req.body.editedData);
    var musicCover = convertBase64DataToBuffer(editedMetadata['imageBase64']);
    var duration = parseFloat(req.body.duration);

    const writer = new ID3Writer(editedMusicBuffer);
    writer.setFrame('TIT2', editedMetadata.musicTitle)
          .setFrame('TPE1', [editedMetadata.artist])
          .setFrame('TALB', editedMetadata.album)
          .setFrame('TYER', 2017)
          .setFrame('APIC', musicCover)
    writer.addTag();

    const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
    console.log("sadfj", taggedSongBuffer);
    res.json(taggedSongBuffer);
  }
});

function processAudio(req) {
//   console.log('Welcome to /split');

  // parse data received
  var pcmbinary = req.file.buffer;
  var channelNum = parseInt(req.body.channelNum); //1 for mono or 2 for stereo 
  var sampleRate = parseInt(req.body.sampleRate); //44.1khz (normal mp3 samplerate) 
  var kbps = 128;
  var duration = parseFloat(req.body.duration);
  var start = parseFloat(req.body.startTime);
  var end = parseFloat(req.body.endTime);

  // preprocess pcm data
  var tmpuint8 = new Uint8Array(pcmbinary);
  var pcmarrbuf = new ArrayBuffer(pcmbinary.byteLength);
  var pcmuint8 = new Uint8Array(pcmarrbuf);
  for (i = 0; i < pcmbinary.byteLength; i= i+3) {
    // loop unrolling
    pcmuint8[i] = tmpuint8[i];
    pcmuint8[i+1] = tmpuint8[i+1];
    pcmuint8[i+2] = tmpuint8[i+2];
  }
  var pcmfloat32 = new Float32Array(pcmarrbuf);
  var pcmuint16 = floatTo16Bit(pcmfloat32, 0);
  var pcmint16 = new Int16Array(pcmuint16);
   
  // parameters for encode
  // var samples = new Int16Array(44100); //one second of silence (get your data from the source you have) 
  var startOff = start * sampleRate;
  var endOff = end * sampleRate;
  var channelData = [];
  var chlLen = pcmint16.length / channelNum;
  for (var c = 0; c < channelNum; c++) {
    channelData.push(pcmint16.slice(c * chlLen, (c + 1) * chlLen))
  }
  var sampleBlockSize = 1152; //can be anything but make it a multiple of 576 to make encoders life easier 
  var mp3pieces = [];
  var mp3encoder = new lamejs.Mp3Encoder(channelNum, sampleRate, kbps);
  
  // start encoding
  console.time('Encode');  
  if (channelNum === 1) {
    for (var i = 0 + startOff; i < Math.min(endOff, channelData[0].length); i += sampleBlockSize) {
      var sampleChunk = channelData[0].subarray(i, i + sampleBlockSize);
      var mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
          mp3pieces.push(mp3buf);
      }
    }
  }
  if (channelNum === 2) {
    var left = channelData[0];
    var right = channelData[1];
    for (var i = 0 + startOff; i < Math.min(endOff, left.length); i += sampleBlockSize) {
      var leftChunk = left.subarray(i, i + sampleBlockSize);
      var rightChunk = right.subarray(i, i + sampleBlockSize);
      var mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3pieces.push(mp3buf);
      }
    }
  }
  console.timeEnd('Encode');
  var mp3buf = mp3encoder.flush();   //finish writing mp3 
  if (mp3buf.length > 0) {
      mp3pieces.push(mp3buf);
  }
  
  // convert mp3pieces to readable Buffer
  var allLen = 0;
  for (j = 0; j < mp3pieces.length; j++) {
    allLen+=mp3pieces[j].length;
  }
  var mp3Data = new Int8Array(allLen);
  var curLen = 0;
  for (k = 0; k < mp3pieces.length; k++) {
    mp3Data.set(mp3pieces[k], curLen);
    curLen+=mp3pieces[k].length;
  }
  var mp3Buffer = arrayBufferToBuffer(mp3Data);
  return mp3Buffer;
  // console.log(mp3Buffer);
  // save(mp3Data, 'test_single.mp3');
};

function floatTo16Bit(inputArray, startIndex){
  var output = new Int16Array(inputArray.length-startIndex);
  for (var i = 0; i < inputArray.length; i++){
      var s = Math.max(-1, Math.min(1, inputArray[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

function convertBase64DataToBuffer(base64DataString) {
  var matches = base64DataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  var response = {};
  if (matches.length !== 3) {
    res.status(500).send('The format of base64 string is incorrect');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');
  response.description = 'Music file';

  return response;
}

module.exports = router;