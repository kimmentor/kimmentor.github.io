/* =========================================================
   멘토 김부장 블로그 — 방문자 카운터
   - 누적(전체) 방문자 + 오늘 방문자를 표시
   - 무료 카운터 API(Abacus) 사용, 별도 서버/계정 불필요
   - 같은 방문자가 여러 페이지를 봐도 방문 1회로 집계(세션 기준)
   ========================================================= */
(function () {
  "use strict";

  var BASE = "https://abacus.jasoncameron.dev";
  // 이 블로그 전용 고유 네임스페이스 (다른 사이트와 숫자가 섞이지 않도록 고유값 사용)
  var NS = "kimmentor-github-io-9k2";

  // 오늘 날짜(한국 시간 기준) → 예: "2026-08-01"
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

  // 이번 브라우저 세션에서 아직 집계 안 했으면 true(→ 증가), 이미 했으면 false(→ 조회만)
  function firstInSession(flag) {
    try {
      if (sessionStorage.getItem(flag)) return false;
      sessionStorage.setItem(flag, "1");
      return true;
    } catch (e) {
      return true; // 저장 불가 환경이면 그냥 증가 처리
    }
  }

  function ask(key, doHit) {
    var url = BASE + (doHit ? "/hit/" : "/get/") + NS + "/" + key;
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (r.status === 404) return { value: 0 }; // 아직 만들어지지 않은 카운터
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

  // 카운터 UI 만들기
  function buildUI() {
    var box = document.createElement("div");
    box.id = "visitor-counter";
    box.setAttribute("aria-label", "방문자 수");
    box.innerHTML =
      '<span class="vc-item"><span class="vc-label">누적 방문</span>' +
      '<span class="vc-num" id="vc-total">–</span></span>' +
      '<span class="vc-sep">·</span>' +
      '<span class="vc-item"><span class="vc-label">오늘</span>' +
      '<span class="vc-num" id="vc-today">–</span></span>';

    var style = document.createElement("style");
    style.textContent =
      "#visitor-counter{width:100%;display:flex;justify-content:center;align-items:center;" +
      "gap:10px;flex-wrap:wrap;margin:0 0 18px;padding:10px 16px;" +
      "font-size:13.5px;color:#9aa0c4;font-weight:600;" +
      "border-bottom:1px solid rgba(255,255,255,.08)}" +
      "#visitor-counter .vc-item{display:inline-flex;align-items:center;gap:7px}" +
      "#visitor-counter .vc-label{color:#9aa0c4}" +
      "#visitor-counter .vc-num{color:#e8b64c;font-weight:800;font-variant-numeric:tabular-nums;" +
      "min-width:1.5em;text-align:right}" +
      "#visitor-counter .vc-sep{color:rgba(255,255,255,.25)}";
    document.head.appendChild(style);

    // 푸터가 있으면 푸터 안 맨 위에, 없으면 body 끝에 붙임
    var footer = document.querySelector("footer");
    if (footer) {
      var wrap = footer.querySelector(".wrap") || footer;
      wrap.insertBefore(box, wrap.firstChild);
    } else {
      document.body.appendChild(box);
    }
    return box;
  }

  function run() {
    buildUI();
    var elTotal = document.getElementById("vc-total");
    var elToday = document.getElementById("vc-today");

    var today = kstDate();
    var totalHit = firstInSession("vc_total_hit");
    var todayFlag = "vc_today_hit_" + today;
    var todayHit = firstInSession(todayFlag);

    ask("total", totalHit)
      .then(function (v) { if (elTotal) elTotal.textContent = fmt(v); })
      .catch(function () { if (elTotal) elTotal.textContent = "–"; });

    ask("d-" + today, todayHit)
      .then(function (v) { if (elToday) elToday.textContent = fmt(v); })
      .catch(function () { if (elToday) elToday.textContent = "–"; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
