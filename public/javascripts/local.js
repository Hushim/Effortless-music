$(function() {
//
  $('#uploadFileFiled').on('click', function(e) {
    $('#uploadFileField').val('');
  });

  initialUploadMusicButton();
  initialEditButton();
  initialUpdateButton();
  initialDownloadButton();
  initialUploadImageFiled();
  initialUpdateImageButton();

  initialPlayButton();
  initialSelectButton();
  initialMuteButton();

  function initialEditButton() {
    $('#editButton').on('click', function() {
      $('.input').prop('disabled', false);
      $('.upload-img-button').toggleClass('hide-tag');
      $('#updateButton').prop('disabled', false);
      $('#editButton').prop('disabled', true);
      $('#selectButton').prop('disabled', false);
      $('#downloadButton').prop('disabled', true);
    });
  }

  function initialUpdateButton() {
    $('#updateButton').on('click', function() {
      $('.input').prop('disabled', true);
      $('.upload-img-button').toggleClass('hide-tag');
      $('#updateButton').prop('disabled', true);
      $('#editButton').prop('disabled', false);
      $('#downloadButton').prop('disabled', false);
      $('#selectButton').prop('disabled', true);
    });
  }

  function initialDownloadButton() {
    $('#downloadButton').on('click', function() {
      var selectedFile = $('#uploadFileField')[0].files[0];
      if(!selectedFile) {
        alert('pick a file');
        return;
      }

      var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
      var reader = new FileReader();
      reader.readAsArrayBuffer(selectedFile);
      

      reader.onload = function(e) {
        var arrayBuffer = reader.result;
        var buf = reader.result;
        console.log(arrayBuffer.byteLength);      
        audioCtx.decodeAudioData(arrayBuffer).then(function(decodedData) {
          var fileData = new FormData();
          var len = decodedData.length;
          var duration = decodedData.duration;
          var sampleRate = decodedData.sampleRate;
          var channelNum = decodedData.numberOfChannels;
          var channelData = new Float32Array(len * channelNum);
          console.log(decodedData);
          for (chl = 0; chl < channelNum; chl++) {
            channelData.set(decodedData.getChannelData(chl), len * chl);
            console.log(decodedData.getChannelData(chl));
          }
          var generatedBlob = new Blob([channelData]);
          fileData.append('channelNum', channelNum);
          fileData.append('duration', duration);
          fileData.append('sampleRate', sampleRate);
          fileData.append('pcmbinary', generatedBlob);
          fileData.append('startTime', start);
          fileData.append('endTime', end);

          // add metadata
          var $musicTitle = $('#music-title');
          var $artist = $('#artist');
          var $album = $('#album');
          var $editedImageBase64 = $('#music-cover')[0].src;
    
          editedData = {
            'musicTitle': $musicTitle.val(),
            'artist': $artist.val(),
            'album': $album.val(),
            'imageBase64': $editedImageBase64
          };
    
          editedDataString = JSON.stringify(editedData);
          fileData.append('editedData', editedDataString);
  
          $.ajax({
            type: 'POST',
            url: '/file-downloader',
            data: fileData,
            processData: false,
            contentType: false,
            success: function(data) {
              var musicBinaryBuffer = new Int8Array(data.data);
              saveEditedMusic([musicBinaryBuffer], $musicTitle.val() + '.mp3');
            }
          })
        });
      };

      reader.onerror = function(e) {
        console.log(e);
      };
    });
  }



  function initialUploadMusicButton() {
    $('#uploadFileButton').on('click', function() {
      $('#uploadFileButton').off('click');
      var selectedFile = $('#uploadFileField')[0].files[0];
      if (!selectedFile) {
        alert('pick a file');
        return;
      }

      $('#file-label').css('margin-top', '50px');

      var fileData = new FormData();
      fileData.append('ajaxfile', selectedFile);

      $.ajax({
        url: '/file-processing',
        data: fileData,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data) {
          console.log('ajax twice~!');
          $('#responsedData').html(data);
        }
      });
    });
  }

  function initialUpdateImageButton() {
    $('#updateImgButton').on('click', function() {
      $('#uploadImgFile').click();
    });
  }

  function initialUploadImageFiled() {
    $('#uploadImgFile').on('change', function() {
      var inputFiles = this;
      if(inputFiles.files && inputFiles.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          $('#music-cover').attr('src', e.target.result);
        }
        reader.readAsDataURL(inputFiles.files[0]);
      }
    });
  }

  function saveEditedMusic(bufferData, downloadFileName) {
    var linkEle = $('#downloadLink').find('a')[0];
    console.log(linkEle);
    var blob = new Blob(bufferData, {type: "octet/stream"});
    url = window.URL.createObjectURL(blob);
    linkEle.href = url;
    linkEle.download = downloadFileName;
    linkEle.click();
    window.URL.revokeObjectURL(url);
  }

  function initialPlayButton() {
    $('#playButton').on('click', function() {
      wavesurfer.playPause();
    });
  }

  try {
      var wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#B2EBE1',
      progressColor: '#00CBA9',
    });

    var editedFile = $('#uploadFileField')[0].files[0];
    loadBase64Music(editedFile);

  }
  catch (err) {
    console.log('There is an err if music-detail.hbs is not loaded');
  }

  var clickCount = 0;
  var start = 0;
  var end = 100000;

  function initialSelectButton() {
    $('#selectButton').on('click', function(){
      clickCount++;
      if (clickCount % 2 != 0) {
        $('#selectButton').html('Cut End');
        start = wavesurfer.getCurrentTime();
        $('#updateButton').prop('disabled', true);
      }
      if (clickCount % 2 === 0) {
        $('#selectButton').html('Cut Start');
        end = wavesurfer.getCurrentTime();
        $('#updateButton').prop('disabled', false);
      }
    });
  }

  function initialMuteButton() {
    $('#muteButton').on('click', function(){
      wavesurfer.toggleMute();
    })
  }

  function loadBase64Music(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
      wavesurfer.load(reader.result);
    };
  }
});
