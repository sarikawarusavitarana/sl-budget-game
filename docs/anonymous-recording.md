# Anonymous gameplay recording

The game can record, anonymously, how many people start and finish it and which choices they make. Records go to a Google Sheet, which can be downloaded as an Excel file at any time (File > Download > Microsoft Excel).

No names, emails, IP addresses or other personal details are recorded. Each play-through gets a random ID so that its start and finish can be matched, and that ID is not linked to the person.

Recording is off until a web app URL is added to `js/analytics.js`. While it is off, the notice telling players about recording stays hidden, so the game never claims to record when it does not.

## What the sheet shows

There is one row per play-through. A row is added when a player leaves the first page, with Finished set to No. When the player reaches the results page, the row is filled in with their choices and Finished changes to Yes. If they go back, change their choices and return to the results page, the row is updated with the new choices. Play again starts a new row.

The columns are the start and finish times (Sri Lanka time), both tax answers, each sector's slider and priority answer, whether welfare was indexed to inflation, the emergency reserve, how many of the five targets were met, and the deficit, debt, growth, inflation and market confidence results.

## Setting it up (about ten minutes)

1. Create a new Google Sheet, for example "Budget Game plays".
2. In the sheet, open Extensions > Apps Script.
3. Delete what is in the editor and paste the whole of `docs/anonymous-recording-apps-script.gs`. Click Save.
4. Click Deploy > New deployment. Click the cog next to "Select type" and choose Web app.
5. Set "Execute as" to Me and "Who has access" to Anyone. Click Deploy.
6. Google asks you to authorise the script. Choose your account. If it shows "Google hasn't verified this app", click Advanced, then "Go to (project name)". This is normal for a script you wrote yourself.
7. Copy the Web app URL. It ends in `/exec`.
8. Paste it between the quotes in `const ANALYTICS_URL = "";` at the top of `js/analytics.js`, on the dev branch, then merge dev into main.

Recording does not run when the game is opened directly from a file on your computer, only on the live site.

## Changing or turning it off

To turn recording off, empty the quotes in `ANALYTICS_URL` again. The notice disappears at the same time.

If you edit the Apps Script later, use Deploy > Manage deployments, edit the existing deployment and choose a new version, so the URL stays the same.

The URL is public in the game's code, so in theory anyone could send it made-up records. The script only accepts records in the game's own format and ignores anything else.
