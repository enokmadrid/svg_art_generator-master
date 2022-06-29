const config = require("../settings/config.json");
const path = require("path");
const fs = require("fs");
const crypto = require('crypto');
const D3Node = require('d3-node');

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

//Define SVG Canvas
const createSVG = async () => {
    let imageCount = 1;
    let imagesFailed = 0;
    let attributesLoaded = [];
    let layerNames = [];
    let layerPaths = "";
    let imageHashes = [];
    let svgLayers = [];

    // RUN FOR EACH IMAGE TO CREATE
    while (imageCount <= config.image_count) {
        if (imagesFailed > 100) { break };

        // MAKE SVG WRAPPER
        const svgWrapper = new D3Node();
        svgWrapper.createSVG(config.image_details.width, config.image_details.height);

        // Determine Layer Path
        for (var i = 0; i < config.layers.length; i++) {

            // Fetch layers
            const attributes = await getAttributes(`${layersBasePath}/${config.layers[i]}/`);
            let totalWeight = 0;

            // Set Rarity
            for (var x = 0; x < attributes.length; x++) {
                totalWeight += rarity.layers[i].attributes[x].weight;
            }

            let random = Math.floor(Math.random() * totalWeight);
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
            layerPaths += layerPath;

            // Load layer, add to attributes
            const { path, attribute } = await loadAttribute(layerPath);
            attributesLoaded.push(attribute);
            
            // Get svg code for this layer
            var _svgLayer = fs.readFileSync(path, {encoding: 'utf8'});

            // Remove svg wrapper
            let layerD3 = new D3Node({container: _svgLayer});
            let d3 = layerD3.d3; // make selection
            let finalLayer = d3.select(layerD3.document).select('svg').html();

            // Add to final layers array
            svgLayers.push(finalLayer);
        }

        
        // MAKE Selector
        let selector = svgWrapper.d3;
        selector.select(svgWrapper.document).select('svg').html(svgLayers);
        let finalSvg = svgWrapper.svgString(); // save final svg code

        const imageHash = crypto.createHash('sha1').update(layerPaths).digest('hex');
        let isCreated;

        for (var i = 0; i < imageHashes.length; i++) {
            if (imageHash === imageHashes[i]) {
                console.log(`Image already created...\n`);
                imagesFailed++;
                attributesLoaded = [];
                layerPaths = [];
                svgLayers = [];
                isCreated = true;
            }
        }

        imageHashes.push(imageHash);

        if (isCreated) { continue };


        // Save Image & Metadata
        let svgFileName = `${config.image_description} #${imageCount}`;
        saveImage(imageCount, finalSvg);
        saveMetadata(createMetadata(imageHash, imageCount, defineAttributes(layerNames)), imageCount);

        console.log(imageHash);
        console.log(`Created Image: ${svgFileName}\n -----------------------`);

        // Increment, Reset values & canvas
        imageCount++;
        attributesLoaded = [];
        layerNames = [];
        layerPaths = "";
        svgLayers = [];
    }
}

// Save the SVG to File System
const saveImage = (_imageCount, svgCode) => {
    console.log(`Saving SVG to...  ${buildBasePath}/images/${_imageCount}.svg \n`);
    console.log(`SVG: ${svgCode} \n`);

    fs.writeFileSync(`${buildBasePath}/images/${_imageCount}.svg`, svgCode);
}

// Save the metadata
const saveMetadata = (_metadata, _imageCount) => {
    fs.writeFileSync(`${buildBasePath}/json/${_imageCount}.json`, JSON.stringify(_metadata, null, 2));
}

const main = () => {
    try {
        initialize();
        createSVG();
    } catch (error) {
        console.log(error);
    }
}

main();