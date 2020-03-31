const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const standard_input = process.stdin;
standard_input.setEncoding('utf-8');

String.prototype.initCap = function () {
  return this.toLowerCase().replace(/(?:^|\s)[a-z]/g, function (m) {
     return m.toUpperCase();
  });
};

function getMenuSelection() {
  console.log('///////////////////////////////');
  console.log('/////  Supergen Scraper  //////');
  console.log('///////////////////////////////');
  console.log('');
  console.log('Commands:');
  console.log('scrape - Scrape Supergen Masterlist');
  console.log('export - Export Supergen meta');
  console.log('exit   - Exit');

  standard_input.on('data', function (data) {
    if(data === 'exit\r\n') {
      console.log("User input complete, program exit.");
      process.exit();
    } else if(data === 'scrape\r\n') {
      scrapeToFile();
    } else if(data === 'export\r\n') {
      parseScrape();
    } else {
      console.log('Invalid input');
    }
  });
}

function readScrapeFromFile() {
  var fs = require('fs'),
    path = require('path'),    
    filePath = path.join(__dirname, 'scraped-supergens.html');
  return fs.readFileSync(filePath, {encoding:'utf-8', flag:'r'});
}

function scrapeToFile(url) {
  const options = {
    uri: url,
    transform: function (body) {
      return cheerio.load(body);
    }
  };

  rp(options)
  .then(($) => {
    const body = $('body');
    fs.writeFile('scraped-supergens.html', body, (err) => {
      if (err) throw err;
      console.log('Supergen html scraped and saved!');
    });

  })
  .catch((err) => {
    console.log(err);
  });
}

function addToList(newItems, targetList) {
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
      const newSound = {id: targetList.length, name: nextSoundInitCap};
      targetList.push(newSound);
      result.itemSounds.push(newSound);
    }

    result.targetList = targetList.sort((a, b) => (a.name > b.name) ? 1 : -1);
    result.itemSounds = result.itemSounds.sort((a, b) => (a.name > b.name) ? 1 : -1);
  });
  return result;
}

function parseScrape() {
  const body = readScrapeFromFile();
  const $ = cheerio.load(body);
  
  // This assumes the following html structure for supergen links and corresponding descriptions. This may change in the future.
  //<p class="_1qeIAgB0cPwnLhDF9XSiJM"><a href="http://goo.gl/CUyAxI" class="_3t5uN8xUmg0TOwRCOGQEcU" rel="noopener noreferrer" target="_blank">Aboard an Interstellar Spacecraft</a> <a href="https://redd.it/2j8gz2" class="_3t5uN8xUmg0TOwRCOGQEcU" rel="noopener noreferrer" target="_blank">(Link)</a></p>
  //<ul class="_33MEMislY0GAlB78wL1_CR"><li class="_3gqTEjt4x9UIIpWiro7YXz"><p class="_1qeIAgB0cPwnLhDF9XSiJM">Sounds Used: Aircraft Cabin Noise, Binaural Beat Machine, Temple Bells, Twilight</p></li></ul>
  
  const links = $('p._1qeIAgB0cPwnLhDF9XSiJM a._3t5uN8xUmg0TOwRCOGQEcU:first-child'); // p a // a._3t5uN8xUmg0TOwRCOGQEcU
  const supergenInfo = {
    sounds: [],
    supergens: []
  };

  $(links).each(function(i, elem) {
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

  fs.writeFileSync('supergens.js', JSON.stringify(supergenInfo));
  console.log('Supergens json saved!');
}

//scrapeToFile(`https://www.reddit.com/r/MyNoise/comments/3hw95k/supergen_masterlist/`);
//parseScrape();
getMenuSelection();