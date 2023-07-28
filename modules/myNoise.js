const cheerio = require('cheerio');
const fs = require('fs');
const {scrapeToFile, readScrapeFromFile} = require('../util/scrapeIO.js');
const {readJSONLToArray} = require('../util/IO.js');

// const noiseMachineInfo = require('../output/noiseGeneratorInfo.json');

const noiseMachineCategories = [
    { id: 'NB', name: 'Noise Blocker' },
    { id: 'HC', name: 'Health Care' },
    { id: 'ST', name: 'Sound Therapy' },
    { id: 'MN', name: 'Meditation' },
    { id: 'EE', name: 'Eerie' },
    { id: 'TN', name: 'Tonal' },
    { id: 'MU', name: 'Musical' },
    { id: 'CL', name: 'Calibrated' },
    { id: 'HP', name: 'Headphones' },
    { id: 'UFV', name: 'Patron Favorite' },
    { id: 'CU', name: 'Custom' }
];

const parseMyNoiseScrape = (sourceFileName) => {
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

    const noiseMachineInfo = {
        listNames: [],
        //noiseMachineCategories: noiseMachineCategories,
        noiseMachineCategories: [],
        noiseMachines: []
    };

    const noiseMachineCategoryIcons  = $('img.powertip');
    $(noiseMachineCategoryIcons).each(function (i, elem) {
        const classes = $(elem).attr('class').split(/\s+/);;
        classes.pop(); // removes powertip class, which leaves "I<category abbreviation>" (eg: IPHO)
        const categoryId = classes[0].substring(1).toLowerCase();  // remove I prefix
        const categoryTitle = $('img.' + classes).first().attr('title');
        noiseMachineInfo.noiseMachineCategories.push({id: categoryId, name: categoryTitle });
    });

    const generatorLists = $('div.generator-list');
    $(generatorLists).each(function (i, elem) {
        const h1 = $(elem).find('h1');
        $(h1).find('a, span').remove();
        const title = $(h1).text().trim();
        noiseMachineInfo.listNames.push(title);
    });

    const noiseMachineLinks = $('.generator-list .DIM a');
    $(noiseMachineLinks).each(function (i, elem) {
        const h1 = $(elem).closest('.generator-list').find('h1');
        $(h1).find('a, span').remove();
        const parentTitle = $(h1).text().trim();
        const classNames = $(elem).attr('class');
        let categories = [];
        if (classNames !== undefined) {
            categories = $(elem).attr('class').split(/\s+/);
            categories.pop(); // removes 'hint'
            categories.pop(); // removes machine short name
        }

        const categoryList = categories.map(cat => {
            return noiseMachineInfo.noiseMachineCategories.find(x => x.id === cat)
        });

        let href = $(elem).attr('href');
        href = href.startsWith('.') ? href.substring(1) : href;
        noiseMachineInfo.noiseMachines.push({
            id: i,
            name: $(elem).text(),
            href: href,
            generatorType: parentTitle,
            categories: categoryList
        });
    });

    const info = { noiseMachineInfo: noiseMachineInfo };

    fs.writeFileSync('output/noiseGeneratorInfo.json', JSON.stringify(info));
    console.log('Noise Generator json saved!');
}

const mergeNoiseGeneratorInfo = () => {
    const data1 = require('../output/noiseGeneratorInfo copy.json'); // manually update this after file copy
    const data2 = require('../output/noiseGeneratorInfo.json');
    
    const noiseMachines = data1.noiseMachineInfo.noiseMachines.map(nm => {
        return {
            "name": nm.name,
            "href": nm.href
        };
    });

    data2.noiseMachineInfo.noiseMachines.forEach(nm => {
        if (nm.href === undefined) {
            console.log('href empty for ' + nm.name);
            return;
        }

        const found = noiseMachines.find(ogNM => ogNM.href.toLowerCase() === nm.href.toLowerCase());
        if (!found) {
            noiseMachines.push({ "name": nm.name, "href": nm.href });
        }
    });

    fs.writeFileSync('output/noiseMachines.json', JSON.stringify(noiseMachines));
    console.log('Noise Machine json saved!');
}

const mergeMissingNoiseGeneratorInfo = () => {
    const noiseMachines = require('../output/noiseGeneratorInfo.json');
    const failedPosts = readJSONLToArray('posts_with_undefined_noise_machines.jsonl');
    const newNoiseMachineDefinitions = [];

    // TODO: Finish this
    failedPosts.forEach(post => {
        post.undefined_noise_machines.forEach(undefinedNM => {

            let foundNM = noiseMachines.find(nm => nm.href.toLowerCase().contains(undefinedNM.toLowerCase()));
            if (foundNM) {
                // ummmmm....need to do additional troubleshooting
                console.log('Noise machine found by href for ' + undefinedNM);
                return;
            }

            // TODO: scrape noisemachine
            // if successful, add to dictionary
            newNoiseMachineDefinitions.push({ "name": nm.name, "href": nm.href });
        });
    });

    // TODO: append newNoiseMachineDefinitions to noiseMachines

    // TODO: Write it back
    // fs.writeFileSync('output/noiseMachines.json', JSON.stringify(noiseMachines));
    console.log('Noise Machine json saved!');
}

const scrapeNoiseMachineTitles = () => {
    const noiseMachines = require('../output/noiseMachines.json');
    const basePath = '/noiseMachinePages/';
    const baseUrl = 'https://mynoise.net/';
    console.log('lets dance, paco');

    // Iterate output/noiseGenerators
    for(var i=0;i<noiseMachines.length;i++) {
        
        if (noiseMachines[i].href === undefined) {
            console.log('href not found for ' + noiseMachines.name);
            continue;
        }

        const href = noiseMachines[i].href.substr(1);
        const targetNoiseMachinePath = baseUrl + href;
        const fileName = noiseMachines[i].name.replace(/ /g,'') + '.html';
        const savePath = basePath + fileName;

        console.log('scraping #' + i + ': ' + savePath);
        scrapeToFile(targetNoiseMachinePath, savePath);
    }

    console.log('Noise Machine Titles scraped');
}

const hydrateNoiseMachineInfo = () => {
    const noiseMachines = require('../output/noiseMachines.json');
    const basePath = '/noiseMachinePages/';
    const targetHydratedPath = 'output/noiseGeneratorInfo_hydrated.json';

    noiseMachines.forEach((noiseMachine) => {
        const fileName = noiseMachine.name.replace(/ /g,'') + '.html';
        const title = parseNoiseMachineTitle(basePath + fileName);
        noiseMachine.title = title;
    });

    fs.writeFileSync(targetHydratedPath, JSON.stringify(noiseMachines));
    console.log('Noise Generator titles hydrated, json saved to: ' + targetHydratedPath);
}

const parseNoiseMachineTitle = (sourcePath) => {
    const body = readScrapeFromFile(sourcePath);
    const $ = cheerio.load(body);
    const title = $('.mainTitle span').first().text().trim();
    return title;
}

exports.parseMyNoiseScrape = parseMyNoiseScrape;
exports.scrapeNoiseMachineTitles = scrapeNoiseMachineTitles;
exports.hydrateNoiseMachineInfo = hydrateNoiseMachineInfo;
exports.mergeNoiseGeneratorInfo = mergeNoiseGeneratorInfo;
exports.mergeMissingNoiseGeneratorInfo = mergeMissingNoiseGeneratorInfo;