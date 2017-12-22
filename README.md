# Module 1 Group Assignment: The Describerator

CSCI 5117, Fall 2017

[Assignment description](https://docs.google.com/document/d/1956Z3EZJi9RWU6JqPHEh5ZZBmDOKFex-HtsBLz66tt4/edit#)

Please fill out all of the following sections to help us grade your submission:


## Name of App: Effortless Music


## Name of Team: Effortless HTZL 


## Students

* Shimao Hu, huxxx952@umn.edu
* Yifei Teng, tengx096@umn.edu
* Zhanghan Liu, liux3735@umn.edu 
* Yuqi Zhou, zhou0747@umn.edu


## Link to Site

<https://guarded-shelf-14594.herokuapp.com/>


## Key Features

**Describe the most challenging features you implemented
(one sentence per bullet, maximum 4 bullets):**

* Upload a music file with mp3 format and our website can show tags including music name, album name, artist name and cover picture of this music. 
* After getting these tags of the music, you can modify these tags and download the music with new tags.
* You can play the music and check wave form of this music.
* You can get a specific piece of this music by cutting function and download it. 

## Screenshots of Site

**[Add a screenshot of each key page (maximum 4)](https://stackoverflow.com/questions/10189356/how-to-add-screenshot-to-readmes-in-github-repository)
along with a very brief caption:**

![Screenshot](screenshot.png?raw=true "screenshot")


## External Dependencies

**Document integrations with 3rd Party code or services here.
Please do not document required libraries (e.g., Express, Bulma).**

* Library or service name: description of use
* btoa: encode a string in base64 and help send image and aduio file from server side to client side.
* multer: 1. store the uploaded file in memory storage as buffer object. After using memory storage, the file info will contain a field             called buffer that contains the entire file.
          2. handle file upload and accept a single file with a new file name.
* lamejs: Mp3 encoder. We use lamejs and three kinds of audio messages: channels, samplerate and kbps to encode mp3 file.
* save-file: Save cutted music piece as test.mp3 and music data is arraybuffer with actual saved data.
* into-stream: convert req.file.buffer into stream.
* browser-id3-writer: after modifying tags, writing tags to mp3 file.
* arraybuffer-to-buffer: convert a given arraybuffer to buffer.
* wavesurfer: create anything from an HTML5 audio player to a sophisticated DJ application.

**If there's anything else you would like to disclose about how your project
relied on external code, expertise, or anything else, please disclose that
here:**

...


## Links to Test Data

This project requires user-submitted data.  If you have files or other scripts 
that would be necessary (or helpful) for us to test your application, please 
link to them here.  For example, if your project parses gzipped apache logs, 
provide a few gzipped apache logs here.

* [Alex_Goot_Andie_Case_Shape_of_You](https://github.com/umn-5117-f17/module-1-group-assignment-effortless-htzl/blob/master/Alex_Goot_Andie_%20Case_Shape_of_You.mp3)
