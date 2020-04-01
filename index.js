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
  console.log('scrape masterlist - Scrape Supergen Masterlist');
  console.log('export supergen meta - Export Supergen meta');
  console.log('scrape mynoise - Scrape MyNoise Noise Machines');
  console.log('exit   - Exit');

  const supergenMasterListUrl = `https://www.reddit.com/r/MyNoise/comments/3hw95k/supergen_masterlist/`;
  const supergenScrapeFileName = 'scraped-supergens.html';
  const myNoiseMachinesUrl = 'https://mynoise.net/noiseMachines.php';
  const myNoiseScrapeFileName = 'scraped-noise-machines.html';
  
  standard_input.on('data', function (data) {
    if(data === 'exit\r\n') {
      console.log("User input complete, program exit.");
      process.exit();
    } else if(data === 'scrape masterlist\r\n') {
      scrapeToFile(supergenMasterListUrl, supergenScrapeFileName);
    } else if(data === 'export supergen meta\r\n') {
      parseSupergenScrape(supergenScrapeFileName);
    } else if(data === 'scrape mynoise\r\n') {
      scrapeToFile(myNoiseMachinesUrl, myNoiseScrapeFileName);
    } else if(data === 'export mynoise meta\r\n') {
      parseMyNoiseScrape(myNoiseScrapeFileName);
    } else {
      console.log('Invalid input');
    }
  });
}

function readScrapeFromFile(sourceFileName) {
  var fs = require('fs'),
    path = require('path'),    
    filePath = path.join(__dirname, sourceFileName);
  return fs.readFileSync(filePath, {encoding:'utf-8', flag:'r'});
}

function scrapeToFile(sourceUrl, targetFileName) {
  const options = {
    uri: sourceUrl,
    transform: function (body) {
      return cheerio.load(body);
    }
  };

  rp(options)
  .then(($) => {
    const body = $('body');
    fs.writeFile('', body, (err) => {
      if (err) throw err;
      console.log('html scraped and saved!');
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

function parseSupergenScrape(sourceFileName) {
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

// TODO: Reuse this for both supergen sounds and noise machine categories
function addNewItems(newItems, targetList) {
  const result = { itemList: [] };

  newItems.forEach((nextItem) => {
    const nextItemInitCap = nextItem.initCap();
    let matchFound = false;

    targetList.forEach((targetListItem) => {
      if (targetListItem.name === nextItemInitCap) {
        matchFound = true;
        result.itemList.push(targetListItem);
        return;
      }
    });

    if (!matchFound) {
      const newItem = {id: targetList.length, name: nextItemInitCap};
      targetList.push(newItem);
      result.itemList.push(newItem);
    }

    result.targetList = targetList.sort((a, b) => (a.name > b.name) ? 1 : -1);
    result.itemList = result.itemList.sort((a, b) => (a.name > b.name) ? 1 : -1);
  });
  return result;
}

function parseMyNoiseScrape(sourceFileName) {
  const body = readScrapeFromFile(sourceFileName);
  const $ = cheerio.load(body);
  
  // This assumes the following html structure for mynoise noise machine links and associated meta. This may change in the future.
  // <div class="generator-list">
  //   <h1>category title here</h1>  
  //   <p>
  //     <span class="DIM FOREST">
  //       <img src="/Pix/fav.png" class="iFV" id="fFOREST" alt="favorite" onclick="favorite(&quot;FOREST&quot;)" title="Your favorites" style="display: inline; cursor: pointer;">
  //       <a href="./NoiseMachines/primevalEuropeanForestSoundscapeGenerator.php" onmouseover="play(&quot;FOREST&quot;)" onmouseout="stop()" class="NB MN UFV FOREST hint" style="cursor: pointer;">Primeval Forest</a>&nbsp;
  //       <img src="/Pix/ufav.png" class="iUFV" alt="patrons favorites" onclick="highlight(&quot;UFV&quot;)" style="cursor:pointer;">
  //       <img src="/Pix/moon.png" class="iNB" alt="moon" onclick="highlight(&quot;NB&quot;)" style="cursor:pointer;">
  //       <img src="/Pix/yin.png" class="iMN" alt="yin" onclick="highlight(&quot;MN&quot;)" style="cursor:pointer;"><br>
  //     </span>
  //     <span class="DIM SOMEOTHERNOISE">...</span>
  //   </p>
  // </div>
  const noiseMachineCategories = [
    { id: 'NB', name: 'Noise Blocker'},
    { id: 'HC', name: 'Health Care'},
    { id: 'ST', name: 'Sound Therapy'},
    { id: 'MN', name: 'Meditation'},
    { id: 'EE', name: 'Eerie'},
    { id: 'TN', name: 'Tonal'},
    { id: 'MU', name: 'Musical'},
    { id: 'CL', name: 'Calibrated'},
    { id: 'HP', name: 'Headphones'},
    { id: 'UFV', name: 'Patron Favorite'},
    { id: 'CU', name: 'Custom'}
  ];
  const noiseMachineInfo = {
    listNames: [],
    noiseMachineCategories: noiseMachineCategories,
    noiseMachines: []
  };

  const generatorLists = $('div.generator-list');
  $(generatorLists).each(function(i, elem) {
    const title = $(elem).find('h1').text();
    noiseMachineInfo.listNames.push(title);
  });

  const noiseMachineLinks = $(elem).find('.DIM a');
  $(noiseMachineLinks).each(function(i, elem) {
    const parentTitle = $(elem).parent('.generator-list').find('h1').text();
    let categories = $(elem).className.split(/\s+/);
    categories.pop(); // removes 'hint'
    categories.pop(); // removes machine short name

    const result = addNewItems(categories, noiseMachineInfo.noiseMachineCategories);
    noiseMachineInfo.noiseMachineCategories = result.targetList;
    noiseMachineInfo.noiseMachines.push({
      id: i,
      name: $(elem).text(),
      href: $(elem).attr('href'),
      categories: result.itemList // TODO: create a friendly mapping from class name to category name
    });
  });

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