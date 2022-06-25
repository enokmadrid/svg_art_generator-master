# Art Generator

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/)
- Generator comes with already created layers, you will need your own layers if you want to create different images

## Setting Up
### 1. Clone/Download the Repository

### 2. Install Dependencies:
`$ npm install`

### 3. (Optional) Import Layers
If you plan to use different layers than the one already provided, you'll need to update the *layers* folder with your custom layers.

### 4. Edit config.json
Inside of the settings folder, you will see a *config.json* file. You'll want to open it and edit the following values to your liking:
- **layers** (This will be a list of all your layers, *order is important!*)
- **image_description** (A description of your collection)
- **image_location** (IPFS link, don't worry about this until after you've uploaded the images to IPFS)
- **image_count** (How many images you want to generate)
- **image_details** (Adjust the width & height of the generated images)

### 5. Generate rarity.json
`$ node scripts/generateRarityConfig.js`.

This will generate a rarity.json file inside of settings, you can then edit the weight of specific attributes. By default all layers have a equal weight of 10. By lowering this number you'll get increase the rarity.

In more detail, if you have 5 attributes each with a weight of 10, the total weight is 50. A random number is generated from 0 to the total weight, in this case 50. Let's say the random number is 28, it will cycle through each attribute subtracting the weight by the random number until the random number reaches less than or equal to 0. Once that happens, that attribute is selected. 

### 5. Generate Images
`$ node scripts/create.js`

### 6. Upload your image folder to IPFS
After generating the images, a build folder will appear with all your images. You'll want to take the *image* folder and upload to IPFS.

### 7. Re-edit config.json
After uploading to IPFS, you'll want to update the IPFS link inside of config.json with a similar format to:
*ipfs://QmThdTBCR8DsnXMViDGC13EH9NughYzJrk7VjaAsRBmhX8*

### 8. Regenerate Metadata
`$ node scripts/regenerateMetadata.js`