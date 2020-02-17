const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://icomoon.io/app/#/select');

    await page.waitFor(() => document.querySelector('#setH1 label.unitRight'));

    const switchIcons = await page.$('#setH1 label.unitRight');

    await switchIcons.click();

    //await page.waitForSelector('input[type=file]');

    //const fileInput = await page.$('input[type=file]');

    //console.log(await fileInput.evaluate(elt => elt.tagName, fileInput));
    //await fileInput.click();

    console.log('Uploading files...');

    //await page.click('input[type=file]');

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.$eval('input[type=file]', elem => elem.click())
    ]);

    await fileChooser.accept(['icons/test.svg']);

    console.log('Upload complete');
    console.log('Selecting all icons...');

    await page.click('#setH2 button.btn5 i');
    await page.$eval('div.set.w-main button.prs', btnSelectAll => btnSelectAll.click());

    console.log('Icons selected');

})();