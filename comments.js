/* =========================================================
   멘토 김부장 블로그 — 댓글(COMMENT)
   - 닉네임(필수)·비밀번호(필수)·내용으로 댓글 등록
   - 대댓글(답글) 1단계 지원
   - 비밀번호로 수정/삭제 (비밀번호는 SHA-256 해시로만 저장)
   - Firebase Firestore 사용 (firebase-config.js 에 설정값 필요)
   - 글 페이지(article.article)에서만 동작, .back 링크 앞에 삽입
   ========================================================= */
(function () {
  "use strict";
  var article = document.querySelector("article.article");
  if (!article) return;

  var APP = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
  var FS = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";

  function slugOf() {
    var p = (location.pathname || "").split("/").pop() || "";
    p = p.replace(/\.html?$/i, "");
    if (!p || p === "index") p = "home";
    return p.replace(/[^A-Za-z0-9_.-]/g, "-").slice(0, 58);
  }
  var SLUG = slugOf();
  var db = null;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function sha256(str) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    });
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }
  function fmtTime(ts) {
    try {
      var d = ts && ts.toDate ? ts.toDate() : (ts ? new Date(ts) : new Date());
      var p = function (n) { return ("0" + n).slice(-2); };
      return d.getFullYear() + "." + p(d.getMonth() + 1) + "." + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
    } catch (e) { return ""; }
  }

  function injectStyle() {
    var css =
      ".cmt{max-width:100%;margin:40px 0 8px}"+
      ".cmt-h{font-size:15px;font-weight:800;letter-spacing:.08em;color:#1c2033;margin:0 0 4px}"+
      ".cmt-h .n{color:#6d5cf0}"+
      ".cmt-sub{color:#9aa0b8;font-size:13px;margin:0 0 16px}"+
      ".cmt-form{background:#faf9ff;border:1px solid #e7e9f2;border-radius:14px;padding:16px 16px 14px;margin-bottom:22px}"+
      ".cmt-row{display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap}"+
      ".cmt-row input{flex:1;min-width:120px}"+
      ".cmt input,.cmt textarea{border:1.5px solid #e7e9f2;border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14.5px;color:#1c2033;background:#fff;outline:none;width:100%;box-sizing:border-box}"+
      ".cmt input:focus,.cmt textarea:focus{border-color:#6d5cf0}"+
      ".cmt textarea{min-height:74px;resize:vertical;line-height:1.6}"+
      ".cmt-bar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px}"+
      ".cmt-err{color:#d64550;font-size:13px;font-weight:600;min-height:1em}"+
      ".cmt-btn{border:none;cursor:pointer;font-family:inherit;font-weight:800;font-size:14px;padding:10px 18px;border-radius:999px;background:linear-gradient(145deg,#6d5cf0,#4a3ad1);color:#fff;transition:.15s all}"+
      ".cmt-btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(109,92,240,.3)}"+
      ".cmt-btn.ghost{background:#fff;color:#6d5cf0;border:1.5px solid #d9d3ff}"+
      ".cmt-btn.sm{padding:6px 12px;font-size:12.5px}"+
      ".cmt-btn.del{background:#fff;color:#d64550;border:1.5px solid #f3d0d4}"+
      ".cmt-list{display:flex;flex-direction:column;gap:14px}"+
      ".cmt-item{border:1px solid #eceaf6;border-radius:14px;padding:14px 16px;background:#fff}"+
      ".cmt-item .cmt-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}"+
      ".cmt-nick{font-weight:800;color:#1c2033;font-size:14.5px}"+
      ".cmt-date{color:#9aa0b8;font-size:12.5px}"+
      ".cmt-edited{color:#c3c8d6;font-size:11.5px}"+
      ".cmt-text{color:#3a4056;font-size:14.5px;line-height:1.7;white-space:normal;word-break:break-word}"+
      ".cmt-acts{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}"+
      ".cmt-act{background:none;border:none;cursor:pointer;color:#8a90a8;font-family:inherit;font-size:12.5px;font-weight:700;padding:2px 4px}"+
      ".cmt-act:hover{color:#6d5cf0}.cmt-act.del:hover{color:#d64550}"+
      ".cmt-replies{margin:12px 0 0 18px;padding-left:14px;border-left:2px solid #eceaf6;display:flex;flex-direction:column;gap:12px}"+
      ".cmt-mini{margin-top:10px;background:#faf9ff;border:1px solid #e7e9f2;border-radius:12px;padding:12px}"+
      ".cmt-empty{color:#9aa0b8;font-size:14px;text-align:center;padding:22px 0}"+
      ".cmt-inline{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}"+
      ".cmt-inline input{max-width:160px}";
    var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);
  }

  function formHTML(reply) {
    var ph = reply ? "답글을 입력하세요" : "따뜻한 댓글을 남겨보세요 :)";
    return (
      '<div class="cmt-row">' +
        '<input class="c-nick" type="text" maxlength="20" placeholder="닉네임 (필수)">' +
        '<input class="c-pw" type="password" maxlength="30" placeholder="비밀번호 (필수)">' +
      '</div>' +
      '<textarea class="c-text" maxlength="1000" placeholder="' + ph + '"></textarea>' +
      '<div class="cmt-bar"><span class="cmt-err"></span>' +
        '<button type="button" class="cmt-btn c-submit' + (reply ? ' sm' : '') + '">' + (reply ? '답글 등록' : '등록') + '</button>' +
      '</div>'
    );
  }

  function build() {
    var box = document.createElement("section");
    box.className = "cmt";
    box.innerHTML =
      '<h3 class="cmt-h">COMMENT <span class="n c-count">0</span></h3>' +
      '<p class="cmt-sub">닉네임과 비밀번호로 댓글을 남길 수 있어요. 비밀번호는 수정·삭제할 때 필요합니다.</p>' +
      '<div class="cmt-form c-mainform">' + formHTML(false) + '</div>' +
      '<div class="cmt-list c-list"></div>';
    var back = article.querySelector(".back");
    if (back && back.parentNode) back.parentNode.insertBefore(box, back);
    else article.querySelector(".article-body").appendChild(box);
    return box;
  }

  // ---- Firestore ops ----
  function col() { return db.collection("comments"); }
  function fetchAll() {
    return col().where("slug", "==", SLUG).get().then(function (snap) {
      var arr = [];
      snap.forEach(function (d) { var o = d.data(); o.id = d.id; arr.push(o); });
      arr.sort(function (a, b) {
        var ta = a.created && a.created.seconds ? a.created.seconds : 0;
        var tb = b.created && b.created.seconds ? b.created.seconds : 0;
        return ta - tb;
      });
      return arr;
    });
  }
  function addDoc(nick, pwHash, text, parentId) {
    return col().add({
      slug: SLUG, nick: nick, pw: pwHash, text: text,
      parentId: parentId || null,
      created: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  var root, listEl, countEl;

  function reload() {
    fetchAll().then(function (all) {
      var tops = all.filter(function (c) { return !c.parentId; });
      var kids = {};
      all.forEach(function (c) { if (c.parentId) { (kids[c.parentId] = kids[c.parentId] || []).push(c); } });
      countEl.textContent = all.length;
      listEl.innerHTML = "";
      if (!tops.length) {
        var e = document.createElement("div"); e.className = "cmt-empty";
        e.textContent = "아직 댓글이 없어요. 첫 댓글을 남겨보세요!";
        listEl.appendChild(e); return;
      }
      tops.forEach(function (c) {
        listEl.appendChild(itemEl(c, kids[c.id] || []));
      });
    }).catch(function (err) {
      console.error("comments load", err);
      listEl.innerHTML = '<div class="cmt-empty">댓글을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</div>';
    });
  }

  function itemEl(c, replies) {
    var el = document.createElement("div");
    el.className = "cmt-item";
    var edited = c.edited ? ' <span class="cmt-edited">(수정됨)</span>' : "";
    el.innerHTML =
      '<div class="cmt-top"><span class="cmt-nick">' + esc(c.nick) + '</span>' +
      '<span class="cmt-date">' + fmtTime(c.created) + '</span>' + edited + '</div>' +
      '<div class="cmt-text">' + nl2br(c.text) + '</div>' +
      '<div class="cmt-acts">' +
        '<button class="cmt-act a-reply">답글</button>' +
        '<button class="cmt-act a-edit">수정</button>' +
        '<button class="cmt-act del a-del">삭제</button>' +
      '</div>';
    var acts = el.querySelector(".cmt-acts");
    // 답글 목록
    if (replies && replies.length) {
      var rwrap = document.createElement("div");
      rwrap.className = "cmt-replies";
      replies.forEach(function (r) { rwrap.appendChild(replyEl(r)); });
      el.appendChild(rwrap);
    }
    // 답글 폼 토글
    el.querySelector(".a-reply").addEventListener("click", function () {
      if (el.querySelector(".c-replyform")) { el.querySelector(".c-replyform").remove(); return; }
      var f = document.createElement("div");
      f.className = "cmt-mini c-replyform";
      f.innerHTML = formHTML(true);
      (el.querySelector(".cmt-replies") || el).appendChild(f);
      wireSubmit(f, c.id);
    });
    el.querySelector(".a-edit").addEventListener("click", function () { doEdit(c, el.querySelector(".cmt-text")); });
    el.querySelector(".a-del").addEventListener("click", function () { doDelete(c); });
    return el;
  }

  function replyEl(r) {
    var el = document.createElement("div");
    el.className = "cmt-item";
    var edited = r.edited ? ' <span class="cmt-edited">(수정됨)</span>' : "";
    el.innerHTML =
      '<div class="cmt-top"><span class="cmt-nick">' + esc(r.nick) + '</span>' +
      '<span class="cmt-date">' + fmtTime(r.created) + '</span>' + edited + '</div>' +
      '<div class="cmt-text">' + nl2br(r.text) + '</div>' +
      '<div class="cmt-acts">' +
        '<button class="cmt-act a-edit">수정</button>' +
        '<button class="cmt-act del a-del">삭제</button>' +
      '</div>';
    el.querySelector(".a-edit").addEventListener("click", function () { doEdit(r, el.querySelector(".cmt-text")); });
    el.querySelector(".a-del").addEventListener("click", function () { doDelete(r); });
    return el;
  }

  function wireSubmit(formEl, parentId) {
    var btn = formEl.querySelector(".c-submit");
    var errEl = formEl.querySelector(".cmt-err");
    btn.addEventListener("click", function () {
      var nick = (formEl.querySelector(".c-nick").value || "").trim();
      var pw = (formEl.querySelector(".c-pw").value || "");
      var text = (formEl.querySelector(".c-text").value || "").trim();
      errEl.textContent = "";
      if (!nick) { errEl.textContent = "닉네임을 입력해 주세요."; return; }
      if (!pw) { errEl.textContent = "비밀번호를 입력해 주세요."; return; }
      if (!text) { errEl.textContent = "내용을 입력해 주세요."; return; }
      btn.disabled = true; btn.textContent = "등록 중…";
      sha256(pw).then(function (h) { return addDoc(nick, h, text, parentId); })
        .then(function () {
          formEl.querySelector(".c-nick").value = "";
          formEl.querySelector(".c-pw").value = "";
          formEl.querySelector(".c-text").value = "";
          if (parentId) formEl.remove();
          reload();
        })
        .catch(function (e) { console.error(e); errEl.textContent = "등록에 실패했어요. 잠시 후 다시 시도해 주세요."; })
        .then(function () { btn.disabled = false; btn.textContent = parentId ? "답글 등록" : "등록"; });
    });
  }

  function verifyPw(c) {
    var pw = window.prompt("비밀번호를 입력하세요");
    if (pw == null) return Promise.resolve(false);
    return sha256(pw).then(function (h) { return h === c.pw; });
  }

  function doEdit(c, textEl) {
    verifyPw(c).then(function (ok) {
      if (!ok) { if (ok === false) alertOnce("비밀번호가 일치하지 않습니다."); return; }
      if (textEl.querySelector(".c-edit-area")) return;
      var cur = c.text;
      textEl.innerHTML =
        '<textarea class="c-edit-area" maxlength="1000">' + esc(cur) + '</textarea>' +
        '<div class="cmt-inline"><button class="cmt-btn sm c-save">저장</button>' +
        '<button class="cmt-btn ghost sm c-cancel">취소</button></div>';
      var ta = textEl.querySelector(".c-edit-area"); ta.focus();
      textEl.querySelector(".c-cancel").addEventListener("click", function () { textEl.innerHTML = nl2br(cur); });
      textEl.querySelector(".c-save").addEventListener("click", function () {
        var nt = (ta.value || "").trim(); if (!nt) return;
        col().doc(c.id).update({ text: nt, edited: true }).then(reload)
          .catch(function (e) { console.error(e); textEl.innerHTML = nl2br(cur); });
      });
    });
  }

  function doDelete(c) {
    verifyPw(c).then(function (ok) {
      if (!ok) { if (ok === false) alertOnce("비밀번호가 일치하지 않습니다."); return; }
      if (!window.confirm("이 댓글을 삭제할까요?")) return;
      var p = col().doc(c.id).delete();
      // 대댓글도 함께 삭제
      p.then(function () {
        return col().where("parentId", "==", c.id).get().then(function (snap) {
          var dels = []; snap.forEach(function (d) { dels.push(d.ref.delete()); });
          return Promise.all(dels);
        });
      }).then(reload).catch(function (e) { console.error(e); alertOnce("삭제에 실패했어요."); });
    });
  }

  var _alerted = false;
  function alertOnce(msg) { window.alert(msg); }

  function init() {
    try { if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); } catch (e) { console.error(e); return; }
    db = firebase.firestore();
    injectStyle();
    root = build();
    listEl = root.querySelector(".c-list");
    countEl = root.querySelector(".c-count");
    wireSubmit(root.querySelector(".c-mainform"), null);
    reload();
  }

  // firebase-config.js → SDK → init
  loadScript("firebase-config.js")
    .then(function () {
      var cfg = window.FIREBASE_CONFIG;
      if (!cfg || !cfg.apiKey) throw "noconfig"; // 설정 전엔 표시하지 않음
      return loadScript(APP);
    })
    .then(function () { return loadScript(FS); })
    .then(init)
    .catch(function (e) { if (e !== "noconfig") console.error("comments init", e); });
})();
