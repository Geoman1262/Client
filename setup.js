const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Opening SmartFlow login...");
  await page.goto("https://celllilo.smartflowsystems.net/HO.php", {
    waitUntil: "domcontentloaded"
  });

  console.log("\n1) Log in normally in the opened browser.");
  console.log("2) Open the REPORT page you showed in the screenshots.");
  console.log("3) Search for a client if needed.");
  console.log("4) Return to this terminal and press ENTER.\n");

  process.stdin.resume();
  process.stdin.once("data", async () => {
    const state = await context.storageState();
    fs.writeFileSync("smartflow-session.json", JSON.stringify(state, null, 2));

    const info = {
      url: page.url(),
      title: await page.title(),
      savedAt: new Date().toISOString()
    };
    fs.writeFileSync("smartflow-page.json", JSON.stringify(info, null, 2));

    console.log("\nSession saved.");
    console.log("Current page:", info.url);
    console.log("Title:", info.title);
    console.log("\nNext step: send us the URL shown above and a screenshot of the report page.");
    await browser.close();
  });
})();
