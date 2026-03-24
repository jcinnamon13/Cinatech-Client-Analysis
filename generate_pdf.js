const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log("Launching headless browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set explicit viewport size for the rendering engine
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    
    const filePath = 'file://' + path.resolve(__dirname, 'pdf_renderer.html');
    console.log("Loading HTML canvas: " + filePath);
    
    await page.goto(filePath, { waitUntil: 'networkidle0' });

    console.log("Rendering PDF sequence...");
    await page.pdf({
        path: 'CinaTech_Promotional_Briefing.pdf',
        format: 'A4',
        printBackground: true,
        pageRanges: '1'
    });

    await browser.close();
    console.log("Completed! PDF exported to: CinaTech_Promotional_Briefing.pdf");
})();
