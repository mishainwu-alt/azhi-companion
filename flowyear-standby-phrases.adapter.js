(function () {
  // Fallback array only. Future hook: read-only FlowYear standby phrase source.
  const fallbackPhrases = [
    "有些答案會晚一點抵達，今天先讓風穿過去。",
    "不是每個停頓都叫做失敗，有些只是生命在換氣。",
    "把世界的聲音收進來，但不要讓它把妳推著走。",
    "先把霧放在遠方，今天只看腳邊的光。",
    "有些路不是用力走出來的，是慢慢等出輪廓的。",
    "今天不用急著成為清楚的人，先讓心回到身體裡。",
    "如果世界太吵，就先把窗開小一點。",
    "有些光不是答案，只是提醒妳還在路上。",
  ];

  window.FlowYearStandbyPhrases = {
    status: "fallback-array",
    source: "standby-phrases.json with local fallback; future read-only FlowYear sheet adapter",
    spreadsheetId: "1kitxqmfZjyIU7-YoGOYFwVMWCtyi_h51x45Dyr3zRlw",
    intendedUse: "standby observation phrase source only",
    phrases: fallbackPhrases,
    sample() {
      return fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
    },
  };

  fetch("standby-phrases.json", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : fallbackPhrases))
    .then((phrases) => {
      if (!Array.isArray(phrases)) return;
      const cleaned = phrases.filter((phrase) => typeof phrase === "string" && phrase.trim());
      if (!cleaned.length) return;
      window.FlowYearStandbyPhrases.phrases = cleaned;
      window.FlowYearStandbyPhrases.status = "json-loaded";
      window.FlowYearStandbyPhrases.sample = function sample() {
        return cleaned[Math.floor(Math.random() * cleaned.length)];
      };
    })
    .catch(() => {
      window.FlowYearStandbyPhrases.status = "fallback-array";
    });
})();
