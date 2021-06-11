# TMDojo Plugin

This is the main plugin to be used to record Trackmania replay data in real-time.

## Disclaimer

The plugin is actively being developed, and therefore it's not signed (as it changes from time to time). So in order to run the plugin locally, you need to have Club Access.

## Available data

The racing data gathered by the openplanet plugin is a list of 76 bytes blocks, collected every frame (assuming 60 frames per second).

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

## Linking the Dev Version to your Local Openplanet Directory

You can create a symbolic link for automatic synchronisation of the plugin with the command "mklink".
To do so, open `cmd` as admin, navigate to your Openplanet `/scripts` directory and run the following command:

`mklink Plugin_TMDojo.as [path to the plugin file in the repository]`

If done correctly, you should have a message like the one below:

![plugin link example](https://media.discordapp.net/attachments/833663831929520149/834025347212771378/unknown.png)
