
# TMDojo

  

TMDojo is a data visualization tool for Trackmania 2020

![alt text](https://cdn.discordapp.com/attachments/424967293538402334/834084842084892772/unknown.png)

The goal is to be able to browse & analyse racing data, and maybe some machine learning

  

The project has three parts:
 - app: (web ui with 3D view using THREE.js)
 - plugins: (openplanet plugin that records racing data) 
 - server: Recieves & stores racing
   data sent by the user's plugin, communicate with the front
  

The racing data gathered by the openplanet plugin is a list of 76 bytes blocks, at every frame-ingame, a new block is added to the list (144 FPS == 9 kb/s of data)


Each block stores 19 values:
 - currentRaceTime (int)
 - position (Vec3)
 - aimYaw (float)
 - aimPitch (float)
 - aimDirection (Vec3)
 - velocity (Vec3)
 - speed (float)
 - inputSteer (float)
 - inputGasPedal & inputIsBraking (int)
 - engineRpm (float)
 - engineCurGear (int)
 - wheelsContactCount (int)
 - wheelsSkiddingCount (int)

How to use locally:
 - Install MongoDB and create a database named "dojo" (make sure MongoClient url in app.js is the same as yours)
 - Run "npm install" in both /server and /app to auto install dependancies
 - Make sure the node server /server/app.js is running
 - Run "npm run dev" in /app folder and browse http://localhost:4200/ for the web interface
 - Reload plugin in trackmania

You can create a symbolic link for automatic synchronisation of the plugin with the command "mklink"
To do so, open a cmd as admin, go to the script folder and run the following command:

`mklink Plugin_TMDojo.as [plugin repository path]`

If done correctly, you should have a message like the one below

![alt text](https://media.discordapp.net/attachments/833663831929520149/834025347212771378/unknown.png)


If everything is working, the plugin will send racing data (upon respawn & race finish) to the node server, and you should be able to browse the data on the website

Special thanks to the openplanet discord community, and tooInfinite for the feedbacks, ideas etc

Thanks to TheMrMiku for velocity feature!