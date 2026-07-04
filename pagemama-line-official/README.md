# Page MaMa LINE Official Account

Google Apps Script implementation for Page MaMa LINE Official Account rich menu and Flex Message quotation flow.

## Rich Menu Buttons

1. 網站製作
2. LINE 智慧客服
3. 需求估價
4. 服務與支援

## Required Script Properties

- `LINE_CHANNEL_ACCESS_TOKEN`
- `WEB_URL=https://pmm.jamespan.org`
- `RICH_MENU_IMAGE_FILE_ID` - Google Drive file ID of `assets/rich-menu-pagemama.png`

## Deploy

```bash
npm install -g @google/clasp
clasp login
clasp create --type standalone --title "Page MaMa LINE OA"
clasp push
```

In Apps Script:

1. Set Script Properties.
2. Deploy as Web App.
3. Set the Web App URL as LINE Messaging API webhook URL.
4. Run `setupRichMenu()` once.

## GitHub

Recommended repo name: `pagemama-line-official`

```bash
git init
git add .
git commit -m "Initial Page MaMa LINE OA Apps Script bot"
git branch -M main
git remote add origin git@github.com:<OWNER>/pagemama-line-official.git
git push -u origin main
```
