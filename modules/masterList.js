const cheerio = require('cheerio');
const fs = require('fs');

String.prototype.initCap = () => {
    return this.toLowerCase().replace(/(?:^|\s)[a-z]/g, function (m) {
        return m.toUpperCase();
    });
};

const addToList = (newItems, targetList) => {
    const result = { itemSounds: [] };

    newItems.forEach((nextSound) => {
        const nextSoundInitCap = nextSound.initCap();
        let matchFound = false;

        targetList.forEach((targetListItem) => {
            if (targetListItem.name === nextSoundInitCap) {
                matchFound = true;
                result.itemSounds.push(targetListItem);
                return;
            }
        });

        if (!matchFound) {
            const newSound = { id: targetList.length, name: nextSoundInitCap };
            targetList.push(newSound);
            result.itemSounds.push(newSound);
        }

        result.targetList = targetList.sort((a, b) => (a.name > b.name) ? 1 : -1);
        result.itemSounds = result.itemSounds.sort((a, b) => (a.name > b.name) ? 1 : -1);
    });
    return result;
}

const parseSupergenScrape = (sourceFileName) => {
    const body = readScrapeFromFile(sourceFileName);
    const $ = cheerio.load(body);

    // This assumes the following html structure for supergen links and corresponding descriptions. This may change in the future.
    //<p class="_1qeIAgB0cPwnLhDF9XSiJM"><a href="http://goo.gl/CUyAxI" class="_3t5uN8xUmg0TOwRCOGQEcU" rel="noopener noreferrer" target="_blank">Aboard an Interstellar Spacecraft</a> <a href="https://redd.it/2j8gz2" class="_3t5uN8xUmg0TOwRCOGQEcU" rel="noopener noreferrer" target="_blank">(Link)</a></p>
    //<ul class="_33MEMislY0GAlB78wL1_CR"><li class="_3gqTEjt4x9UIIpWiro7YXz"><p class="_1qeIAgB0cPwnLhDF9XSiJM">Sounds Used: Aircraft Cabin Noise, Binaural Beat Machine, Temple Bells, Twilight</p></li></ul>

    const links = $('p._1qeIAgB0cPwnLhDF9XSiJM a._3t5uN8xUmg0TOwRCOGQEcU:first-child'); // p a // a._3t5uN8xUmg0TOwRCOGQEcU
    const supergenInfo = {
        sounds: [],
        supergens: []
    };

    $(links).each(function (i, elem) {
        const sounds = $(elem).parent().next('ul._33MEMislY0GAlB78wL1_CR').find('li p').text().replace('Sounds Used: ', '').split(', ');
        const result = addToList(sounds, supergenInfo.sounds);
        supergenInfo.sounds = result.targetList;

        supergenInfo.supergens.push({
            id: i,
            name: $(elem).text(),
            href: $(elem).attr('href'),
            sounds: result.itemSounds
        });
    });

    fs.writeFileSync('output/supergens.json', JSON.stringify(supergenInfo));
    console.log('Supergens json saved!');
}

exports.parseSupergenScrape = parseSupergenScrape;