const TELEGRAM_TOKEN = "8167818083:AAHDRlEpnS-_yTAi1tDE7qW1JjyeaIYJ72M";
const CHAT_ID = "7307720165";

function doGet() {
  return HtmlService.createHtmlOutputFromFile("index");
}

function sendTelegram() {
  const message = "📢 แจ้งเตือนรดน้ำต้นไม้: ถึงเวลารดน้ำต้นเฟิร์นหน้าโรงเรียน";
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    text: message
  };
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };
  UrlFetchApp.fetch(url, options);
  return "ส่งสำเร็จ";
}
