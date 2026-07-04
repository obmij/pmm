/**
 * Page MaMa LINE Official Account Bot - Google Apps Script
 * Required Script Properties:
 * LINE_CHANNEL_ACCESS_TOKEN
 * WEB_URL=https://pmm.jamespan.org
 */

const CFG = {
  brand: 'Page MaMa',
  webUrl: getProp_('WEB_URL', 'https://pmm.jamespan.org'),
  token: getProp_('LINE_CHANNEL_ACCESS_TOKEN'),
  richMenuImageUrl: 'https://raw.githubusercontent.com/obmij/pmm/main/assets/rich-menu-main.png',
};

function doPost(e) {
  const body = JSON.parse(e.postData.contents || '{}');
  (body.events || []).forEach(handleEvent_);
  return ContentService.createTextOutput('OK');
}

function handleEvent_(event) {
  if (event.type === 'follow') {
    return reply_(event.replyToken, [welcomeFlex_()]);
  }
  if (event.type === 'postback') {
    const data = parseData_(event.postback.data);
    if (data.action === 'website') return reply_(event.replyToken, [websiteFlex_()]);
    if (data.action === 'line_ai') return reply_(event.replyToken, [lineAiFlex_()]);
    if (data.action === 'quote') return reply_(event.replyToken, [quoteStartFlex_()]);
    if (data.action === 'support') return reply_(event.replyToken, [supportFlex_()]);
    if (data.action === 'quote_build') return reply_(event.replyToken, [quoteBuildWebsiteFlex_()]);
    if (data.action === 'quote_line') return reply_(event.replyToken, [quoteLineMenuFlex_()]);
    if (data.action === 'quote_warranty') return reply_(event.replyToken, [quoteWarrantyFlex_()]);
  }
  if (event.type === 'message' && event.message.type === 'text') {
    return reply_(event.replyToken, [text_('請使用下方選單選擇服務，或輸入「估價」開始需求估價。')]);
  }
}

function setupRichMenu() {
  if (!CFG.token) {
    throw new Error('Missing Script Property: LINE_CHANNEL_ACCESS_TOKEN');
  }

  const richMenu = {
    size: { width: 2500, height: 1686 },
    selected: true,
    name: 'Page MaMa Main Menu',
    chatBarText: 'Page MaMa 選單',
    areas: [
      area_(0, 0, 1250, 843, '網站製作', 'action=website'),
      area_(1250, 0, 1250, 843, 'LINE 智慧客服', 'action=line_ai'),
      area_(0, 843, 1250, 843, '需求估價', 'action=quote'),
      area_(1250, 843, 1250, 843, '服務與支援', 'action=support'),
    ],
  };

  const createResponse = lineFetch_('/v2/bot/richmenu', 'post', richMenu);
  const richMenuId = JSON.parse(createResponse.getContentText()).richMenuId;

  try {
    const imageResponse = UrlFetchApp.fetch(CFG.richMenuImageUrl, {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: true,
    });

    if (imageResponse.getResponseCode() !== 200) {
      throw new Error(
        `Rich menu image download failed: ${imageResponse.getResponseCode()} ${imageResponse.getContentText()}`
      );
    }

    const imageBlob = imageResponse.getBlob().setContentType('image/png');
    uploadRichMenuImage_(richMenuId, imageBlob);
    lineFetch_(`/v2/bot/user/all/richmenu/${richMenuId}`, 'post');

    PropertiesService.getScriptProperties().setProperty('RICH_MENU_ID', richMenuId);
    Logger.log(`Rich menu created and set as default: ${richMenuId}`);
  } catch (error) {
    try {
      lineFetch_(`/v2/bot/richmenu/${richMenuId}`, 'delete');
    } catch (cleanupError) {
      Logger.log(`Rich menu cleanup failed: ${cleanupError.message}`);
    }
    throw error;
  }
}

function area_(x, y, width, height, label, data) {
  return {
    bounds: { x, y, width, height },
    action: { type: 'postback', label, data, displayText: label },
  };
}

function welcomeFlex_() {
  return flex_('Page MaMa', '網站製作 × LINE 官方帳號智慧客服', [
    ['網站製作', 'postback', 'action=website'],
    ['需求估價', 'postback', 'action=quote'],
  ]);
}

function websiteFlex_() {
  return flex_('網站製作', '正體中文網站建構、網域名稱註冊、多語頁面擴充與上線維護。', [
    ['查看官網', 'uri', CFG.webUrl],
    ['取得估價', 'postback', 'action=quote_build'],
  ]);
}

function lineAiFlex_() {
  return flex_('LINE 智慧客服', '官方帳號選單、Flex Message、客服流程、自動化需求收斂。', [
    ['主選單方案', 'postback', 'action=quote_line'],
    ['服務與支援', 'postback', 'action=support'],
  ]);
}

function supportFlex_() {
  return flex_('服務與支援', '需要調整網站、LINE 選單、報價或保固延長，都可以從這裡開始。', [
    ['開啟官網', 'uri', CFG.webUrl],
    ['估價項目', 'postback', 'action=quote'],
  ]);
}

function quoteStartFlex_() {
  return flex_('需求估價', '請選擇要估價的服務類型。報價以新台幣計。', [
    ['建構網站', 'postback', 'action=quote_build'],
    ['LINE 官方帳號客服選單', 'postback', 'action=quote_line'],
    ['保固延長', 'postback', 'action=quote_warranty'],
  ]);
}

function quoteBuildWebsiteFlex_() {
  return flex_('建構網站估價', '網域 .win：每年 200；.com：每年 400。正體中文網站建構：20,000。增加其它語言：每頁 1,500。', [
    ['LINE 選單估價', 'postback', 'action=quote_line'],
    ['聯絡支援', 'postback', 'action=support'],
  ]);
}

function quoteLineMenuFlex_() {
  return flex_('LINE 選單估價', '主選單 4 格：10,000；主選單 6 格：13,000。次層選單／單則訊息：每則 1,000。', [
    ['網站估價', 'postback', 'action=quote_build'],
    ['保固延長', 'postback', 'action=quote_warranty'],
  ]);
}

function quoteWarrantyFlex_() {
  return flex_('保固延長', '網站保固延長 12 個月：3,000。LINE 官方帳號客服選單程式保固延長 12 個月：5,000。', [
    ['回估價首頁', 'postback', 'action=quote'],
    ['聯絡支援', 'postback', 'action=support'],
  ]);
}

function flex_(title, body, buttons) {
  return {
    type: 'flex',
    altText: `${CFG.brand}｜${title}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: { type: 'box', layout: 'vertical', contents: [
        { type: 'text', text: CFG.brand, weight: 'bold', size: 'sm', color: '#8B5E3C' },
        { type: 'text', text: title, weight: 'bold', size: 'xl', wrap: true, color: '#111111' },
      ]},
      body: { type: 'box', layout: 'vertical', spacing: 'md', contents: [
        { type: 'text', text: body, wrap: true, size: 'md', color: '#333333' },
        { type: 'separator', margin: 'md' },
        ...buttons.map(btn_)
      ]}
    }
  };
}

function btn_(b) {
  const [label, type, value] = b;
  return {
    type: 'button',
    style: 'primary',
    height: 'sm',
    action: type === 'uri'
      ? { type: 'uri', label, uri: value }
      : { type: 'postback', label, data: value, displayText: label }
  };
}

function text_(text) { return { type: 'text', text }; }

function reply_(replyToken, messages) {
  return lineFetch_('/v2/bot/message/reply', 'post', { replyToken, messages });
}

function lineFetch_(path, method, payload) {
  const options = {
    method,
    muteHttpExceptions: true,
    headers: { Authorization: `Bearer ${CFG.token}` },
  };
  if (payload) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }
  const res = UrlFetchApp.fetch(`https://api.line.me${path}`, options);
  const code = res.getResponseCode();
  if (code < 200 || code >= 300) throw new Error(`${path} failed: ${code} ${res.getContentText()}`);
  return res;
}

function uploadRichMenuImage_(richMenuId, blob) {
  const res = UrlFetchApp.fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'post',
    muteHttpExceptions: true,
    contentType: blob.getContentType(),
    payload: blob.getBytes(),
    headers: { Authorization: `Bearer ${CFG.token}` },
  });
  const code = res.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error(`Rich menu image upload failed: ${code} ${res.getContentText()}`);
  }
}

function parseData_(data) {
  return (data || '').split('&').reduce((acc, pair) => {
    const [k, v] = pair.split('=');
    acc[decodeURIComponent(k)] = decodeURIComponent(v || '');
    return acc;
  }, {});
}

function getProp_(key, fallback) {
  return PropertiesService.getScriptProperties().getProperty(key) || fallback || '';
}
