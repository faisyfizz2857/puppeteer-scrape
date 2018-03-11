const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto('https://nelly.com/eu/womens-fashion/clothing/party-dresses/nly-trend-917/kimono-midi-dress-229541-0092/');
  } catch (error) {
    console.log(error);
    browser.close();
  }

  // inject jQuery to use it for selectors
  await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'});

  // get all data from page
  console.log('scraping...')
  const data = await page.evaluate(() => {
    const obj = {}
    
    obj.title = $('h1.product-title').text()
    
    const sizes = []
    $('select.size-select option').not('option:contains("Select size")').each(function () {
      sizes.push($(this).text().trim());
    });
    obj.sizes = sizes
    
    obj.description = $('div.product-iteminfo p').text()
    //scraping the main image link
    obj.main_image = $('div.active.item picture img').attr('src')
    //scraping the price and currency by concatination
    obj.price = $('span.product-price span').text().concat($('span.product-price sup').text())
    //scraping article number
    obj.artno = $('ul.product-details li strong').text()
    //scraping brand
    obj.brand = $('span.product-brand a').text()
    //scraping all the colors available
    const colors = []
    $('select.select-color option').not('option:contains("Select color")').each(function () {
      colors.push($(this).text().trim());
    });
    obj.colors = colors    
    //scraping all the images urls
    const sub_images = []
    $('ul#slider-thumbs li a picture img').each(function () {
      sub_images.push($(this).attr('src'));
    });
    obj.sub_img = sub_images

    return obj
  });

  // write data object in external file
  console.log('write output file')
  fs.writeFileSync('./output.json', JSON.stringify(data), 'utf-8');

  await browser.close();
})();
