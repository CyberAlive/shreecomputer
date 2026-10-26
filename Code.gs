// Shree Computer Solution - ratings backend (Google Apps Script)
// Paste this into Extensions > Apps Script inside your Google Sheet.

var SHEET_NAME = 'Ratings';

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Time', 'Rating', 'Name', 'Feedback', 'Approved']);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Single line, limited length, and no spreadsheet formulas.
function clean_(v, max) {
  v = String(v || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function page_(title, body) {
  var css = 'body{font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#13201D;line-height:1.5}' +
    'h1{font-size:1.6rem}.s{color:#C98A00;letter-spacing:2px}.r{border-top:1px solid #D3DDD9;padding:14px 0}' +
    '.m{color:#4F5F5B;font-size:.9rem}';
  var html = '<!doctype html><html><head><meta charset="utf-8"><style>' + css +
    '</style></head><body>' + body + '</body></html>';
  return HtmlService.createHtmlOutput(html).setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doGet(e) {
  var p = (e && e.parameter) || {};

  // Public reviews page: ?page=reviews
  if (p.page === 'reviews') return reviewsPage_();

  // Approved reviews as JSON: ?page=json (copy this to update the website)
  if (p.page === 'json') return jsonPage_();

  // Save a rating: ?rating=5&name=...&text=...
  var rating = Math.round(Number(p.rating));
  if (!(rating >= 1 && rating <= 5)) {
    return page_('Shree Computer Solution',
      '<h1>Shree Computer Solution</h1><p>Use the rating form on our website to leave a rating.</p>');
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_().appendRow([new Date(), rating, clean_(p.name, 60), clean_(p.text, 500), '']);
  } finally {
    lock.releaseLock();
  }
  return page_('Thank you',
    '<h1>Thank you!</h1><p>Your rating has been saved. You can close this tab.</p>');
}

// Shows only rows where the Approved column says "yes".
function reviewsPage_() {
  var rows = getSheet_().getDataRange().getValues().slice(1);
  var shown = rows.filter(function (r) {
    return String(r[4]).toLowerCase() === 'yes';
  });
  var body = '<h1>Customer reviews</h1>';
  if (!shown.length) {
    return page_('Customer reviews', body + '<p>No reviews yet.</p>');
  }
  var total = 0;
  shown.forEach(function (r) { total += Number(r[1]); });
  var avg = (total / shown.length).toFixed(1);
  body += '<p><strong>' + avg + ' out of 5</strong> from ' + shown.length +
    (shown.length === 1 ? ' review' : ' reviews') + '</p>';
  shown.reverse().forEach(function (r) {
    var n = Math.max(1, Math.min(5, Number(r[1])));
    var when = Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), 'd MMM yyyy');
    body += '<div class="r"><div class="s">' + '\u2605'.repeat(n) + '\u2606'.repeat(5 - n) + '</div>' +
      (r[3] ? '<p>' + esc_(r[3]) + '</p>' : '') +
      '<div class="m">' + esc_(r[2] || 'Customer') + ' &middot; ' + when + '</div></div>';
  });
  return page_('Customer reviews', body);
}

function jsonPage_() {
  var rows = getSheet_().getDataRange().getValues().slice(1);
  var data = rows.filter(function (r) {
    return String(r[4]).toLowerCase() === 'yes';
  }).reverse().map(function (r) {
    return {
      rating: Math.max(1, Math.min(5, Math.round(Number(r[1])))),
      name: String(r[2] || ''),
      text: String(r[3] || ''),
      date: Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), 'd MMM yyyy')
    };
  });
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
