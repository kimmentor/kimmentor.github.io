/* =========================================================
   멘토 김부장 블로그 — 글별 조회수 + 좋아요 + 이전/다음 글 이동
   - Abacus 무료 카운터(서버 없이 동작), 파일명(슬러그)별 집계
   - 조회수: 같은 브라우저 하루 1회 / 좋아요: 같은 브라우저 1회
   - 시리즈(분류)별 이전·다음 글 이동(제목 표시)
   ========================================================= */
(function () {
  "use strict";
  var BASE = "https://abacus.jasoncameron.dev";
  var NS = "kimmentor-github-io-9k2";
  var SERIES = [["post-saju-01", "post-saju-02", "post-saju-03", "post-saju-04", "post-saju-05", "post-saju-06", "post-saju-07", "post-saju-08", "post-saju-09", "post-saju-10", "post-saju-11", "post-saju-12", "post-saju-13", "post-saju-14", "post-saju-15", "post-saju-16", "post-saju-17", "post-saju-18", "post-saju-19", "post-saju-20", "post-saju-21", "post-saju-22", "post-saju-23", "post-saju-24", "post-saju-25", "post-saju-26", "post-saju-27", "post-saju-28", "post-saju-29", "post-saju-30"], ["post-classic-01", "post-classic-02", "post-classic-03", "post-classic-04", "post-classic-05", "post-classic-06", "post-classic-07", "post-classic-08", "post-classic-09", "post-classic-10", "post-classic-11", "post-classic-12", "post-classic-13", "post-classic-14", "post-classic-15", "post-classic-16", "post-classic-17", "post-classic-18", "post-classic-19", "post-classic-20", "post-classic-21", "post-classic-22", "post-classic-23", "post-classic-24", "post-classic-25", "post-classic-26", "post-classic-27", "post-classic-28", "post-classic-29", "post-classic-30"], ["post-modern-01", "post-modern-02", "post-modern-03", "post-modern-04", "post-modern-05", "post-modern-06", "post-modern-07", "post-modern-08", "post-modern-09", "post-modern-10", "post-modern-11", "post-modern-12", "post-modern-13", "post-modern-14", "post-modern-15", "post-modern-16", "post-modern-17", "post-modern-18", "post-modern-19", "post-modern-20", "post-modern-21", "post-modern-22", "post-modern-23", "post-modern-24", "post-modern-25", "post-modern-26", "post-modern-27", "post-modern-28", "post-modern-29", "post-modern-30"], ["post-devops-series", "post-devops-cicd", "post-github-branch", "post-github-pr-review", "post-github-actions", "post-github-agent", "post-devops-container", "post-devops-k8s"], ["post-aws-series", "post-aws-ec2", "post-aws-loadbalancer", "post-aws-rds", "post-aws-ssl", "post-aws-route53"], ["post-num-01", "post-num-02", "post-num-03", "post-num-04", "post-num-05", "post-num-06", "post-num-07", "post-num-08", "post-num-09", "post-num-10"], ["post-zwds-01", "post-zwds-02", "post-zwds-03", "post-zwds-04", "post-zwds-05", "post-zwds-06", "post-zwds-07", "post-zwds-08", "post-zwds-09", "post-zwds-10", "post-zwds-11", "post-zwds-12", "post-zwds-13", "post-zwds-14", "post-zwds-15", "post-zwds-16", "post-zwds-17", "post-zwds-18", "post-zwds-19", "post-zwds-20", "post-zwds-21", "post-zwds-22", "post-zwds-23", "post-zwds-24", "post-zwds-25", "post-zwds-26", "post-zwds-27", "post-zwds-28", "post-zwds-29", "post-zwds-30"]];
  var TITLES = {"post-saju-01": "사주팔자란 무엇인가 — 태어난 순간의 '기운 지도'", "post-saju-02": "사주는 어떻게 뽑나 — 연월일시와 만세력", "post-saju-03": "음양(陰陽) — 세상을 읽는 가장 큰 두 축", "post-saju-04": "오행(五行) — 목화토금수 다섯 기운 첫걸음", "post-saju-05": "오행의 상생과 상극 — 돕고 누르는 관계", "post-saju-06": "천간(天干) 10글자 완전정복", "post-saju-07": "지지(地支) 12글자와 열두 동물", "post-saju-08": "60갑자(六十甲子) — 천간과 지지의 짝", "post-saju-09": "사주의 구조 — 네 기둥과 여덟 글자", "post-saju-10": "일간(日干) — 사주에서 '나'를 뜻하는 글자", "post-saju-11": "지장간(支藏干) — 지지 속에 숨은 천간", "post-saju-12": "십신(十神) — 나와 다른 글자의 열 가지 관계", "post-saju-13": "비겁(比劫) — 나와 같은 편, 형제와 경쟁", "post-saju-14": "식상(食傷) — 내가 낳고 표현하는 기운", "post-saju-15": "재성(財星) — 내가 다스리는 재물과 현실", "post-saju-16": "관성(官星) — 나를 다스리는 규율과 책임", "post-saju-17": "인성(印星) — 나를 돕고 채워 주는 기운", "post-saju-18": "십이운성(十二運星) — 기운의 생로병사", "post-saju-19": "신살(神殺) — 도화·역마·화개 쉽게 보기", "post-saju-20": "신강·신약 — 내 사주의 힘은 센가 약한가", "post-saju-21": "용신(用神) — 사주의 균형을 맞추는 열쇠", "post-saju-22": "격국(格局) — 사주의 큰 틀 읽기", "post-saju-23": "대운(大運) — 10년 단위로 흐르는 큰 운", "post-saju-24": "세운(歲運) — 그 해의 운을 보는 법", "post-saju-25": "합(合) — 글자들이 서로 끌리는 관계", "post-saju-26": "충(沖) — 글자들이 부딪히는 관계", "post-saju-27": "형·파·해(刑破害) — 미묘한 관계들", "post-saju-28": "오행으로 보는 성격과 적성", "post-saju-29": "사주로 보는 궁합 — 오해와 진실", "post-saju-30": "사주 공부 로드맵 & 건강하게 활용하기", "post-classic-01": "고전점성이란 — 별로 읽는 고대의 지혜", "post-classic-02": "점성술의 역사 — 바빌로니아에서 르네상스까지", "post-classic-03": "천궁도(호로스코프)란 — 태어난 순간 하늘의 지도", "post-classic-04": "황도 12궁 개관 — 열두 별자리 한눈에", "post-classic-05": "4원소와 3특질 — 불·흙·공기·물 / 활동·고정·변통", "post-classic-06": "고전의 7행성 — 태양·달·수·금·화·목·토", "post-classic-07": "길성과 흉성 — 행성의 성질과 상징", "post-classic-08": "12하우스 개관 — 앵글·석시던트·카덴트", "post-classic-09": "하우스의 의미 — 1하우스부터 12하우스까지", "post-classic-10": "지배성(룰러십) — 별자리의 주인 행성", "post-classic-11": "행성의 품위(Dignity) — 고양·삼분·텀·페이스", "post-classic-12": "필수 위계와 우연 위계 — 강한 행성 약한 행성", "post-classic-13": "섹트(Sect) — 낮의 별과 밤의 별", "post-classic-14": "어스펙트(각) — 합·육각·사각·삼각·대립", "post-classic-15": "어스펙트의 적용 — 접근각과 분리각", "post-classic-16": "로트(Lots) — 행운의 로트와 아라비안 파트", "post-classic-17": "행성의 상태 — 역행·연소·안티션", "post-classic-18": "별자리별 성질 — 양자리~처녀자리", "post-classic-19": "별자리별 성질 — 천칭자리~물고기자리", "post-classic-20": "빅3 — 태양·달·상승점(ASC)", "post-classic-21": "상승점과 차트의 주인(차트 룰러)", "post-classic-22": "네 앵글 — ASC·IC·DSC·MC", "post-classic-23": "프로펙션 — 나이로 돌리는 한 해의 하우스", "post-classic-24": "타임로드 개관 — 피르다리아 등 시간의 지배자", "post-classic-25": "트랜짓 — 행성의 이동이 주는 흐름", "post-classic-26": "리턴 차트 — 솔라 리턴 개요", "post-classic-27": "일렉션(택일점성) 개요 — 좋은 때 고르기", "post-classic-28": "호라리(질문점성) 개요 — 질문의 순간을 읽다", "post-classic-29": "고전점성으로 삶을 읽는 법 — 종합 실습", "post-classic-30": "고전점성 공부 로드맵 & 현대와의 조화", "post-modern-01": "현대점성이란 — 심리와 성장의 언어", "post-modern-02": "현대점성 vs 고전점성 — 무엇이 달라졌나", "post-modern-03": "네이탈 차트(출생 차트) 읽기 시작", "post-modern-04": "태양별자리 — 나의 핵심 자아", "post-modern-05": "달별자리 — 감정과 내면의 세계", "post-modern-06": "상승별자리(어센던트) — 첫인상과 페르소나", "post-modern-07": "빅3 종합 — 태양·달·상승 함께 읽기", "post-modern-08": "수성 — 사고와 소통의 방식", "post-modern-09": "금성 — 사랑과 가치의 언어", "post-modern-10": "화성 — 욕망과 추진력", "post-modern-11": "목성 — 확장과 행운", "post-modern-12": "토성 — 책임과 성장의 과제", "post-modern-13": "천왕성 — 혁신과 자유", "post-modern-14": "해왕성 — 꿈과 영성", "post-modern-15": "명왕성 — 변형과 재생", "post-modern-16": "12별자리 심리 키워드 — 양자리~처녀자리", "post-modern-17": "12별자리 심리 키워드 — 천칭자리~물고기자리", "post-modern-18": "12하우스 — 삶의 열두 무대", "post-modern-19": "하우스별 의미 — 1~6하우스", "post-modern-20": "하우스별 의미 — 7~12하우스", "post-modern-21": "어스펙트 — 행성들의 대화", "post-modern-22": "메이저 어스펙트의 심리적 의미", "post-modern-23": "차트의 패턴 — 스텔리움·그랜드트라인·T스퀘어", "post-modern-24": "노스·사우스 노드 — 영혼의 성장 방향", "post-modern-25": "카이런 — 상처와 치유의 지점", "post-modern-26": "역행(리트로그레이드) — 수성 역행 바로 알기", "post-modern-27": "트랜짓 — 지금 하늘이 주는 흐름", "post-modern-28": "프로그레션 — 내면의 성숙", "post-modern-29": "시너스트리 — 관계·궁합의 점성학", "post-modern-30": "현대점성 공부 로드맵 & 건강하게 활용하기", "post-devops-series": "DevOps가 뭐길래 — 만들고 운영하기의 큰 그림", "post-devops-cicd": "CI/CD가 뭐길래 — 저장만 하면 배포되는 마법", "post-github-branch": "깃허브 브랜치 전략 — 나눠 짓고 안전하게 합치기", "post-github-pr-review": "PR과 코드 리뷰 — 합치기 전에 봐주는 문화", "post-github-actions": "GitHub Actions — 자동화 로봇을 두는 법", "post-github-agent": "GitHub 코딩 에이전트 — 이슈만 맡기면 PR까지", "post-devops-container": "컨테이너가 뭐길래 — 마법의 상자", "post-devops-k8s": "쿠버네티스가 뭐길래 — 컨테이너들의 지휘자", "post-aws-series": "비개발자가 AWS로 앱을 배포한 이야기", "post-aws-ec2": "EC2 서버 만들기", "post-aws-loadbalancer": "로드밸런서(ALB) 구축하기", "post-aws-rds": "데이터베이스(RDS) 만들기", "post-aws-ssl": "SSL 인증서 발급받기(ACM)", "post-aws-route53": "Route 53 도메인 신청하기", "post-num-01": "수비학이란 — 숫자로 나를 읽는 오래된 지혜", "post-num-02": "생명수(Life Path) 구하기 — 생년월일을 한 자리로", "post-num-03": "이름으로 보는 수 — 표현수와 소울수", "post-num-04": "숫자 1·2·3의 의미", "post-num-05": "숫자 4·5·6의 의미", "post-num-06": "숫자 7·8·9의 의미", "post-num-07": "마스터 넘버 11·22·33", "post-num-08": "개인의 해(Personal Year) — 9년 주기의 흐름", "post-num-09": "수비학으로 보는 관계와 궁합", "post-num-10": "수비학 공부 로드맵 & 건강하게 활용하기", "post-zwds-01": "자미두수란 무엇인가 — 별로 보는 동양의 명리", "post-zwds-02": "자미두수 vs 사주 — 무엇이 다른가", "post-zwds-03": "명반(命盤)이란 — 열두 칸의 인생 지도", "post-zwds-04": "명반은 어떻게 세우나 — 생년월일시와 음력", "post-zwds-05": "12궁 개관 — 열두 개의 인생 무대", "post-zwds-06": "명궁(命宮) — 나의 중심", "post-zwds-07": "형제궁·부부궁 — 가까운 인연", "post-zwds-08": "자녀궁·재백궁 — 자녀와 재물", "post-zwds-09": "질액궁·천이궁 — 건강과 바깥 활동", "post-zwds-10": "노복궁·관록궁 — 인간관계와 사회적 성취", "post-zwds-11": "전택궁·복덕궁·부모궁 — 터전·복·부모", "post-zwds-12": "14 주성(主星) 개관 — 열네 개의 별", "post-zwds-13": "자미성(紫微) — 제왕의 별", "post-zwds-14": "천기성(天機) — 지혜의 별", "post-zwds-15": "태양성(太陽) — 빛과 명예의 별", "post-zwds-16": "무곡성(武曲) — 재물과 결단의 별", "post-zwds-17": "천동성(天同) — 복과 온화의 별", "post-zwds-18": "염정성(廉貞) — 변화와 정열의 별", "post-zwds-19": "천부성(天府) — 곳간의 별", "post-zwds-20": "태음성(太陰) — 달과 섬세함의 별", "post-zwds-21": "탐랑성(貪狼) — 욕망과 재능의 별", "post-zwds-22": "거문성(巨門) — 말과 시비의 별", "post-zwds-23": "천상성(天相) — 보좌와 신의의 별", "post-zwds-24": "천량성(天梁) — 어른과 보호의 별", "post-zwds-25": "칠살성(七殺) — 개척과 결단의 별", "post-zwds-26": "파군성(破軍) — 파괴와 창조의 별", "post-zwds-27": "사화(四化) — 화록·화권·화과·화기", "post-zwds-28": "보좌성과 살성 — 도움별과 흉별", "post-zwds-29": "대한과 유년 — 자미두수로 보는 운의 흐름", "post-zwds-30": "자미두수 공부 로드맵 & 건강하게 활용하기"};

  var article = document.querySelector("article.article");
  if (!article) return;

  function slugFromPath() {
    var p = (location.pathname || "").split("/").pop() || "";
    p = p.replace(/\.html?$/i, "");
    if (!p || p === "index") p = "home";
    p = p.replace(/[^A-Za-z0-9_.-]/g, "-");
    return p.slice(0, 58);
  }
  var SLUG = slugFromPath();
  var VKEY = "v-" + SLUG, LKEY = "l-" + SLUG;

  function kstDate() {
    try { return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()); }
    catch (e) { return new Date().toISOString().slice(0,10); }
  }
  function firstViewToday() {
    var key = "pv_" + SLUG + "_" + kstDate();
    try {
      if (localStorage.getItem(key)) return false;
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (k && k.indexOf("pv_" + SLUG + "_") === 0 && k !== key) localStorage.removeItem(k);
      }
      localStorage.setItem(key, "1"); return true;
    } catch (e) { return true; }
  }
  function alreadyLiked(){ try{return !!localStorage.getItem("pl_"+SLUG);}catch(e){return false;} }
  function markLiked(){ try{localStorage.setItem("pl_"+SLUG,"1");}catch(e){} }
  function api(kind,key){
    return fetch(BASE+"/"+kind+"/"+NS+"/"+key,{cache:"no-store"}).then(function(r){
      if(r.status===404) return {value:0};
      if(!r.ok) throw new Error("counter "+r.status);
      return r.json();
    }).then(function(j){ return (j&&typeof j.value==="number")?j.value:0; });
  }
  function fmt(n){ try{return Number(n).toLocaleString("ko-KR");}catch(e){return String(n);} }

  function injectStyle() {
    var css =
      ".pe-bar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;margin:10px 0 6px}"+
      ".pe-view{display:inline-flex;align-items:center;gap:7px;color:#5b6478;font-size:14.5px;font-weight:600}"+
      ".pe-view svg{width:17px;height:17px;opacity:.7}.pe-view b{color:#1c2033;font-variant-numeric:tabular-nums}"+
      ".pe-like{display:inline-flex;align-items:center;gap:9px;cursor:pointer;border:1.5px solid #e7e9f2;background:#fff;color:#5b6478;font-family:inherit;font-weight:800;font-size:15px;padding:9px 18px;border-radius:999px;transition:.15s all;line-height:1}"+
      ".pe-like:hover{border-color:#6d5cf0;color:#6d5cf0;transform:translateY(-1px)}"+
      ".pe-like .pe-heart{width:19px;height:19px;transition:.15s transform}.pe-like:active .pe-heart{transform:scale(.82)}"+
      ".pe-like .pe-heart path{fill:none;stroke:currentColor;stroke-width:2}"+
      ".pe-like.liked{border-color:#e8b64c;color:#c9922a;background:#fbf6ea}.pe-like.liked .pe-heart path{fill:#e8b64c;stroke:#e8b64c}"+
      ".pe-like .pe-cnt{font-variant-numeric:tabular-nums;min-width:1em}"+
      "@keyframes pePop{0%{transform:scale(1)}45%{transform:scale(1.35)}100%{transform:scale(1)}}.pe-like.pop .pe-heart{animation:pePop .32s ease}"+
      ".pe-like-big{margin:34px auto 6px;display:flex;justify-content:center}.pe-hint{display:block;text-align:center;color:#9aa0b8;font-size:12.5px;margin:2px 0 0}"+
      ".pn-nav{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:36px 0 10px}"+
      ".pn-nav a{display:flex;flex-direction:column;gap:5px;border:1px solid #e7e9f2;border-radius:14px;padding:16px 18px;background:#fff;box-shadow:0 10px 40px rgba(20,24,60,.08);transition:.15s all}"+
      ".pn-nav a:hover{transform:translateY(-3px);border-color:#6d5cf0;box-shadow:0 16px 44px rgba(20,24,60,.12)}"+
      ".pn-nav .pn-l{font-size:12.5px;font-weight:800;color:#6d5cf0;letter-spacing:.02em}"+
      ".pn-nav .pn-t{font-size:15px;font-weight:700;color:#1c2033;line-height:1.45}"+
      ".pn-nav .pn-next{text-align:right}.pn-nav .pn-next.only{grid-column:2}"+
      "@media(max-width:600px){.pn-nav{grid-template-columns:1fr}.pn-nav .pn-next{text-align:left}.pn-nav .pn-next.only{grid-column:1}}";
    var s=document.createElement("style"); s.textContent=css; document.head.appendChild(s);
  }
  function heartSVG(){ return '<svg class="pe-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5.5 5.7 5.5c1.9 0 3.1 1.1 3.8 2.1.7-1 1.9-2.1 3.8-2.1 3.2 0 4.7 3 3.2 6C19 15.65 12 20 12 20z"/></svg>'; }
  function makeTopBar(){
    var bar=document.createElement("div"); bar.className="pe-bar";
    bar.innerHTML='<span class="pe-view" aria-label="조회수"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg> 조회 <b class="pe-vnum">–</b></span>'+
      '<button type="button" class="pe-like" aria-pressed="false">'+heartSVG()+'<span>좋아요</span> <span class="pe-cnt">–</span></button>';
    return bar;
  }
  function makeBigLike(){
    var box=document.createElement("div"); box.className="pe-like-big";
    box.innerHTML='<div style="text-align:center"><button type="button" class="pe-like" aria-pressed="false">'+heartSVG()+'<span>이 글이 도움됐다면 좋아요</span> <span class="pe-cnt">–</span></button><span class="pe-hint">닉네임 없이 한 번 눌러 응원할 수 있어요</span></div>';
    return box;
  }
  function makePrevNext(){
    var prev=null,next=null;
    for(var i=0;i<SERIES.length;i++){
      var arr=SERIES[i]; var idx=arr.indexOf(SLUG);
      if(idx>-1){ if(idx>0)prev=arr[idx-1]; if(idx<arr.length-1)next=arr[idx+1]; break; }
    }
    if(!prev&&!next) return null;
    var wrap=document.createElement("div"); wrap.className="pn-nav";
    var html="";
    if(prev) html+='<a class="pn-prev" href="'+prev+'.html"><span class="pn-l">← 이전 글</span><span class="pn-t">'+(TITLES[prev]||prev)+'</span></a>';
    html+='<a class="pn-next'+(prev?'':' only')+'" href="'+(next?next+'.html':'fortune.html')+'">'+(next?'<span class="pn-l">다음 글 →</span><span class="pn-t">'+(TITLES[next]||next)+'</span>':'<span class="pn-l">목록 →</span><span class="pn-t">전체 글 보기</span>')+'</a>';
    if(!next && !prev) return null;
    wrap.innerHTML=html; return wrap;
  }

  function run(){
    injectStyle();
    var head=article.querySelector(".article-head");
    var topBar=makeTopBar();
    if(head) head.appendChild(topBar); else article.querySelector(".article-body").insertBefore(topBar,article.querySelector(".article-body").firstChild);
    var buybox=article.querySelector(".buybox");
    if(buybox&&buybox.parentNode) buybox.parentNode.insertBefore(makeBigLike(),buybox);
    // 이전/다음: back 링크 바로 앞에 삽입
    var back=article.querySelector(".back");
    var pn=makePrevNext();
    if(pn){ if(back&&back.parentNode) back.parentNode.insertBefore(pn,back); else article.querySelector(".article-body").appendChild(pn); }

    var likeBtns=article.querySelectorAll(".pe-like"), vnums=article.querySelectorAll(".pe-vnum"), cnts=article.querySelectorAll(".pe-cnt");
    function setText(list,t){ for(var i=0;i<list.length;i++) list[i].textContent=t; }
    function setLiked(l){ for(var i=0;i<likeBtns.length;i++){ likeBtns[i].classList.toggle("liked",l); likeBtns[i].setAttribute("aria-pressed",l?"true":"false"); } }
    api(firstViewToday()?"hit":"get",VKEY).then(function(v){setText(vnums,fmt(v));}).catch(function(){setText(vnums,"–");});
    api("get",LKEY).then(function(v){setText(cnts,fmt(v));}).catch(function(){setText(cnts,"–");});
    setLiked(alreadyLiked());
    var busy=false;
    function onLike(){
      if(alreadyLiked()){ for(var i=0;i<likeBtns.length;i++){var el=likeBtns[i];el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop");} return; }
      if(busy)return; busy=true; markLiked(); setLiked(true);
      for(var j=0;j<likeBtns.length;j++){likeBtns[j].classList.remove("pop");void likeBtns[j].offsetWidth;likeBtns[j].classList.add("pop");}
      api("hit",LKEY).then(function(v){setText(cnts,fmt(v));}).catch(function(){try{localStorage.removeItem("pl_"+SLUG);}catch(e){}setLiked(false);}).then(function(){busy=false;});
    }
    for(var k=0;k<likeBtns.length;k++) likeBtns[k].addEventListener("click",onLike);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",run); else run();
})();

/* 댓글(COMMENT) 모듈 로더 — 글 페이지에서만 */
(function(){
  if(!document.querySelector('article.article')) return;
  var s=document.createElement('script'); s.src='comments.js'; s.defer=true;
  document.head.appendChild(s);
})();
