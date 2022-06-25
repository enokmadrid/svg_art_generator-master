const fs = require("fs");
const { loadImage } = require('canvas')

const getAttributes = async (_path) => {
    return fs
        .readdirSync(_path)
        .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
        .map((i, index) => {
            return {
                id: index,
                filename: i
            }
        })
}

// Fetch Layer
const loadAttribute = async (_path) => {
    return new Promise(async (resolve) => {
        const attribute = await loadImage(_path);
        resolve({ path: _path, attribute: attribute });
    })
}

module.exports = {
    getAttributes,
    loadAttribute
}