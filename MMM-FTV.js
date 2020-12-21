/* global Module */

/* MMM-FTV.js
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

FTV = (...args) => { /* do nothing */ }

Module.register("MMM-FTV", {
  defaults: {
    debug: true,
    imagePath: 'modules/MMM-FTV/photos',
    duration: "15s",
    pause: "10s",
    retry: "1m",
    logo: "logo.jpg",
    slogan: "FIXATION TECHNIQUE DE VIREUX"
  },

  start: function () {
    if (this.config.debug) FTV = (...args) => { console.log("[FTV]", ...args) }
    this.loaded = false,
    this.error = null
    this.image = null
    if (!this.config.imagePath) this.error = "MMM-FTV: Missing required parameter."
    else {
      this.imageList = []
      this.sendSocketNotification('INIT', this.config)
    }
  },

  getStyles: function() {
    return ["MMM-FTV.css"]
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "DISPLAY") {
      if (payload) {
        this.loaded = true
        this.image = payload
        this.updateDom(1000)
      }
    }

    if (notification === "EMPTY") {
      this.loaded = false
      this.updateDom(500)
    }
  },

  getDom: function () {
    var wrapper = document.createElement("div")

    if (this.error != null) {
      wrapper.innerHTML = this.errorMessage
    }
    else {
      if (this.loaded === true) {
        var contener = document.createElement('div')
        contener.id = "FTV_CONTENER"
        var image = document.createElement("img")
        image.id = "FTV_IMAGE"
        if (this.image) {
          image.src = this.image 
          FTV("Display:", this.image)
        }
        contener.appendChild(image)
        wrapper.appendChild(contener)
      } else {
        var contener = document.createElement('div')
        contener.id = "FTV_CONTENER"
        var logo = document.createElement("img")
        logo.id = "FTV_LOGO"
        logo.src= "modules/MMM-FTV/resources/" + this.config.logo
        contener.appendChild(logo)
        var slogan = document.createElement("div")
        slogan.id= "FTV_SLOGAN"
        slogan.textContent = this.config.slogan
        contener.appendChild(slogan)
        wrapper.appendChild(contener)
      }
    }
    return wrapper
  }

});
