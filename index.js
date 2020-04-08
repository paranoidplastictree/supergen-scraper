const { scrapeToFile } = require('./util/scrapeIO.js');
const { parseSupergenScrape } = require('./modules/masterList.js');
const { parseMyNoiseScrape, scrapeNoiseMachineTitles, hydrateNoiseMachineInfo } = require('./modules/myNoise.js');
const standard_input = process.stdin;
standard_input.setEncoding('utf-8');

function getMenuSelection() {
  console.log('///////////////////////////////');
  console.log('/////  Supergen Scraper  //////');
  console.log('///////////////////////////////');
  console.log('');
  console.log('Commands:');
  console.log('> exit - Exit');
  console.log('..Reddit Master List..');
  console.log('    > scrape masterlist - Scrape Supergen Masterlist');
  console.log('    > export supergen - Export Supergen meta');
  console.log('..MyNoise Noise Generators..');
  console.log('    > scrape mynoise - Scrape MyNoise Noise Machines');
  console.log('    > export mynoise meta - Export MyNoise Noise Machine meta');
  console.log('    > scrape noise machine pages - Scrape EACH AND EVERY MyNoise Noise Machine Page to obtain titles');
  console.log('    > hydrate mynoise meta - Parses scraped noise machine pages for the correct title');

  const supergenMasterListUrl = `https://www.reddit.com/r/MyNoise/comments/3hw95k/supergen_masterlist/`;
  const supergenScrapeFileName = 'scraped-supergens.html';
  const myNoiseMachinesUrl = 'https://mynoise.net/noiseMachines.php';
  const myNoiseScrapeFileName = 'scraped-noise-machines.html';
  
  standard_input.on('data', function (data) {
    switch(data) {
      case 'exit\r\n':
        console.log("User input complete, program exit.");
        process.exit();
      case 'scrape masterlist\r\n':
        scrapeToFile(supergenMasterListUrl, supergenScrapeFileName); break;
      case 'export supergen\r\n':
        parseSupergenScrape(supergenScrapeFileName); break;
      case 'scrape mynoise\r\n':
        scrapeToFile(myNoiseMachinesUrl, myNoiseScrapeFileName); break;
      case 'export mynoise meta\r\n':
        parseMyNoiseScrape(myNoiseScrapeFileName); break;
      case 'scrape noise machine pages\r\n':
        scrapeNoiseMachineTitles(); break;
      case 'hydrate mynoise meta\r\n':
        hydrateNoiseMachineInfo(); break;
      default:
        console.log('Invalid input');
    }
  });
}

getMenuSelection();