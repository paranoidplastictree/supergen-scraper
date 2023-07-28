const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');

const readScrapeFromFile = (sourceFileName) => {
    var fs = require('fs'),
    filePath = 'scrapes/' + sourceFileName;
    return fs.readFileSync(filePath, { encoding: 'utf-8', flag: 'r' });
}

const scrapeToFile = (sourceUrl, targetFileName) => {
    const options = {
        uri: sourceUrl,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    rp(options)
        .then(($) => {
            //const body = $('body');
            const body = $.html();
            fs.writeFile('scrapes/' + targetFileName, body, (err) => {
                if (err) throw err;
                console.log('html scraped and saved!');
            });

        })
        .catch((err) => {
            console.log(err);
        });
}

exports.scrapeToFile = scrapeToFile;
exports.readScrapeFromFile = readScrapeFromFile;