CELLIX SMARTFLOW TEST - NEW PROJECT

This is the first safe test version.

WHAT IT DOES
1. Opens your SmartFlow login in a real browser.
2. You log in yourself (your password is never placed in the source code).
3. You open the Report page shown in your screenshots.
4. Press ENTER in the terminal.
5. The test saves the browser session so we can inspect the real page structure.

IMPORTANT
The final Report URL and search-field selectors are deliberately NOT guessed.
They must be discovered from your actual logged-in system.

RUN
1. Install Node.js.
2. Open a terminal in this folder.
3. Run:
   npm install
4. Run:
   npm run setup
5. Log in and open the Report page.
6. Press ENTER in the terminal.

Then run:
   npm start

Open:
   http://localhost:3000

SECURITY
Do not put your SmartFlow username/password in source code or send them in chat.
