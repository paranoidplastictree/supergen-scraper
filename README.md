# Supergen Scraper
Node app that scrapes meta from various sources related to MyNoise.

The intent is to use the json output in a web app that renders the supergen list with filtering and other features.

## Sources
### r/MyNoise Subreddit
This is the subreddit for all things related to MyNoise on reddit. Members post many things including submissions and links that link to the supergens they have created.

### Reddit Masterlist
Here is the user-compiled supergen master list on reddit:
https://www.reddit.com/r/MyNoise/comments/3hw95k/supergen_masterlist/

This was a great initiative that currated supergens posted to r/mynoise. Sadly, efforts to maintain the list have ceased, so this listdoes not contain more recent supergens.

### MyNoise - https://mynoise.net/
If you're unfamiliar with MyNoise, look into it. It will change your life.

The `https://mynoise.net/noiseMachines.php` page has links of individual noise machines. These are combined, tweaked, and saved to create a `Supergen`. This page may not represent all available noise machines, but it's a start.

## App Versions
### Version 1
The first version of this app scraped the html of the pages of this master list. The output was then parsed into json, which was used as the data source for the web app.
The meta of this info did not include the OP reddit post of each supergen and I also discovered that the Reddit Masterlist ceased to be maintained after a few years.

We want all of the supergens. Enter version 2!

### Version 2
MyNoise.net, to my knowledge, does not list all of the supergens that users have crafted with the noise machines. One solution is to scrape all of the r/mynoise subreddit posts for supergen links.
Well, that's part of the solution, as the supergen links only contain references to noise machine pages. We first need a dictionary of noise machines.  

Another project has been created (`redditLinkScraper`) to scrape r/mynoise, parse the data, and leverage the dictionary created with this project to provide a richer, more complete dataset. Eventually, it and this project will be combined, streamlined, and hopefully automated to keep up with any newly created supergens.

## Usage

### Get Supergen meta from the `Reddit Masterlist`
Masterlist is outdated and does not include all supergens.

**scrape masterlist** - Scrape Supergen Masterlist
**export supergen** - Export Supergen meta

### Get Noise Generator meta from MyNoise
Create a dictionary of Noise Generator meta

1. Run **scrape mynoise** - Scrape MyNoise site for Noise Machine meta
2. Run **export mynoise meta** - Export MyNoise Noise Machine meta to json. The link text for some links on this page do not always match that of the landing page for the noise generator. 
3. Run **scrape noise machine pages** - Scrape EACH and EVERY MyNoise Noise Machine Page to obtain title
4. Run **hydrate mynoise meta** - Parse scraped noise machine pages for the correct title, update meta file exported in step 2.





