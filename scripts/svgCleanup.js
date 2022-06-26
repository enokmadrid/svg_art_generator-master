const config = require("../settings/config.json");
const { optimize } = require('svgo');
const path = require("path");
const fs = require("fs");

const svgFile = path.join(__dirname, '../layers/hat/', 'cap.svg');
const svgContent = fs.readFileSync(svgFile, { encoding: 'utf-8'});
const result = optimize(svgContent, {
  path: svgFile,
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
            cleanupIDs: false,
        },
      },
    },
  ]
});
const optimizedSvgString = result.data;

console.log(optimizedSvgString);

fs.writeFileSync(svgFile, optimizedSvgString);