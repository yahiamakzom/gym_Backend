const puppeteer = require('puppeteer');

class GoogleMapsExtractor {
    async getFullUrlFromShortLink(shortUrl) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        let fullUrl = '';

        try {
            // Navigate to the short URL
            await page.goto(shortUrl, { waitUntil: 'networkidle2' });
            // Wait until the page has fully loaded
     // 5 seconds wait
            // Get the full URL after the redirection
            fullUrl = page.url();
        } catch (error) {
            console.error('Error navigating to the URL:', error);
            throw error; // rethrow error for handling in the caller
        } finally {
            await browser.close();
        }

        return fullUrl;
    }

    extractLatLongFromUrl(url) {
        const latLongRegex = /@([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)/; // Matches @lat,long pattern
        const match = url.match(latLongRegex);

      

        return  { lat: match[1], long: match[2] } ; // Return null if no match is found
    }

    async getLatLongFromShortLink(shortUrl) {
        const fullUrl = await this.getFullUrlFromShortLink(shortUrl); 
        console.log('url' , fullUrl)
        return this.extractLatLongFromUrl(fullUrl);
    }
} 

module.exports = GoogleMapsExtractor