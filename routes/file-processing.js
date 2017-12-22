var express = require('express');
var router = express.Router();

// add multer lib to support file uploads
var multer  = require('multer');
var upload = multer({ storage: multer.memoryStorage() });
var btoa = require('btoa');
const intoStream = require('into-stream');


//Implementing music file processing here

router.post('/', upload.single('ajaxfile'), function(req, res) {
  if (!req.file) {
    res.status(500).send('error: no file');
  }

  if (req.file.mimetype != 'audio/mp3') {
    res.status(500).send('error: this is not a mp3 file');
  } else {
    var musicMetadata = require('musicmetadata');
    var readableMusicStream = intoStream(req.file.buffer);
    var parser = musicMetadata(readableMusicStream, function (err, metadata) {
      if (err) {
        res.status(500).send('Retrieving music-metadata error!');
      }

      if(metadata.hasOwnProperty('picture')) {
        var imageBase64String = convertImgBufferToBase64(metadata.picture);
        if(imageBase64String != null) {
          metadata['base64Data'] = imageBase64String;
        }
      }
      res.render('music-detail', metadata);
    });
  }

});

function convertImgBufferToBase64(imageMetaData) {
  if(imageMetaData == null || imageMetaData.length == 0) {
    return null;
  }

  if(!imageMetaData[0].hasOwnProperty('data')) {
    return null;
  }

  if(!imageMetaData[0].hasOwnProperty('format')) {
    return null;
  }
  var imageFormat = imageMetaData[0].format;

  if(!imageMetaData[0].hasOwnProperty('data')) {
      return null;
  }
  var imageBase64String = "";
  var coverImgData = imageMetaData[0].data;
  for (var bufferIndex = 0; bufferIndex < coverImgData.length; bufferIndex++) {
    imageBase64String += String.fromCharCode(coverImgData[bufferIndex]);
  }
  return "data:image/" + imageFormat + ";base64," + btoa(imageBase64String);

}

module.exports = router;