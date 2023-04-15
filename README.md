# MapSlicer-CLI Documentation

MapSlicer-CLI is a command-line tool that allows you to slice the top off your Timberborn map so that you can edit it and then recombine it. This documentation provides instructions on how to install and use MapSlicer-CLI.

## Installation

To install MapSlicer-CLI, follow these steps:

1. Ensure that you have Node.js installed on your system.
2. Create a folder wherever you would like to install MapSlicer-CLI.
3. Right-click on the folder and select "Open terminal" to open a command-line interface.
4. Type `npm i mapslicer-cli` and press Enter

This will install MapSlicer-CLI as a global package on your system.

## Initial Setup

Once MapSlicer-CLI is installed, you can start the initial setup by typing `npx mapslicer-cli` into the same terminal window we used in the installation.

This will launch MapSlicer-CLI and prompt you to provide some configuration details.

1. The first prompt will ask you to provide the path to the Timberborn folder, located in your documents folder.

>You can leave this blank to accept the default path of `/Documents/Timberborn/`. If, for example, you have OneDrive, you would type `/OneDrive/Documents/Timberborn/`.

2. The second prompt will ask for the Timberborn map folder's path. You can almost always leave this blank to accept the default path of `Maps/`.

MapSlicer-CLI will then perform some setup tasks, including setting up the environment, and provide you with two shortcuts to launch and update MapSlicer-CLI.

## Usage

The tool is controlled using ony the keyboard. Nagivate the menu with the arrow keys and enter key.

### Slicing a Map

1. Select `Slice` from the command list on the main menu.
2. You will then be shown a list of all the maps in your Timberborn maps folder. Select the map you wish to Slice.
3. Enter the height value for the slice you wish to make (default value is 12).
4. MapSlicer will perform some checks and once completed, ask you to confirm you wish to proceed.
   - Pressing cancel will send you back to the main menu, with no changes or edits made.
   - Pressing confirm will perform the slice.
5. The system will then perform the slice!

> The entities that are removed from the map will be stored in the `entityStore` folder, and will have the same date & time-based prefix added to the name as the new sliced map. The sliced map is put directly into your Timberborn maps folder.
>
> Ensure you only delete files from the `entityStore` folder that you do not need anymore.

### Un-Slicing a Map

1. Select `Un-slice` from the command list on the main menu.
2. Select the map you wish to un-slice.
3. The tool will attempt to find the corresponding `entityStore` file to un-slice the entities.
   - If it cannot find the corresponding slice, it will throw an error and return to the menu.
4. Once it finds the corresponding slice, it will stitch them back together and re-order the entity array to ensure the world loads correctly.

> ## Important Note
> The system will not perform any validation on the integrity of the array, so if you place objects or buildings in the same location as something from the slice, the map will likely fail to load, and the game may crash. Ensure you only place new items where you know there is empty space that the slice does not take up, and ensure that there is the same buildable area after editing (E.G. if you edit the ground, and there was something from the slice on the ground, it will likely not be able to be built).

### Confoguration Setup

The config settings will be requested on first launch, or whenever the config.json fil ehas been deleted from your directory. To reset your install (without losing data), delete this file.

The Timberborn directory is th efolder that contains your custom created saved worlds. The maps directory is the folder within it that contains the maps.

## Conclusion

MapSlicer-CLI is a powerful tool for editing Timberborn maps, and this documentation provides instructions on how to install and use it. With MapSlicer-CLI, you can easily slice, edit, and recombine your Timberborn maps to assist in creating custom maps. Happy editing!