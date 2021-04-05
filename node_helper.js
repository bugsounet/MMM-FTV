/* node_helper.js
 * 
 * Magic Mirror
 * Module: MMM-FTV
 * 
 * Magic Mirror By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 * 
 * Module MMM-FTV By bugsounet (Cédric Dupont) bugsounet@bugsounet.fr
 * MIT Licensed.
 * 
 * This module is created for FTV enterprise (http://www.ftv-sa.com)
 * It's allow to displayed all news in MagicMirror screen
 */

var NodeHelper = require("node_helper");
var fs = require("fs");
const gm = require('gm');

FTV = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function() {
    this.config = null
    this.update = null
    this.restart = null
    this.pause = null
    this.imageList = []
    this.imageIndex = 0
    this.FileExtensions = ['bmp','jpg','png']
  },

  initialize: async function () {
    this.imageList = this.getImageList()
    FTV("Nb Images found:", this.imageList.length)
    if (this.imageList.length) {
      FTV("Check")
      await this.checkSize()
      FTV("check Done")
      this.delayedDisplay()
    } else {
      this.sendSocketNotification("EMPTY")
      this.reScan()
    }
  },

  checkSize: function() {
    let data= []
    this.imageList.forEach(image => {
      data.push(this.getSize(image))
    })
    return Promise.all(data)
  },

  getSize: function(image) {
    return new Promise((resolve, reject) => {
      gm(image.path +"/" + image.filename)
        .size(async (err, value) => {
          if (err) {
            console.log(err)
            return resolve()
          }
        if (this.config.personalized.usePortrait) {
          if ((value.height != 1920) || (value.width != 1080)) {
            FTV("backup " + image.filename, "...")
            fs.copyFileSync(image.path +"/" + image.filename, image.path +"/backupBeforeResize/" + image.filename)
            FTV("Resizing...")
            gm(image.path +"/" + image.filename)
              .resize(1080,1920, "!")
              .write(image.path +"/" + image.filename, err => {
                if (err) {
                  FTV("error!!!" , err)
                  resolve()
                }
                else {
                  FTV("Resize Done:", image.filename)
                  resolve()
                }
              })
          }
          else resolve()
        } else {
          if ((value.width != 1920) || (value.height != 1080)) {
            FTV("backup " + image.filename, "...")
            fs.copyFileSync(image.path +"/" + image.filename, image.path +"/backupBeforeResize/" + image.filename)
            FTV("Resizing...")
            gm(image.path +"/" + image.filename)
              .resize(1920,1080, "!")
              .write(image.path +"/" + image.filename, err => {
                if (err) {
                  FTV("error!!!" , err)
                  resolve()
                }
                else {
                  FTV("Resize Done:", image.filename)
                  resolve()
                }
              })
          }
          else resolve()
        }
      })
    })
  },

  // get images list
  getImageList: function() {
    var imageList = []
    var FileList = fs.readdirSync(path = this.config.imagePath)
    FTV("Read Image Path:", FileList)

    if (FileList.length) {
      var ImageList = []
      FileList.forEach(file => {
        var currentImage = {path: this.config.imagePath, filename: file}
        var isValidImageFileExtension = this.checkValidImageFileExtension(currentImage.filename)
        if (isValidImageFileExtension) ImageList.push(currentImage)
      })
      ImageList = ImageList.sort(this.sortByFilename)
      imageList = imageList.concat(ImageList)
      FTV("imageList", imageList)
    }

    return imageList
  },

  // File not found ?
  fileNotFound: function () {
    FTV("File not found!")
    clearTimeout(this.update)
    clearTimeout(this.restart)
    this.imageList = []
    this.imageIndex = 0
    this.initialize()
  },
  
  // Display images
  displayImage: function () {
    FTV("Index to display:", this.imageIndex)
    if (!this.imageList[this.imageIndex]) return this.fileNotFound()
    var file = this.imageList[this.imageIndex].path + "/" + this.imageList[this.imageIndex].filename
    FTV("Check File:", file)
    if (fs.existsSync(file)) {
      FTV("Ok, Display it!")
      this.sendSocketNotification("DISPLAY", file)
      this.scheduleUpdate()
    }
    else this.fileNotFound()
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "INIT") {
      this.config = payload
      this.config.duration = this.getUpdateIntervalMillisecondFromString(this.config.duration)
      this.config.retry = this.getUpdateIntervalMillisecondFromString(this.config.retry)
      this.config.pause = this.getUpdateIntervalMillisecondFromString(this.config.pause)
      if (this.config.debug) FTV = (...args) => { console.log("[FTV]", ...args) }
      FTV("Config:", payload)
      this.initialize()
    }
  },

  scheduleUpdate: function () {
    clearTimeout(this.restart)
    clearTimeout(this.update)
    clearTimeout(this.pause)
    this.update = setTimeout(() => {
      this.imageIndex += 1
      if (this.imageIndex > this.imageList.length -1) {
        FTV("All images complete.")
        this.imageIndex = 0
        this.initialize()
      }
      else this.delayedDisplay()
    }, this.config.duration)
  },
  
  delayedDisplay: function() {
    if (this.config.pause) FTV("Pause...")
    this.sendSocketNotification("EMPTY")
    clearTimeout(this.pause)
    this.pause = setTimeout(() => {
      FTV("Display Next Image.")
      this.displayImage()
    }, this.config.pause)
  },

  reScan: function() {
    clearTimeout(this.restart)
    FTV("Waiting for retry...")
    this.restart = setTimeout(() => {
      FTV("Fresh Delay.")
      clearTimeout(this.update)
      clearTimeout(this.pause)
      clearTimeout(this.restart)
      this.imageList = []
      this.imageIndex = 0
      this.initialize()
    }, this.config.retry)
  },

  /** Tools **/
  // sort by filename attribute
  sortByFilename: function (a, b) {
    aL = a.filename.toLowerCase()
    bL = b.filename.toLowerCase()
    if (aL > bL) return 1
    else return -1
  },

  // checks there's a valid image file extension
  checkValidImageFileExtension: function(filename) {
    var found = false
    this.FileExtensions.forEach(extension => {
      if (filename.toLowerCase().endsWith(extension)) found = true
    })
    return found
  },

  // convert string to milliseconds
  getUpdateIntervalMillisecondFromString: function(intervalString) {
   let regexString = new RegExp("^\\d+[smhd]{1}$")
   let updateIntervalMillisecond = 0

   if (regexString.test(intervalString)){
     let regexInteger = "^\\d+"
     let integer = intervalString.match(regexInteger)
     let regexLetter = "[smhd]{1}$"
     let letter = intervalString.match(regexLetter)

     let millisecondsMultiplier = 1000
      switch (String(letter)) {
        case "s":
          millisecondsMultiplier = 1000
          break
        case "m":
          millisecondsMultiplier = 1000 * 60
          break
        case "h":
          millisecondsMultiplier = 1000 * 60 * 60
          break
        case "d":
          millisecondsMultiplier = 1000 * 60 * 60 * 24
          break
      }
      // convert the string into seconds
      updateIntervalMillisecond = millisecondsMultiplier * integer
    } else {
      updateIntervalMillisecond = 1000 * 60 * 60 * 24
    }
    return updateIntervalMillisecond
  }

});
