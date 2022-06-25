const config = require('../settings/config.json')

const createMetadata = (_hash, _count, _attributes) => {
    let dateTime = Date.now();

    let metadata = {
        id: _hash,
        name: `#${_count}`,
        description: config.image_description,
        image: `${config.image_location}/${_count}.png`,
        edition: _count,
        date: dateTime,
        attributes: _attributes,
    }

    return metadata
}

const defineAttributes = (_names) => {
    let features = []
    let attributes = {}

    for (var i = 0; i < config.layers.length; i++) {
        attributes.trait_type = config.layers[i]
        attributes.value = _names[i].replace('.png', "")

        features.push(attributes)

        attributes = {}
    }

    return features
}

module.exports = {
    createMetadata,
    defineAttributes
}