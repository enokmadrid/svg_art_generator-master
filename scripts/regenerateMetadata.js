const path = require("path")
const fs = require("fs")

const config = require('../settings/config.json')
const base = process.cwd()
const buildBasePath = path.join(base, "/build")

const main = async () => {
    const metadata = await getExistingMetadata()

    for (var i = 1; i <= metadata.length; i++) {
        const file = require(`${buildBasePath}/json/${i}.json`)

        file.description = config.image_description
        file.image = `${config.image_location}/${i}.png`

        fs.writeFileSync(`${buildBasePath}/json/${i}.json`, JSON.stringify(file, null, 2))
    }

    console.log(`\nUpdated Metadata\n`)
}

const getExistingMetadata = async () => {
    return fs
        .readdirSync(`${buildBasePath}/json/`)
        .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
        .map((i, index) => {
            return {
                id: index,
                filename: i
            }
        })
}

main()