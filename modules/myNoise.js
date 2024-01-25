const cheerio = require('cheerio');
const fs = require('fs');
const {scrapeToFile, readScrapeFromFile} = require('../util/scrapeIO.js');
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
        noiseMachineCategories: noiseMachineCategories,
        noiseMachines: []
    };

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
            return noiseMachineCategories.find(x => x.id === cat)
        });

        noiseMachineInfo.noiseMachines.push({
            id: i,
            name: $(elem).text(),
            href: $(elem).attr('href'),
            generatorType: parentTitle,
            categories: categoryList
        });
    });

    const info = { noiseMachineInfo: noiseMachineInfo };

    fs.writeFileSync('output/noiseGeneratorInfo.json', JSON.stringify(info));
    console.log('Noise Generator json saved!');
}

const scrapeNoiseMachineTitles = () => {
    const noiseMachineInfo = require('../output/noiseGeneratorInfo.json');
    const basePath = '/noiseMachinePages/';
    const baseUrl = 'https://mynoise.net/';
    console.log('lets dance, paco');

    // Iterate output/noiseGenerators
    for(var i=0;i<noiseMachineInfo.noiseMachines.length;i++) {
        
        if (noiseMachines[i].href === undefined) {
            console.log('href not found for ' + noiseMachines.name);
            continue;
        }

        const href = noiseMachines[i].href.substr(1);
        const targetNoiseMachinePath = baseUrl + href;
        const fileName = noiseMachines[i].name.replace(/ /g,'') + '.html';
        const savePath = basePath + fileName;

        console.log('scraping ' + savePath);
        scrapeToFile(targetNoiseMachinePath, savePath);
    }
}

const hydrateNoiseMachineInfo = () => {
    const {noiseMachineInfo} = require('../output/noiseGeneratorInfo.json');
    const basePath = 'noiseMachinePages/';
    const targetHydratedPath = 'output/noiseGeneratorInfo_hydrated.json';
    const noiseMachines = noiseMachineInfo.noiseMachines;
    noiseMachines.forEach((noiseMachine) => {
        const fileName = noiseMachine.name.replace(/ /g,'') + '.html';
        const title = parseNoiseMachineTitle(basePath + fileName);
        noiseMachine.title = title;
    });

    noiseMachineInfo.noiseMachines = noiseMachines;

    fs.writeFileSync(targetHydratedPath, JSON.stringify(noiseMachineInfo));
    console.log('Noise Generator titles hydrated, json saved to: ' + targetHydratedPath);
}

const parseNoiseMachineTitle = (sourcePath) => {
    const body = readScrapeFromFile(sourcePath);
    const $ = cheerio.load(body);
    // This assumes the following html structure for mynoise noise machine title. This may change in the future.
    // <div class="noiseTitle">
    //   <div class="bigTitle">
    //      Unreal Ocean 
    //      <img src="/Pix/fav_l.png" class="iFV" id="fOCEAN" role="button" alt="favorite" onclick="addGenToFavs()" style="cursor: pointer; display: inline;" title="Favorite">		
    //   </div>
    //   <div class="subTitle">Frequency-Shaped Ocean Noise Generator</div>
    // </div>

    const title = $('.noiseTitle .bigTitle').text().trim();
    return title;
}

const scrapeNoiseMachineTitlesByList = (sourcePath) => {
    console.log('lets dance, paco');
    const baseSavePath = '/missingNoiseMachinePages/';
    const baseUrl = 'https://mynoise.net/NoiseMachines/';
    
    const data = readListFromFile(sourcePath);
    const noiseMachineFileNames = data.noiseMachineFileNames;
    if (!noiseMachineFileNames || noiseMachineFileNames.length === 0) {
        console.log('No noise machine file names found in source file');
        return;
    }

    for(var i=0;i<noiseMachineFileNames.length;i++) {
        const noiseMachineFileName = noiseMachineFileNames[i];
        if (noiseMachineFileName === undefined) {
            console.log('Noise machine name is empty');
            continue;
        }

        const noiseMachineName = noiseMachineFileName.split('.')[0];
        const targetNoiseMachineUrl = baseUrl + noiseMachineFileName;
        const scrapeFileName = noiseMachineName.replace(/ /g,'') + '.html';
        const savePath = baseSavePath + scrapeFileName;

        console.log('scraping ' + savePath);
        scrapeToFile(targetNoiseMachineUrl, savePath);
    }
}

const readListFromFile = (sourceFileName) => {
    var fs = require('fs'),
    filePath = sourceFileName;
    return fs.readFileSync(filePath, { encoding: 'utf-8', flag: 'r' });
}

const supplementNoiseMachineMeta = (sourcePath) => {
    const data = readListFromFile(sourcePath);
    const targetPath = 'output/missing_noise_machines.json';
    noiseMachines = parseNoiseMachineTitleNames(data);

    if (!noiseMachines) {
        console.log('No noise machines found in data');
        return;
    }

    fs.writeFileSync(targetPath, JSON.stringify(noiseMachines));
    console.log('Noise Generator titles parsed, json saved to: ' + targetPath);
}

const parseNoiseMachineTitleNames = (data) => {
    const noiseMachineFileNames = data.noiseMachineFileNames;
    const baseUrl = '/NoiseMachines/';
    const baseScrapePath = 'scrapes/missingNoiseMachinePages/';
    const noiseMachines = [];

    if (!noiseMachineFileNames || noiseMachineFileNames.length === 0) {
        console.log('No noise machine file names found in source file');
        return;
    }

    for(var i=0;i<noiseMachineFileNames.length;i++) {
        const noiseMachineFileName = noiseMachineFileNames[i];
        if (noiseMachineFileName === undefined) {
            console.log('Noise machine name is empty');
            continue;
        }

        const noiseMachineName = noiseMachineFileName.split('.')[0];
        const noiseMachineUrl = baseUrl + noiseMachineFileName;
        const scrapeFileName = noiseMachineName.replace(/ /g,'') + '.html';
        const sourcePath = baseScrapePath + scrapeFileName;
        const title = parseNoiseMachineTitleName(sourcePath);
        noiseMachines.push({
            'noiseMachineUrlPart': noiseMachineFileName,
            'noiseMachineUrl': noiseMachineUrl,
            'title': title
        });
    }

    return noiseMachines;
}

const parseNoiseMachineTitleName = (sourcePath) => {
    const body = readScrapeFromFile(sourcePath);
    const $ = cheerio.load(body);
    const title = $('#titleName').text().trim();
    return title;
}

exports.parseMyNoiseScrape = parseMyNoiseScrape;
exports.scrapeNoiseMachineTitles = scrapeNoiseMachineTitles;
exports.hydrateNoiseMachineInfo = hydrateNoiseMachineInfo;
exports.scrapeNoiseMachineTitlesByList = scrapeNoiseMachineTitlesByList;
exports.supplementNoiseMachineMeta = supplementNoiseMachineMeta;