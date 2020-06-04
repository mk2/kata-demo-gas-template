var TEST_WEBHOOK_URL = "";
var WEBHOOK_URL = "";

function h1(str) {
  return "<h1>" + str + "</h1>";
}

function setTriggers() {
  triggers.forEach(function(trigger) {
    try {
      var triggerDay = new Date();
      triggerDay.setHours(trigger.hours);
      triggerDay.setMinutes(trigger.minutes);
      ScriptApp.newTrigger(trigger.func).timeBased().at(triggerDay).create();
    } catch (e) {
      Logger.log(e);
    }
  })
}

function deleteTrigger(func) {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i=0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == func) {
      try {
        ScriptApp.deleteTrigger(triggers[i]);
      } catch (e) {
        Logger.log(e);
      }
    }
  }
}

// 通知一覧
// 時間と実行すべき関数名をもつ
// 不要であればtriggersから削除
var triggers = [
  {
    hours: 12,
    minutes: 50,
    func: "time_1250"
  }
];

function notify(message, webhookUrl) {
  if (!message) {
    Logger.log('***** メッセージ未設定');
  }
  var payload = {
    format: "html",
    source: message,
  };
  var options = {
    method: "post",
    payload: payload
  };
  UrlFetchApp.fetch(webhookUrl, options)
}

// 与えられた日付を休日判定するかどうか
function checkHoliday(dt) {
  // 休日一覧を取得
  var holidayMap = JSON.parse(UrlFetchApp.fetch('https://holidays-jp.github.io/api/v1/date.json').getContentText());
  Logger.log(holidayMap);
  
  // holidayMapを検索しやすい形にdtをフォーマット
  var dtKey = dt.toFormat('yyyy-MM-dd');
  Logger.log(`今日→${dtKey}`);

  return !!holidayMap[dtKey];
}

function now() {
  var n = luxon.DateTime.utc().setZone('UTC+9');
  Logger.log(n.toISO());
  var hour = "h" + n.toFormat("HH");
  var dow = n.toFormat("c");
  var year = n.year;
  var month = n.month;
  var day = n.day;
  var isHoliday = checkHoliday(n);
  Logger.log("year=" + year + " month=" + month + " day=" + day + " isHoliday=" + isHoliday + " hour=" + hour + " dow=" + dow);
  return {
    hour: hour,
    dow: dow,
    year: year,
    month: month,
    day: day,
    isHoliday: isHoliday,
    dateTime: n
  };
}

// 以下、トリガーで起動するハンドラー

function time_1250() {
  var n = now();
  if (!n.isHoliday) {
    notify("@here 通知例", WEBHOOK_URL);
  }
  deleteTrigger("time_1250");
}
