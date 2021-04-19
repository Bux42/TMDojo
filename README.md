
# TMDojo

  

TMDojo is a data visualization tool for Trackmania 2020

  

The goal is to be able to browse & visualize racing data, and maybe some machine learning

  

The project has three parts:
 - Front: (web ui with 3D view using THREE.js)
 - Plugin: (openplanet plugin that records racing data) 
 - Server: Recieves & stores racing
   data sent by the user's plugin, communicate with the front
  

The racing data gathered by the openplanet plugin is a list of 76 bytes blocks, at every frame-ingame, a new block is added to the list (144 FPS == 9 kb/s of data)


Each block stores 20 values:
 - CurrentRaceTime (int)
 - Position (Vec3)
 - AimYaw (float)
 - AimPitch (float)
 - AimDirection (Vec3)
 - Velocity (Vec3)
 - Speed (float)
 - InputSteer (float)
 - InputGasPedal & InputIsBraking (int)
 - EngineRpm (float)
 - EngineCurGear (int)
 - WheelsContactCount (int)
 - WheelsSkiddingCount (int)

How to use locally:
 - Install MongoDB and create a database named "Dojo" (make sure MongoClient url in app.js is the same as yours)
 - Run "npm install" in both /Server and /Front to auto install dependancies
 - Make sure the node server /Server/app.js is running
 - Run "ng serve" in /Front folder and browse http://localhost:4200/ for the web interface
 - Reload plugin in trackmania

If everything is working, the plugin will send racing data (upon respawn & race finish) to the node server, and you should be able to browse the data on the website