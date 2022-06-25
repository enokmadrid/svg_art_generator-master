const config = require("../settings/config.json")
const path = require("path");
const fs = require("fs");

const base = process.cwd()
const layersBasePath = path.join(base, "/layers")

const getLayers = async (_layerType = null) => {
    return fs
        .readdirSync(`${layersBasePath}/${_layerType}/`)
        .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
        .map((name) => {
            return {
                name
            }
        })
}

const generateConfig = async () => {
    const layers = []

    for (var i = 0; i < config.layers.length; i++) {
        const attributes = await getLayers(config.layers[i])

        for (var j = 0; j < attributes.length; j++) {
            attributes.forEach(attribute => {
                attribute.weight = 10
            })
        }

        let metadata = {}

        metadata.name = config.layers[i]
        metadata.attributes = attributes

        layers.push(metadata)
    }

    let rarityData = { layers }

    saveConfig(rarityData)
}

const saveConfig = (_config) => {
    fs.writeFileSync(`${base}/settings/rarity.json`, JSON.stringify(_config, null, 2))
}

const main = async () => {
    await generateConfig()
}

main()