const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({
        width: 1000,
        height: 800,
        deviceScaleFactor: 1,
    });

    const args = process.argv.slice(2);
    const iconsFolder = args[0];
    const outputFolder = args[1];

    console.log('Icons folder set to: ' + iconsFolder, 'Output folder set to: ' + outputFolder);
    console.log('Loading icons...');

    const filesPaths = listFiles(iconsFolder);

    console.log('Icons loaded: ' + filesPaths.join(' '));

    console.log('Opening icomoon app');

    await page.goto('https://icomoon.io/app/#/select');

    await page.waitFor(() => document.querySelector('#setH1 label.unitRight'));

    const switchIcons = await page.$('#setH1 label.unitRight');

    await switchIcons.click();

    console.log('Uploading files...');

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.$eval('input[type=file]', elem => elem.click())
    ]);

    await fileChooser.accept(filesPaths);

    console.log('Upload complete');
    console.log('Selecting all icons...');

    await page.waitForSelector('#setH2 button.btn5 i');

    await page.click('#setH2 button.btn5 i');
    await page.$eval('div.set.w-main button.prs', btnSelectAll => btnSelectAll.click());

    console.log('Icons selected');

    console.log('Opening font settings');

    await page.click('[href="#/select/font"]');

    await page.waitForSelector('button.btn6 i.icon-cog');

    await page.click('button.btn6 i.icon-cog');

    await page.waitForSelector('input[placeholder="icomoon"]');

    await page.$eval('input[placeholder="icomoon"]', fontNameInput => {
        fontNameInput.value = '';
    });

    await page.type('input[placeholder="icomoon"]', 'icodomino');

    await page.waitForSelector('input[ng-model="fontPref.prefix"]');

    await page.$eval('input[ng-model="fontPref.prefix"]', classPrefixInput => {
        classPrefixInput.value = '';
    });

    await page.type('input[ng-model="fontPref.prefix"]', 'icodomino-');

    await page.click('div.overlayWindow i.icon-close');

    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.resolve(__dirname, outputFolder)
    });

    console.log('Downloading result...');

    await page.click('[href="#/select"] + span button.btn4');

    console.log('Closing browser in 10 seconds');

    await page.waitFor(10000);

    await browser.close();

})();

function listFiles(folderPath) {
    const files = fs.readdirSync(folderPath);

    return files.filter(fileName => fileName.slice(-4) == '.svg').map(fileName => folderPath + '/' + fileName);
}