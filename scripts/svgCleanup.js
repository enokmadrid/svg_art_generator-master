const config = require("../settings/config.json");
const { optimize } = require('svgo');
const path = require("path");
const fs = require("fs");
const D3Node = require('d3-node');

// LAYERS BASE PATH 
const base = process.cwd();
const layersBasePath = path.join(base, "/layers");

// GET SVG FILES
const getSvgLayers = async (_layerType = null) => {
    return fs.readdirSync(`${layersBasePath}/${_layerType}/`, (layers) => {
        layers = layers.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item)); // Array of layer names in the group type
    });
}

// START OPTIMIZATION
const runSvgCleanup = async () => {
    for (var i = 0; i < config.layers.length; i++) {
        let files = await getSvgLayers(config.layers[i]);
        files = files.filter(e => e !== '.DS_Store'); // remove this mac hidden file, I cannnot find a better way to delete this

        // FOR EACH FILE, GET FILEPATH and SVGCODE
        files.forEach(fileName => {
            const svgFilePath = path.join(`${layersBasePath}/${config.layers[i]}/`, fileName);
            const svgCode = fs.readFileSync(svgFilePath, { encoding: 'utf-8'});
            
            // RUN IT!!
            const cleanCode = removeExtraIds(svgCode);
            const optimizedSvgCode = runSVGO(svgFilePath, cleanCode);
            
            // SAVE FILE
            fs.writeFileSync(svgFilePath, optimizedSvgCode); // replaces files
        });
    }
}

// RUNS SVGO
const runSVGO = (svgFilePath, svgCode) => {
    const result = optimize(svgCode, {
        path: svgFilePath,
        plugins: [
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        // customize default plugin options
                        inlineStyles: {
                            onlyMatchedOnce: false,
                        },
                        mergeStyles: false,
                        minifyStyles: false,
                        cleanupIDs: false
                    },
                },
                collapseGroups: true
            },
        ]
    });
    return result.data;
}

const removeExtraIds = (optimizedSvgCode) => {
    // MAKE OLD SVG D3 ELEMENT
    const options = {container: optimizedSvgCode}
    const oldSvg = new D3Node(options); // initializes D3 with container element
    const d3 = oldSvg.d3;
    
    // MAKE NEW ID FROM OLD ID
    var oldId = d3.select(oldSvg.document).select('svg').select('g').attr('id');
    var newId = oldId.split("/").pop(); // REMOVE everything before / for NEW ID
    
    // MAKE NEW SVG D3 ELEMENT
    const newSvgOptions = {container: optimizedSvgCode};
    const newSvg = new D3Node(newSvgOptions); // initializes D3 with container element
    const svg = newSvg.d3;
    
    // ASIGN NEW ID TO SVG DOCUMENT
    svg.select(newSvg.document)
        .select('svg')
        .select('g')
        .attr('id', newId)
        .select('g')
        .attr('id', null);
    
    // RETURN SVG CODE
    return newSvg.svgString();
}

const main = async () => {
    await runSvgCleanup();
}

main();