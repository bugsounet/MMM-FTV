# MMM-FTV

-- Professional module --

```js
/*
 * Module MMM-FTV By bugsounet (Cédric Dupont) bugsounet@bugsounet.fr
 * MIT Licensed.
 * 
 * This module is created for FTV enterprise (http://www.ftv-sa.com)
 * It's allow to displayed all entreprise news in MagicMirror screen
 */
```

## Installation

```sh
cd ~/MagicMirror/modules
git clone https://github.com/bugsounet/MMM-FTV
cd MMM-FTV
npm install
```

## Description

This modules make a slideshow of picture and display it in MagicMirror.<br>
It's used in my job for creating a slideshow of my entreprise's news

## Configuration

```js
   {  
      module: "MMM-FTV",
      position: "fullscreen_above",
      configDeepMerge: true,
      config: {
        debug: false,
        imagePath: 'modules/MMM-FTV/photos',
        duration: "40s",
        pause: "15s",
        retry: "1m",
        personalized: {
          useLogo: true,
          logo: "logo.jpg",
          useSlogan: true,
          slogan: "FIXATION TECHNIQUE DE VIREUX",
          usePortrait: false
        }
      }
    },
```

## Configuration Structure

* `debug`: debug mode. For enable: set to `true`
* `imagePath`: Path of the image directory
* `duration`: delay to display the picture in MagicMirror
* `pause`: delay to display main screen of MagicMirror
* `retry`: if no picture found, delay before rescan the `imagePath` directory

### `personalized: {}` field
* `useLogo`: allow to display logo of the entreprise
* `logo`: logo of the entreprise
* `useSlogan`: allow to display slogan of the entreprise
* `slogan`: slogan of the enterprise
* `usePortrait`: allow to use portrait mode displaying

## Notes

* Picture format must be: `bmp`,`jpg` or `png`
* Natural size of the picture: 1920X1080 or 1080X1920 in portrait mode
* If not natural size: the picture will be resized for fullscreen (no ratio) and origianl file was save in `backupBeforeResize` directory

## Support and helping

Support is now on [the 4th Party Modules Forum](http://forum.bugsounet.fr)
