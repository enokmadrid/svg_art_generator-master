const config = require("../settings/config.json");
const { optimize } = require('svgo');
const path = require("path");
const fs = require("fs");

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
const optimizeSvgLayers = async () => {
	for (var i = 0; i < config.layers.length; i++) {
		let files = await getSvgLayers(config.layers[i]);
		files = files.filter(e => e !== '.DS_Store'); // remove this mac hidden file, I cannnot find a better way to delete this

		// FOR EACH FILE, GET FILEPATH and SVGCODE
		files.forEach(fileName => {
			const svgFilePath = path.join(`${layersBasePath}/${config.layers[i]}/`, fileName);
			const svgCode = fs.readFileSync(svgFilePath, { encoding: 'utf-8'});
			
			// RUN IT!!
			runOptimization(svgFilePath, svgCode);
		});
	}
}


// RUNS SVGO
const runOptimization = (svgFilePath, svgCode) => {
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
	const optimizedSvgCode = result.data;
	fs.writeFileSync(svgFilePath, optimizedSvgCode); // replaces files
}

const main = async () => {
	await optimizeSvgLayers();
}

main();