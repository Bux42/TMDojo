
# TMDojo

  

TMDojo is a data visualization tool for Trackmania 2020

  

The goal is to be able to browse & visualize racing data

  

The project has three parts:
 - Front: (web ui with 3D view using THREE.js)
 - Plugin: (openplanet plugin that records racing data) 
 - Server: Recieves & stores racing
   data sent by the user's plugin, communicate with the front
  

The racing data gathered by the openplanet plugin is a list of 84 bytes blocks, at every frame-ingame, a new block is added to the list (1XX FPS == 8.4 kb/s of data)


Each block stores 21 values:
 - CurrentRaceTime (int)
 - Position (Vec3)
 - AimYaw (float)
 - AimPitch (float)
 - AimDirection (Vec3)
 - Velocity (Vec3)
 - Speed (float)
 - InputSteer (float)
 - InputGasPedal (int)
 - InputIsBraking (int)
 - EngineRpm (float)
 - EngineCurGear (int)
 - WheelsContactCount (int)
 - WheelsSkiddingCount (int)
 - UISequence (int)
