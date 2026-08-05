/* =========================================================
   멘토 김부장 블로그 — 목록(홈/기술/운세) 글별 조회수·좋아요·댓글수 + 작성일자
   - 홈 .post-card, 기술/운세 .trow 에 조회/좋아요/댓글 배지 삽입
   - 조회·좋아요: Abacus /get, 댓글수: Firebase Firestore count()
   - IntersectionObserver로 보이는 것만 지연 로드
   ========================================================= */
(function () {
  "use strict";
  var BASE="https://abacus.jasoncameron.dev", NS="kimmentor-github-io-9k2";
  var APP="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
  var FS="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";
  var DATES={"post-basic-database": "2026.08.04", "post-basic-api": "2026.08.04", "post-basic-env-secrets": "2026.08.04", "post-safe-https-auth": "2026.08.04", "post-ai-prompt-engineering": "2026.08.04", "post-claude-code-guide": "2026.08.04", "post-claude-code-cli": "2026.08.04", "post-devops-series": "2026.08.04", "post-devops-cicd": "2026.08.04", "post-github-branch": "2026.08.04", "post-github-pr-review": "2026.08.04", "post-github-actions": "2026.08.04", "post-github-agent": "2026.08.04", "post-devops-container": "2026.08.04", "post-devops-k8s": "2026.08.04", "post-aws-series": "2026.08.01", "post-aws-ec2": "2026.07.30", "post-aws-loadbalancer": "2026.07.31", "post-aws-rds": "2026.07.31", "post-aws-ssl": "2026.08.01", "post-aws-route53": "2026.08.01", "post-ai-coding-tools": "2026.07.29", "post-ai-agent": "2026.07.29", "post-agent-skills": "2026.07.28", "post-loop-engineering": "2026.07.28", "post-vibe-coding": "2026.07.28", "post-ai-tools-2026": "2026.07.27", "post-ai-cautions": "2026.07.26", "post-how-i-built": "2026.07.20", "post-is-it-possible": "2026.07.18", "post-launch": "2026.07.15"};

  function slugFromHref(h){ if(!h)return""; var p=h.split("#")[0].split("?")[0].split("/").pop()||""; p=p.replace(/\.html?$/i,""); return p.replace(/[^A-Za-z0-9_.-]/g,"-").slice(0,58); }
  function fmt(n){ try{return Number(n).toLocaleString("ko-KR");}catch(e){return String(n);} }
  function get(key){ return fetch(BASE+"/get/"+NS+"/"+key,{cache:"no-store"}).then(function(r){return r.status===404?{value:0}:r.json();}).then(function(j){return (j&&typeof j.value==="number")?j.value:0;}); }

  // ---- Firebase (댓글수) ----
  function loadScript(src){ return new Promise(function(res,rej){ var s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=function(){rej(new Error(src));}; document.head.appendChild(s); }); }
  var fbReady = loadScript("firebase-config.js").then(function(){
    var cfg=window.FIREBASE_CONFIG;
    if(!cfg||!cfg.apiKey) throw "noconfig";
    return loadScript(APP).then(function(){return loadScript(FS);}).then(function(){
      try{ if(!firebase.apps.length) firebase.initializeApp(cfg); }catch(e){}
      return firebase.firestore();
    });
  }).catch(function(){ return null; });
  function cmtCount(slug){
    return fbReady.then(function(db){
      if(!db) return null;
      var q = db.collection("comments").where("slug","==",slug);
      // count() 집계가 지원되면 사용, 아니면 문서 수로 폴백
      if (q.count) {
        return q.count().get()
          .then(function(s){ return s.data().count; })
          .catch(function(){ return q.get().then(function(snap){ return snap.size; }).catch(function(){ return null; }); });
      }
      return q.get().then(function(snap){ return snap.size; }).catch(function(){ return null; });
    });
  }

  var queue=[],running=false;
  function pump(){ if(running)return; running=true; (function next(){ var job=queue.shift(); if(!job){running=false;return;} job(); setTimeout(next,220); })(); }
  function enqueue(fn){ queue.push(fn); pump(); }

  function badgeHTML(){ return ''+
    '<span class="le-i le-view"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg><b class="le-v">–</b></span>'+
    '<span class="le-i le-like"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5.5 5.7 5.5c1.9 0 3.1 1.1 3.8 2.1.7-1 1.9-2.1 3.8-2.1 3.2 0 4.7 3 3.2 6C19 15.65 12 20 12 20z" stroke="none"/></svg><b class="le-l">–</b></span>'+
    '<span class="le-i le-cmt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.5-4.4a8.3 8.3 0 0 1-1-4A8.4 8.4 0 0 1 12 3.6a8.4 8.4 0 0 1 9 7.9z"/></svg><b class="le-c">–</b></span>'; }

  function load(badge,slug){
    enqueue(function(){ get("v-"+slug).then(function(v){var el=badge.querySelector(".le-v");if(el)el.textContent=fmt(v);}).catch(function(){}); });
    enqueue(function(){ get("l-"+slug).then(function(v){var el=badge.querySelector(".le-l");if(el)el.textContent=fmt(v);}).catch(function(){}); });
    cmtCount(slug).then(function(c){ var el=badge.querySelector(".le-c"); if(el) el.textContent=(c==null?"0":fmt(c)); });
  }

  function collect(){
    var items=[];
    document.querySelectorAll("a.post-card[href]").forEach(function(card){
      var slug=slugFromHref(card.getAttribute("href")); if(!slug)return;
      var body=card.querySelector(".body"); if(!body)return;
      if(DATES[slug] && !body.querySelector(".le-date")){
        var d=document.createElement("span"); d.className="le-date"; d.textContent=DATES[slug];
        var tag=body.querySelector(".tag");
        if(tag) tag.insertAdjacentElement("afterend",d); else body.insertBefore(d,body.firstChild);
      }
      var badge=document.createElement("div"); badge.className="le-badge"; badge.innerHTML=badgeHTML();
      var more=body.querySelector(".more"); if(more)body.insertBefore(badge,more); else body.appendChild(badge);
      items.push({badge:badge,slug:slug});
    });
    document.querySelectorAll("article.trow").forEach(function(row){
      var link=row.querySelector(".tthumb[href], h2 a[href]");
      var slug=slugFromHref(link&&link.getAttribute("href")); if(!slug)return;
      var meta=row.querySelector(".tmeta"); if(!meta)return;
      var sep=document.createElement("span"); sep.className="dot";
      var badge=document.createElement("span"); badge.className="le-badge"; badge.innerHTML=badgeHTML();
      meta.appendChild(sep); meta.appendChild(badge);
      items.push({badge:badge,slug:slug});
    });
    return items;
  }
  function run(){
    var items=collect(); if(!items.length)return;
    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ var it=e.target.__le; io.unobserve(e.target); if(it)load(it.badge,it.slug);} }); },{rootMargin:"120px"});
      items.forEach(function(it){ it.badge.__le=it; io.observe(it.badge); });
    } else { items.forEach(function(it){ load(it.badge,it.slug); }); }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",run); else run();
})();
