/* =========================================================
   멘토 김부장 블로그 — 커뮤니티 (Q&A · 자유게시판 · 운세상담)
   - 분류(category): qna / free / consult
   - 운세상담(consult)은 '비밀글' 선택 가능 → 별도 컬렉션 qna_secret 저장
   - 운영진(관리자)은 Firebase 로그인 후 모든 글 조회·수정·삭제, 비밀글 열람
   - 일반 이용자: 닉네임(필수)·비밀번호(필수), 비밀번호는 SHA-256 해시로만 저장
   - 컬렉션: qna_questions(공개글), qna_secret(비밀 상담), qna_answers(답변)
   ========================================================= */
(function () {
  "use strict";

  var listEl = document.getElementById("qlist");
  var detailEl = document.getElementById("qdetail");
  if (!listEl && !detailEl) return; // 커뮤니티 페이지가 아니면 종료

  var APP = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
  var FS = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";
  var AUTH = "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";
  var db = null, auth = null, isAdmin = false;
  var ADMIN_EMAIL = ""; // firebase-config.js 의 window.ADMIN_EMAIL 에서 읽어옴

  var CATS = { qna: "Q&A", free: "자유게시판", consult: "운세상담" };
  function catLabel(c) { return CATS[c] || "Q&A"; }

  /* ---------- 유틸 ---------- */
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
  function qparam(k) {
    var m = new RegExp("[?&]" + k + "=([^&]+)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function questions() { return db.collection("qna_questions"); }
  function secretCol() { return db.collection("qna_secret"); }
  function answers() { return db.collection("qna_answers"); }
  function colOf(isSecret) { return isSecret ? secretCol() : questions(); }

  /* ---------- 예쁜 모달(팝업) ---------- */
  function mkModalStyle() {
    if (document.getElementById("mk-modal-style")) return;
    var css =
      "@keyframes mkFade{from{opacity:0}to{opacity:1}}" +
      "@keyframes mkPop{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}" +
      ".mk-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(20,24,60,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:mkFade .16s ease}" +
      ".mk-dg{width:100%;max-width:380px;background:#fff;border-radius:18px;padding:26px 24px 20px;box-shadow:0 24px 70px rgba(20,24,60,.28);animation:mkPop .2s cubic-bezier(.2,.8,.3,1);box-sizing:border-box}" +
      ".mk-ic{width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:23px;margin:0 auto 14px;background:#f0edff}" +
      ".mk-ic.dg{background:#fdeced}" +
      ".mk-tt{font-size:17px;font-weight:800;color:#1c2033;text-align:center;margin:0 0 7px}" +
      ".mk-ms{font-size:14px;line-height:1.65;color:#5b6478;text-align:center;margin:0;word-break:break-word}" +
      ".mk-in{width:100%;border:1.5px solid #e7e9f2;border-radius:11px;padding:12px 14px;font-family:inherit;font-size:15px;color:#1c2033;background:#faf9ff;outline:none;box-sizing:border-box;margin-top:12px}" +
      ".mk-in:focus{border-color:#6d5cf0;background:#fff}" +
      ".mk-er{color:#d64550;font-size:12.5px;font-weight:600;min-height:1.1em;text-align:center;margin:7px 0 0}" +
      ".mk-bs{display:flex;gap:10px;margin-top:20px}" +
      ".mk-bt{flex:1;border:none;cursor:pointer;font-family:inherit;font-weight:800;font-size:14.5px;padding:12px 10px;border-radius:999px;transition:.15s all}" +
      ".mk-bt.gh{background:#f1f2f7;color:#5b6478}.mk-bt.gh:hover{background:#e7e9f2}" +
      ".mk-bt.pr{background:linear-gradient(145deg,#6d5cf0,#4a3ad1);color:#fff}.mk-bt.pr:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(109,92,240,.32)}" +
      ".mk-bt.dg{background:linear-gradient(145deg,#e5606b,#d64550);color:#fff}.mk-bt.dg:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(214,69,80,.3)}";
    var s = document.createElement("style"); s.id = "mk-modal-style"; s.textContent = css;
    document.head.appendChild(s);
  }
  function mkModal(opt) {
    mkModalStyle();
    return new Promise(function (resolve) {
      var dg = !!opt.danger, isIn = !!opt.input;
      var icon = opt.icon || (dg ? "🗑️" : (isIn ? "🔒" : "⚠️"));
      var ov = document.createElement("div"); ov.className = "mk-ov";
      var h = '<div class="mk-dg" role="dialog" aria-modal="true">' +
        '<div class="mk-ic' + (dg ? " dg" : "") + '">' + icon + '</div>' +
        (opt.title ? '<div class="mk-tt">' + esc(opt.title) + '</div>' : '') +
        (opt.message ? '<div class="mk-ms">' + esc(opt.message) + '</div>' : '');
      if (isIn) h += '<input type="password" class="mk-in" maxlength="30" placeholder="' + esc(opt.placeholder || "비밀번호") + '"><div class="mk-er"></div>';
      h += '<div class="mk-bs">';
      if (opt.cancelText !== null) h += '<button type="button" class="mk-bt gh mk-c">' + esc(opt.cancelText || "취소") + '</button>';
      h += '<button type="button" class="mk-bt ' + (dg ? "dg" : "pr") + ' mk-o">' + esc(opt.okText || "확인") + '</button></div></div>';
      ov.innerHTML = h;
      document.body.appendChild(ov);
      var inp = ov.querySelector(".mk-in"), ob = ov.querySelector(".mk-o"), cb = ov.querySelector(".mk-c");
      var done = false;
      function close(v) {
        if (done) return; done = true;
        ov.style.animation = "mkFade .12s ease reverse";
        document.removeEventListener("keydown", onKey);
        setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 120);
        resolve(v);
      }
      function ok() {
        if (isIn) {
          var v = inp.value || "";
          if (!v) { ov.querySelector(".mk-er").textContent = "비밀번호를 입력해 주세요."; inp.focus(); return; }
          close(v);
        } else close(true);
      }
      function cancel() { close(isIn ? null : false); }
      ob.addEventListener("click", ok);
      if (cb) cb.addEventListener("click", cancel);
      ov.addEventListener("mousedown", function (e) { if (e.target === ov) cancel(); });
      function onKey(e) {
        if (e.key === "Escape") { e.preventDefault(); cancel(); }
        else if (e.key === "Enter") { e.preventDefault(); ok(); }
      }
      document.addEventListener("keydown", onKey);
      setTimeout(function () { (inp || ob).focus(); }, 40);
    });
  }
  function mkPrompt(title, message, ph) { return mkModal({ title: title, message: message, input: true, placeholder: ph, okText: "확인", cancelText: "취소" }); }
  function mkAlert(title, message, icon) { return mkModal({ title: title, message: message, icon: icon, cancelText: null, okText: "확인" }); }
  function mkConfirm(title, message) { return mkModal({ title: title, message: message, okText: "삭제", cancelText: "취소", danger: true }); }

  /* 운영진 로그인 모달 (이메일 + 비밀번호) */
  function mkLogin() {
    mkModalStyle();
    return new Promise(function (resolve) {
      var ov = document.createElement("div"); ov.className = "mk-ov";
      ov.innerHTML = '<div class="mk-dg" role="dialog" aria-modal="true">' +
        '<div class="mk-ic">🔑</div>' +
        '<div class="mk-tt">운영진 로그인</div>' +
        '<div class="mk-ms">운영진 계정으로 로그인하면 모든 글과 비밀 상담을 관리할 수 있어요.</div>' +
        '<input type="email" class="mk-in mk-email" placeholder="이메일" autocomplete="username">' +
        '<input type="password" class="mk-in mk-pw" placeholder="비밀번호" autocomplete="current-password">' +
        '<div class="mk-er"></div>' +
        '<div class="mk-bs"><button type="button" class="mk-bt gh mk-c">취소</button>' +
        '<button type="button" class="mk-bt pr mk-o">로그인</button></div></div>';
      document.body.appendChild(ov);
      var em = ov.querySelector(".mk-email"), pw = ov.querySelector(".mk-pw"), er = ov.querySelector(".mk-er");
      var ob = ov.querySelector(".mk-o"), cb = ov.querySelector(".mk-c");
      var done = false;
      function close(v) { if (done) return; done = true; document.removeEventListener("keydown", onKey); if (ov.parentNode) ov.parentNode.removeChild(ov); resolve(v); }
      function ok() {
        var e = (em.value || "").trim(), p = pw.value || "";
        if (!e || !p) { er.textContent = "이메일과 비밀번호를 입력해 주세요."; return; }
        close({ email: e, password: p });
      }
      ob.addEventListener("click", ok);
      cb.addEventListener("click", function () { close(null); });
      ov.addEventListener("mousedown", function (e) { if (e.target === ov) close(null); });
      function onKey(e) { if (e.key === "Escape") close(null); else if (e.key === "Enter") ok(); }
      document.addEventListener("keydown", onKey);
      setTimeout(function () { em.focus(); }, 40);
    });
  }

  /* 비밀번호 확인(비관리자) → 관리자는 통과 */
  function authorize(pwHash) {
    if (isAdmin) return Promise.resolve(true);
    return mkPrompt("비밀번호 확인", "작성 시 입력한 비밀번호를 입력하세요.", "비밀번호").then(function (pw) {
      if (pw == null) return null;
      return sha256(pw).then(function (h) { return h === pwHash; });
    });
  }

  /* ---------- 커뮤니티 전용 스타일 ---------- */
  function injectStyle() {
    if (document.getElementById("qna-extra-style")) return;
    var css =
      ".qcats{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 18px}" +
      ".qcat{border:1.5px solid #e7e9f2;background:#fff;color:#5b6478;font-family:inherit;font-weight:700;font-size:14px;padding:8px 16px;border-radius:999px;cursor:pointer;transition:.15s all}" +
      ".qcat:hover{border-color:#6d5cf0;color:#6d5cf0}" +
      ".qcat.active{background:linear-gradient(145deg,#6d5cf0,#4a3ad1);color:#fff;border-color:transparent}" +
      ".qauth{display:flex;justify-content:flex-end;margin:0 0 10px}" +
      ".qauth button{border:1.5px solid #e7e9f2;background:#fff;color:#8a90a8;font-family:inherit;font-weight:700;font-size:12.5px;padding:7px 14px;border-radius:999px;cursor:pointer}" +
      ".qauth button:hover{border-color:#6d5cf0;color:#6d5cf0}" +
      ".qauth.admin button{border-color:#e8b64c;color:#c9922a;background:#fbf6ea}" +
      ".qcat-badge{display:inline-block;font-size:11.5px;font-weight:800;padding:2px 9px;border-radius:999px;margin-right:6px;vertical-align:middle}" +
      ".qcat-badge.qna{background:#eef0ff;color:#5646d6}" +
      ".qcat-badge.free{background:#e9f7ee;color:#2a9d5b}" +
      ".qcat-badge.consult{background:#fdeef4;color:#c94a86}" +
      ".qlock{color:#c9922a;font-weight:800}" +
      ".q-catrow{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}" +
      ".q-catrow select{flex:1;min-width:140px;border:1.5px solid #e7e9f2;border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14.5px;color:#1c2033;background:#fff}" +
      ".q-secret{display:flex;align-items:center;gap:8px;background:#fdeef4;border:1px solid #f3d0e2;border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:13.5px;color:#a63b6e;font-weight:600}" +
      ".q-secret input{width:17px;height:17px;accent-color:#c94a86}" +
      ".qv-secretnote{background:#fbf6ea;border:1px solid #f0e0b8;border-radius:12px;padding:12px 14px;color:#9a7b2a;font-size:13.5px;font-weight:600;margin-top:12px}";
    var s = document.createElement("style"); s.id = "qna-extra-style"; s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------- 인증(로그인) 바 ---------- */
  function renderAuthBar(container, onChange) {
    var bar = document.getElementById("qauth");
    if (!bar) {
      bar = document.createElement("div"); bar.className = "qauth"; bar.id = "qauth";
      container.insertBefore(bar, container.firstChild);
    }
    function paint() {
      bar.className = "qauth" + (isAdmin ? " admin" : "");
      if (isAdmin) {
        var who = (auth.currentUser && auth.currentUser.email) || "운영진";
        bar.innerHTML = '<button type="button" class="q-logout">🛡️ 운영진 모드 · 로그아웃</button>';
        bar.querySelector(".q-logout").title = who;
        bar.querySelector(".q-logout").addEventListener("click", function () { auth.signOut(); });
      } else {
        bar.innerHTML = '<button type="button" class="q-login">🔒 운영진 로그인 (Google)</button>';
        bar.querySelector(".q-login").addEventListener("click", function () {
          var provider = new firebase.auth.GoogleAuthProvider();
          auth.signInWithPopup(provider).catch(function (e) {
            console.error(e);
            if (e && (e.code === "auth/popup-blocked" || e.code === "auth/cancelled-popup-request")) {
              try { return auth.signInWithRedirect(provider); } catch (x) {}
            }
            if (e && e.code === "auth/popup-closed-by-user") return;
            mkAlert("로그인 실패", "구글 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.");
          });
        });
      }
    }
    paint();
    auth.onAuthStateChanged(function (u) {
      var okAdmin = !!(u && u.email && ADMIN_EMAIL && u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      if (u && !okAdmin) {
        // 운영진으로 등록되지 않은 구글 계정 → 로그아웃 안내
        isAdmin = false; paint();
        auth.signOut();
        mkAlert("운영진 계정 아님", "이 구글 계정(" + esc(u.email || "") + ")은 운영진으로 등록되어 있지 않아요.");
        return;
      }
      isAdmin = okAdmin;
      paint();
      if (onChange) onChange();
    });
  }

  /* =======================================================
     목록 페이지 (qna.html)
     ======================================================= */
  function initList() {
    injectStyle();
    var countEl = document.getElementById("qcount");
    var emptyEl = document.getElementById("qempty");
    var searchEl = document.getElementById("qsearch");
    var newBtn = document.getElementById("qnew-btn");
    var formWrap = document.getElementById("qform-wrap");
    var boardEl = listEl.parentNode; // main.qboard
    var allItems = [];
    var curCat = "all";

    // 인증 바
    renderAuthBar(boardEl, function () { reload(); });

    // 분류 탭
    var catsWrap = document.getElementById("qcats");
    if (!catsWrap) {
      catsWrap = document.createElement("div"); catsWrap.className = "qcats"; catsWrap.id = "qcats";
      boardEl.insertBefore(catsWrap, formWrap);
    }
    var tabs = [["all", "전체"], ["qna", "Q&A"], ["free", "자유게시판"], ["consult", "운세상담"]];
    catsWrap.innerHTML = tabs.map(function (t, i) {
      return '<button type="button" class="qcat' + (i === 0 ? " active" : "") + '" data-c="' + t[0] + '">' + t[1] + '</button>';
    }).join("");
    catsWrap.querySelectorAll(".qcat").forEach(function (b) {
      b.addEventListener("click", function () {
        catsWrap.querySelectorAll(".qcat").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active"); curCat = b.getAttribute("data-c"); render();
      });
    });

    // 글쓰기 폼
    formWrap.innerHTML =
      '<div class="qform">' +
        '<div class="q-catrow">' +
          '<select class="q-cat">' +
            '<option value="qna">Q&A · 질문하기</option>' +
            '<option value="free">자유게시판</option>' +
            '<option value="consult">운세상담</option>' +
          '</select>' +
        '</div>' +
        '<div class="q-secret" hidden><input type="checkbox" class="q-secret-chk" id="q-secret-chk">' +
          '<label for="q-secret-chk">🔒 비밀글로 등록 — 운영진(멘토 김부장)만 열람합니다</label></div>' +
        '<div class="q-row">' +
          '<input class="q-nick" type="text" maxlength="20" placeholder="닉네임 (필수)">' +
          '<input class="q-pw" type="password" maxlength="30" placeholder="비밀번호 (필수·수정/삭제 시 사용)">' +
        '</div>' +
        '<input class="q-title" type="text" maxlength="80" placeholder="제목">' +
        '<textarea class="q-body" maxlength="2000" placeholder="내용을 적어주세요 :)"></textarea>' +
        '<div class="q-bar"><span class="q-err"></span>' +
          '<button type="button" class="q-btn q-submit">등록</button>' +
        '</div>' +
      '</div>';
    formWrap.hidden = true;

    var catSel = formWrap.querySelector(".q-cat");
    var secretBox = formWrap.querySelector(".q-secret");
    var secretChk = formWrap.querySelector(".q-secret-chk");
    catSel.addEventListener("change", function () {
      var isConsult = catSel.value === "consult";
      secretBox.hidden = !isConsult;
      if (!isConsult) secretChk.checked = false;
    });

    newBtn.addEventListener("click", function () {
      formWrap.hidden = !formWrap.hidden;
      newBtn.textContent = formWrap.hidden ? "✏️ 글쓰기" : "✕ 닫기";
      if (!formWrap.hidden) formWrap.querySelector(".q-title").focus();
    });

    var submit = formWrap.querySelector(".q-submit");
    var errEl = formWrap.querySelector(".q-err");
    submit.addEventListener("click", function () {
      var nick = (formWrap.querySelector(".q-nick").value || "").trim();
      var pw = (formWrap.querySelector(".q-pw").value || "");
      var title = (formWrap.querySelector(".q-title").value || "").trim();
      var body = (formWrap.querySelector(".q-body").value || "").trim();
      var cat = catSel.value;
      var secret = cat === "consult" && secretChk.checked;
      errEl.textContent = "";
      if (!nick) return (errEl.textContent = "닉네임을 입력해 주세요.");
      if (!pw) return (errEl.textContent = "비밀번호를 입력해 주세요.");
      if (!title) return (errEl.textContent = "제목을 입력해 주세요.");
      if (!body) return (errEl.textContent = "내용을 입력해 주세요.");
      submit.disabled = true; submit.textContent = "등록 중…";
      sha256(pw).then(function (h) {
        var data = {
          title: title, nick: nick, pw: h, body: body, category: cat,
          created: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (secret) {
          data.secret = true;
          return secretCol().add(data).then(function () { return { secret: true }; });
        }
        data.answers = 0;
        return questions().add(data).then(function (ref) { return { secret: false, id: ref.id }; });
      }).then(function (r) {
        if (r.secret) {
          // 비밀 상담: 작성자는 다시 볼 수 없으므로 안내 후 폼 초기화
          formWrap.querySelector(".q-title").value = "";
          formWrap.querySelector(".q-body").value = "";
          secretChk.checked = false;
          submit.disabled = false; submit.textContent = "등록";
          formWrap.hidden = true; newBtn.textContent = "✏️ 글쓰기";
          reload();
          mkAlert("비밀 상담 접수 완료", "운영진(멘토 김부장)만 확인할 수 있어요. 소중한 사연 감사합니다.", "🔒");
        } else {
          location.href = "qna-view.html?id=" + r.id;
        }
      }).catch(function (e) {
        console.error(e); errEl.textContent = "등록에 실패했어요. 잠시 후 다시 시도해 주세요.";
        submit.disabled = false; submit.textContent = "등록";
      });
    });

    function render() {
      var q = (searchEl.value || "").trim().toLowerCase();
      var shown = 0;
      listEl.innerHTML = "";
      allItems.forEach(function (it) {
        if (curCat !== "all" && it.category !== curCat) return;
        var hay = (it.title + " " + it.body + " " + it.nick).toLowerCase();
        if (q && hay.indexOf(q) < 0) return;
        shown++;
        var a = document.createElement("a");
        a.className = "qitem";
        a.href = "qna-view.html?id=" + it.id + (it.secret ? "&s=1" : "");
        var lock = it.secret ? '<span class="qlock">🔒 </span>' : '';
        var badge = '<span class="qcat-badge ' + (it.category || "qna") + '">' + esc(catLabel(it.category)) + '</span>';
        a.innerHTML =
          '<div class="qi-main">' +
            '<h2 class="qi-title">' + badge + lock + esc(it.title) + '</h2>' +
            '<p class="qi-excerpt">' + esc((it.body || "").slice(0, 90)) + ((it.body || "").length > 90 ? "…" : "") + '</p>' +
            '<div class="qi-meta"><span class="ava">☯</span><b>' + esc(it.nick) + '</b>' +
              '<span class="dot"></span><span>' + fmtTime(it.created) + '</span></div>' +
          '</div>' +
          '<div class="qi-ans"><b>' + (it.answers || 0) + '</b><span>답변</span></div>';
        listEl.appendChild(a);
      });
      countEl.textContent = shown;
      emptyEl.style.display = shown ? "none" : "block";
    }

    searchEl.addEventListener("input", render);

    function reload() {
      var jobs = [questions().get()];
      if (isAdmin) jobs.push(secretCol().get());
      Promise.all(jobs).then(function (snaps) {
        allItems = [];
        snaps[0].forEach(function (d) { var o = d.data(); o.id = d.id; o.secret = false; allItems.push(o); });
        if (snaps[1]) snaps[1].forEach(function (d) { var o = d.data(); o.id = d.id; o.secret = true; allItems.push(o); });
        allItems.sort(function (a, b) {
          var ta = a.created && a.created.seconds ? a.created.seconds : 0;
          var tb = b.created && b.created.seconds ? b.created.seconds : 0;
          return tb - ta;
        });
        render();
      }).catch(function (e) {
        console.error("qna list", e);
        listEl.innerHTML = '<div class="q-empty">글을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</div>';
      });
    }
    reload();
  }

  /* =======================================================
     상세 페이지 (qna-view.html)
     ======================================================= */
  function initDetail() {
    injectStyle();
    var id = qparam("id");
    var isSecret = qparam("s") === "1";
    if (!id) { detailEl.innerHTML = '<div class="q-empty">잘못된 접근이에요. <a href="qna.html">목록으로</a></div>'; return; }

    // 인증 바(상세 상단)
    var article = detailEl.parentNode;
    renderAuthBar(article, function () { /* 로그인 상태 바뀌면 다시 로드 */ load(); });

    var qDoc = colOf(isSecret).doc(id);

    function verifyThen(pwHash, onOk) {
      authorize(pwHash).then(function (ok) {
        if (ok == null) return;
        if (!ok) return mkAlert("비밀번호 불일치", "비밀번호가 일치하지 않습니다.");
        onOk();
      });
    }

    function renderQuestion(q) {
      var head = document.getElementById("qhead");
      var edited = q.edited ? ' <span class="q-edited">(수정됨)</span>' : "";
      var badge = '<span class="qcat-badge ' + (q.category || "qna") + '">' + esc(catLabel(q.category)) + '</span>';
      var lock = q.secret ? ' <span class="qlock">🔒 비밀글</span>' : '';
      head.innerHTML =
        '<div class="qv-top">' + badge + '<span class="qv-tag">' + (q.category === "consult" ? "상담" : (q.category === "free" ? "글" : "질문")) + '</span>' + lock + '</div>' +
        '<h1 class="qv-title">' + esc(q.title) + '</h1>' +
        '<div class="qv-meta"><span class="ava">☯</span><b>' + esc(q.nick) + '</b>' +
          '<span class="dot"></span><span>' + fmtTime(q.created) + '</span>' + edited + '</div>' +
        '<div class="qv-body">' + nl2br(q.body) + '</div>' +
        (q.secret ? '<div class="qv-secretnote">🔒 이 글은 비밀 상담입니다. 운영진만 열람할 수 있어요.</div>' : '') +
        '<div class="qv-acts">' +
          '<button class="q-act q-qedit">수정</button>' +
          '<button class="q-act del q-qdel">삭제</button>' +
        '</div>';
      head.querySelector(".q-qedit").addEventListener("click", function () { editQuestion(q); });
      head.querySelector(".q-qdel").addEventListener("click", function () { deleteQuestion(q); });
    }

    function editQuestion(q) {
      verifyThen(q.pw, function () {
        var head = document.getElementById("qhead");
        head.innerHTML =
          '<input class="qe-title" type="text" maxlength="80" value="' + esc(q.title) + '">' +
          '<textarea class="qe-body" maxlength="2000">' + esc(q.body) + '</textarea>' +
          '<div class="q-inline"><button class="q-btn q-esave">저장</button>' +
          '<button class="q-btn ghost q-ecancel">취소</button></div>';
        head.querySelector(".q-ecancel").addEventListener("click", function () { renderQuestion(q); });
        head.querySelector(".q-esave").addEventListener("click", function () {
          var t = (head.querySelector(".qe-title").value || "").trim();
          var b = (head.querySelector(".qe-body").value || "").trim();
          if (!t || !b) return;
          qDoc.update({ title: t, body: b, edited: true }).then(function () {
            q.title = t; q.body = b; q.edited = true; renderQuestion(q);
          }).catch(function (e) { console.error(e); mkAlert("수정 실패", "수정에 실패했어요."); });
        });
      });
    }

    function deleteQuestion(q) {
      verifyThen(q.pw, function () {
        mkConfirm("삭제", "이 글과 달린 답변을 모두 삭제할까요? 되돌릴 수 없어요.").then(function (yes) {
          if (!yes) return;
          qDoc.delete().then(function () {
            return answers().where("qid", "==", id).get().then(function (snap) {
              var dels = []; snap.forEach(function (d) { dels.push(d.ref.delete()); });
              return Promise.all(dels);
            });
          }).then(function () { location.href = "qna.html"; })
            .catch(function (e) { console.error(e); mkAlert("삭제 실패", "삭제에 실패했어요."); });
        });
      });
    }

    /* ---- 답변 ---- */
    var ansListEl = document.getElementById("qanswers");
    var ansCountEl = document.getElementById("qacount");

    function reloadAnswers() {
      answers().where("qid", "==", id).get().then(function (snap) {
        var arr = [];
        snap.forEach(function (d) { var o = d.data(); o.id = d.id; arr.push(o); });
        arr.sort(function (a, b) {
          var ta = a.created && a.created.seconds ? a.created.seconds : 0;
          var tb = b.created && b.created.seconds ? b.created.seconds : 0;
          return ta - tb;
        });
        ansCountEl.textContent = arr.length;
        ansListEl.innerHTML = "";
        if (!arr.length) {
          ansListEl.innerHTML = '<div class="q-empty">아직 답변이 없어요.</div>';
          return;
        }
        arr.forEach(function (a) { ansListEl.appendChild(answerEl(a)); });
      }).catch(function (e) {
        console.error("answers", e);
        ansListEl.innerHTML = '<div class="q-empty">답변을 불러오지 못했어요.</div>';
      });
    }

    function answerEl(a) {
      var el = document.createElement("div");
      el.className = "qa-item";
      var edited = a.edited ? ' <span class="q-edited">(수정됨)</span>' : "";
      el.innerHTML =
        '<div class="qa-top"><span class="qa-nick">' + esc(a.nick) + '</span>' +
          '<span class="qa-date">' + fmtTime(a.created) + '</span>' + edited + '</div>' +
        '<div class="qa-text">' + nl2br(a.body) + '</div>' +
        '<div class="qa-acts"><button class="q-act a-edit">수정</button>' +
          '<button class="q-act del a-del">삭제</button></div>';
      el.querySelector(".a-edit").addEventListener("click", function () {
        verifyThen(a.pw, function () {
          var textEl = el.querySelector(".qa-text");
          textEl.innerHTML = '<textarea class="qa-edit" maxlength="2000">' + esc(a.body) + '</textarea>' +
            '<div class="q-inline"><button class="q-btn sm qa-save">저장</button>' +
            '<button class="q-btn ghost sm qa-cancel">취소</button></div>';
          textEl.querySelector(".qa-cancel").addEventListener("click", function () { textEl.innerHTML = nl2br(a.body); });
          textEl.querySelector(".qa-save").addEventListener("click", function () {
            var nb = (textEl.querySelector(".qa-edit").value || "").trim(); if (!nb) return;
            answers().doc(a.id).update({ body: nb, edited: true }).then(reloadAnswers)
              .catch(function (e) { console.error(e); });
          });
        });
      });
      el.querySelector(".a-del").addEventListener("click", function () {
        verifyThen(a.pw, function () {
          mkConfirm("답변 삭제", "이 답변을 삭제할까요? 되돌릴 수 없어요.").then(function (yes) {
            if (!yes) return;
            answers().doc(a.id).delete().then(function () {
              if (!isSecret) return qDoc.update({ answers: firebase.firestore.FieldValue.increment(-1) });
            }).then(reloadAnswers).catch(function (e) { console.error(e); });
          });
        });
      });
      return el;
    }

    // 답변 폼 배선
    var af = document.getElementById("qaform");
    var aSubmit = af.querySelector(".qa-submit");
    var aErr = af.querySelector(".qa-err");
    aSubmit.addEventListener("click", function () {
      var nick = (af.querySelector(".qa-nick").value || "").trim();
      var pw = (af.querySelector(".qa-pw").value || "");
      var body = (af.querySelector(".qa-body").value || "").trim();
      aErr.textContent = "";
      if (!nick) return (aErr.textContent = "닉네임을 입력해 주세요.");
      if (!pw) return (aErr.textContent = "비밀번호를 입력해 주세요.");
      if (!body) return (aErr.textContent = "답변 내용을 입력해 주세요.");
      aSubmit.disabled = true; aSubmit.textContent = "등록 중…";
      sha256(pw).then(function (h) {
        return answers().add({
          qid: id, nick: nick, pw: h, body: body,
          created: firebase.firestore.FieldValue.serverTimestamp()
        });
      }).then(function () {
        if (!isSecret) return qDoc.update({ answers: firebase.firestore.FieldValue.increment(1) });
      }).then(function () {
        af.querySelector(".qa-nick").value = "";
        af.querySelector(".qa-pw").value = "";
        af.querySelector(".qa-body").value = "";
        reloadAnswers();
      }).catch(function (e) { console.error(e); aErr.textContent = "등록에 실패했어요."; })
        .then(function () { aSubmit.disabled = false; aSubmit.textContent = "답변 등록"; });
    });

    // 질문 로드
    function load() {
      qDoc.get().then(function (d) {
        if (!d.exists) { detailEl.querySelector("#qhead").innerHTML = '<div class="q-empty">삭제되었거나 없는 글이에요. <a href="qna.html">목록으로</a></div>'; return; }
        var q = d.data(); q.id = d.id; q.secret = isSecret;
        document.title = q.title + " — 커뮤니티 — 멘토 김부장";
        renderQuestion(q);
        reloadAnswers();
      }).catch(function (e) {
        console.error(e);
        detailEl.querySelector("#qhead").innerHTML = isSecret
          ? '<div class="q-empty">🔒 이 비밀 상담은 <b>운영진 로그인</b> 후에만 볼 수 있어요. 상단의 “운영진 로그인”을 눌러주세요.</div>'
          : '<div class="q-empty">글을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</div>';
      });
    }
    load();
  }

  /* ---------- 부트스트랩 ---------- */
  loadScript("firebase-config.js")
    .then(function () {
      var cfg = window.FIREBASE_CONFIG;
      if (!cfg || !cfg.apiKey) throw "noconfig";
      ADMIN_EMAIL = (window.ADMIN_EMAIL || "").trim();
      return loadScript(APP);
    })
    .then(function () { return loadScript(FS); })
    .then(function () { return loadScript(AUTH); })
    .then(function () {
      try { if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG); }
      catch (e) { console.error(e); return; }
      db = firebase.firestore();
      auth = firebase.auth();
      if (listEl) initList();
      if (detailEl) initDetail();
    })
    .catch(function (e) { if (e !== "noconfig") console.error("qna init", e); });
})();
