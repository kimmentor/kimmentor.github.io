/* =========================================================
   멘토 김부장 블로그 — 방문자 카운터
   - 누적(전체) 방문자 + 오늘 방문자를 표시
   - 페이지 "상단(네비 아래)"과 "하단(푸터)" 양쪽에 표시
   - 무료 카운터 API(Abacus) 사용, 별도 서버/계정 불필요
   - 같은 방문자가 여러 페이지를 봐도 방문 1회로 집계(세션 기준)
   ========================================================= */
(function () {
  "use strict";

  var BASE = "https://abacus.jasoncameron.dev";
  var NS = "kimmentor-github-io-9k2";

  function kstDate() {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit"
      }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function firstInSession(flag) {
    try {
      if (sessionStorage.getItem(flag)) return false;
      sessionStorage.setItem(flag, "1");
      return true;
    } catch (e) {
      return true;
    }
  }

  function ask(key, doHit) {
    var url = BASE + (doHit ? "/hit/" : "/get/") + NS + "/" + key;
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (r.status === 404) return { value: 0 };
      if (!r.ok) throw new Error("counter " + r.status);
      return r.json();
    }).then(function (j) {
      return (j && typeof j.value === "number") ? j.value : 0;
    });
  }

  function fmt(n) {
    try { return Number(n).toLocaleString("ko-KR"); }
    catch (e) { return String(n); }
  }

  function setAll(sel, text) {
    var list = document.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) list[i].textContent = text;
  }

  function makeBar(place) {
    var box = document.createElement("div");
    box.id = place === "top" ? "vc-top" : "vc-foot";
    box.className = "vc-bar";
    box.setAttribute("aria-label", "방문자 수");
    box.innerHTML =
      '<span class="vc-item"><span class="vc-label">누적 방문</span>' +
      '<span class="vc-num vc-total">–</span></span>' +
      '<span class="vc-sep">·</span>' +
      '<span class="vc-item"><span class="vc-label">오늘</span>' +
      '<span class="vc-num vc-today">–</span></span>';
    return box;
  }

  function injectStyle() {
    var css =
      ".vc-bar{width:100%;display:flex;justify-content:center;align-items:center;" +
      "gap:10px;flex-wrap:wrap;font-weight:600;box-sizing:border-box}" +
      ".vc-bar .vc-item{display:inline-flex;align-items:center;gap:7px}" +
      ".vc-bar .vc-num{font-weight:800;font-variant-numeric:tabular-nums;" +
      "min-width:1.4em;text-align:right;color:#e8b64c}" +
      "#vc-top{padding:7px 16px;font-size:12.5px;color:#c9cde6;" +
      "background:#0e1230;border-bottom:1px solid rgba(255,255,255,.08)}" +
      "#vc-top .vc-sep{color:rgba(255,255,255,.3)}" +
      "#vc-foot{padding:10px 16px;margin:0 0 18px;font-size:13.5px;color:#9aa0c4;" +
      "border-bottom:1px solid rgba(255,255,255,.08)}" +
      "#vc-foot .vc-label{color:#9aa0c4}" +
      "#vc-foot .vc-sep{color:rgba(255,255,255,.25)}";
    var s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildUI() {
    injectStyle();
    var nav = document.querySelector("nav.nav") || document.querySelector("nav");
    var top = makeBar("top");
    if (nav && nav.parentNode) {
      nav.insertAdjacentElement("afterend", top);
    } else {
      document.body.insertBefore(top, document.body.firstChild);
    }
    var footer = document.querySelector("footer");
    var foot = makeBar("foot");
    if (footer) {
      var wrap = footer.querySelector(".wrap") || footer;
      wrap.insertBefore(foot, wrap.firstChild);
    } else {
      document.body.appendChild(foot);
    }
  }

  function run() {
    buildUI();
    var today = kstDate();
    var totalHit = firstInSession("vc_total_hit");
    var todayFlag = "vc_today_hit_" + today;
    var todayHit = firstInSession(todayFlag);

    ask("total", totalHit)
      .then(function (v) { setAll(".vc-total", fmt(v)); })
      .catch(function () { setAll(".vc-total", "–"); });

    ask("d-" + today, todayHit)
      .then(function (v) { setAll(".vc-today", fmt(v)); })
      .catch(function () { setAll(".vc-today", "–"); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
