const config = require("../settings/config.json")
const path = require("path");
const fs = require("fs");
const crypto = require('crypto');

// Define Paths
const base = process.cwd(); //current working directory
const buildBasePath = path.join(base, "/build");
const layersBasePath = path.join(base, "/layers");

// Define Rarity
let rarity;

// Define Helpers
const { getAttributes, loadAttribute } = require("../helpers/attributes");
const { createMetadata, defineAttributes } = require("../helpers/metadata");

const initialize = () => {
    try { // Determine if rarity.json exists
        rarity = require("../settings/rarity.json");
    } catch (error) {
        throw new Error('Missing rarity.json file');
    }

    if (fs.existsSync(buildBasePath)) { //remove buildpath if it exists
        fs.rmdirSync(buildBasePath, { recursive: true });
    }

    fs.mkdirSync(buildBasePath);
    fs.mkdirSync(path.join(buildBasePath, "/json"));
    fs.mkdirSync(path.join(buildBasePath, "/images"));
}

// Define Canvas
const { createCanvas } = require('canvas');
const canvas = createCanvas(config.image_details.width, config.image_details.height);
const ctx = canvas.getContext("2d");

// -- Create on the canvas
const createImage = async () => {
    let imageCount = 1;
    let imagesFailed = 0;
    let AttributesLoaded = [];
    let layerNames = [];
    let layersPath = "";
    let imageHashes = [];

    // We need a way to break out if image_count is higher than what can be generated...

    while (imageCount <= config.image_count) {
        if (imagesFailed > 100) { break }

        // Determine Layer Path
        for (var i = 0; i < config.layers.length; i++) {

            // Fetch layers
            const attributes = await getAttributes(`${layersBasePath}/${config.layers[i]}/`);
            let totalWeight = 0;

            for (var x = 0; x < attributes.length; x++) {
                totalWeight += rarity.layers[i].attributes[x].weight;
            }

            let random = Math.floor(Math.random() * totalWeight)
            let selectedLayer;

            for (var j = 0; j < attributes.length; j++) {
                // subtract the current weight from the random weight until we reach a sub zero value.
                random -= rarity.layers[i].attributes[j].weight;

                if (random < 0) {
                    selectedLayer = attributes[j].filename;
                    layerNames.push(attributes[j].filename);
                    break;
                }
            }

            // Determine layer path
            const layerPath = `${layersBasePath}/${config.layers[i]}/${selectedLayer}`;
            layersPath += layerPath;

            // Load layer
            const { path, attribute } = await loadAttribute(layerPath);
            AttributesLoaded.push(attribute);
        }

        const imageHash = crypto.createHash('sha1').update(layersPath).digest('hex');
        let isCreated;

        for (var i = 0; i < imageHashes.length; i++) {
            if (imageHash === imageHashes[i]) {
                console.log(`Image already created...\n`);
                imagesFailed++;
                AttributesLoaded = [];
                layersPath = [];
                isCreated = true;
            }
        }

        imageHashes.push(imageHash)

        if (isCreated) { continue }

        for (var i = 0; i < AttributesLoaded.length; i++) {
            ctx.drawImage(AttributesLoaded[i], 0, 0, config.image_details.width, config.image_details.height);
        }

        // Save Image & Metadata
        saveImage(imageCount);
        saveMetadata(createMetadata(imageHash, imageCount, defineAttributes(layerNames)), imageCount);

        console.log(imageHash);
        console.log(`Created Image: ${imageCount}\n`);

        // Increment, Reset values & canvas
        imageCount++;
        AttributesLoaded = [];
        layerNames = [];
        layersPath = "";
        ctx.clearRect(0, 0, config.image_details.width, config.image_details.height);
    }
}

// Save the image
const saveImage = (_imageCount) => {
    console.log(`Saving Image...\n`);

    fs.writeFileSync(
        `${buildBasePath}/images/${_imageCount}.png`,
        canvas.toBuffer("image/png")
    );
}

// Save the metadata
const saveMetadata = (_metadata, _imageCount) => {
    fs.writeFileSync(`${buildBasePath}/json/${_imageCount}.json`, JSON.stringify(_metadata, null, 2));
}

const main = () => {
    try {
        initialize();
        createImage();
    } catch (error) {
        console.log(error);
    }
}

main();