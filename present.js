(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

/* photo slots: show the picture if the file exists, otherwise keep the "Add photo" placeholder */
function markSlot(slot,ok){
  slot.classList.toggle('has',ok);
  if(ok){
    var im=$('img',slot);
    slot.setAttribute('data-lightbox',im.getAttribute('src'));
    slot.setAttribute('data-title',slot.getAttribute('data-cap')||'');
    slot.setAttribute('tabindex','0'); slot.setAttribute('role','button');
  }
}
$$('.slot').forEach(function(slot){
  var im=$('img',slot); if(!im) return;
  if(im.complete) markSlot(slot,im.naturalWidth>0);
  im.addEventListener('load',function(){markSlot(slot,true)});
  im.addEventListener('error',function(){markSlot(slot,false)});
  slot.addEventListener('keydown',function(e){ if(slot.classList.contains('has')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();slot.click();} });
});

/* Observable Trend / Technology Icon sub-tabs */
document.addEventListener('click',function(e){
  var b=e.target.closest('.subtabs button'); if(!b) return;
  var sec=b.closest('.psec');
  $$('.subtabs button',sec).forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-selected',on)});
  sec.dataset.sub=b.dataset.sub;
  $$('.pcard',sec).forEach(function(c){c.style.animation='none';void c.offsetWidth;c.style.animation=''});
});

/* swipe + arrows: arrows reuse the era toggle (data-v) */
var tx=null;
document.addEventListener('touchstart',function(e){var c=e.target.closest('.pcompare'); tx=c?e.touches[0].clientX:null;},{passive:true});
document.addEventListener('touchend',function(e){
  if(tx===null) return; var c=e.target.closest('.pcompare'); if(!c){tx=null;return}
  var dx=e.changedTouches[0].clientX-tx; tx=null; if(Math.abs(dx)<50) return;
  var sec=c.closest('.psec'), want=dx<0?'now':'then';
  if(sec.dataset.view!==want){var b=$('.vtoggle button[data-v="'+want+'"]',sec); if(b) b.click();}
});
document.addEventListener('click',function(e){
  var a=e.target.closest('.parrow'); if(!a) return;
  var b=$('.vtoggle button[data-v="'+a.dataset.v+'"]',a.closest('.psec')); if(b) b.click();
});

/* Then / Now toggle */
document.addEventListener('click',function(e){
  var b=e.target.closest('.vtoggle button'); if(!b) return;
  var sec=b.closest('.psec'), v=b.dataset.v;
  $$('.vtoggle button',sec).forEach(function(x){x.classList.toggle('on',x===b)});
  sec.dataset.view=v;
  $$('.pcard',sec).forEach(function(c){
    c.style.setProperty('--sx',c.classList.contains('then')?'-28px':'28px');
    c.classList.remove('swap'); void c.offsetWidth; c.classList.add('swap');
  });
});

/* impact reveal */
document.addEventListener('click',function(e){
  var b=e.target.closest('.pi-btn'); if(!b) return;
  var box=b.closest('.pimpact'), o=box.classList.toggle('open'); b.setAttribute('aria-expanded',o);
});

function centerTab(t){var bar=t&&t.parentNode;if(!bar||bar.scrollWidth<=bar.clientWidth)return;bar.scrollTo({left:t.offsetLeft-(bar.clientWidth-t.offsetWidth)/2,behavior:'smooth'});}
/* trivia flip cards */
document.addEventListener('click',function(e){
  var c=e.target.closest('.tcard'); if(!c) return;
  var on=c.classList.toggle('flipped'); c.setAttribute('aria-pressed',on);
});

/* THEN or NOW quiz */
(function(){
  var box=$('#quiz'), raw=$('#quizdata'); if(!box||!raw) return;
  var Q=JSON.parse(raw.textContent), order=[], i=0, score=0, streak=0, best=0, locked=false;
  var el={intro:$('#qIntro'),play:$('#qPlay'),end:$('#qEnd'),count:$('#qCount'),bar:$('#qBar'),text:$('#qText'),card:$('#qCard'),
    res:$('#qRes'),verdict:$('#qVerdict'),why:$('#qWhy'),streak:$('#qStreak'),btns:$$('.qbtn',box)};
  function shuffle(a){for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1)),t=a[k];a[k]=a[j];a[j]=t}return a}
  function inView(){var r=box.getBoundingClientRect(); if(r.top<120||r.top>innerHeight*.6) window.scrollTo({top:window.pageYOffset+r.top-150,behavior:'smooth'});}
  function start(){
    order=shuffle(Q.map(function(_,k){return k})); i=0; score=0; streak=0; best=0;
    el.intro.hidden=true; el.end.hidden=true; el.play.hidden=false; show(); inView();
  }
  function show(){
    var q=Q[order[i]]; locked=false;
    el.count.textContent='Question '+(i+1)+' / '+Q.length;
    el.bar.style.width=(i/Q.length*100)+'%';
    el.text.textContent=q.q; el.res.hidden=true;
    el.card.classList.remove('good','bad'); void el.card.offsetWidth; el.card.classList.add('enter');
    el.btns.forEach(function(b){b.disabled=false;b.classList.remove('picked','right')});
    el.streak.textContent=streak>1?('\uD83D\uDD25 '+streak+' in a row'):'';
  }
  function answer(a){
    if(locked) return; locked=true;
    var q=Q[order[i]], ok=a===q.a;
    if(ok){score++;streak++;if(streak>best)best=streak}else{streak=0}
    el.card.classList.remove('enter'); el.card.classList.add(ok?'good':'bad');
    el.btns.forEach(function(b){b.disabled=true;if(b.dataset.a===q.a)b.classList.add('right');if(b.dataset.a===a)b.classList.add('picked')});
    el.verdict.textContent=ok?'Correct!':'Not quite.'; el.verdict.className=ok?'ok':'no';
    el.why.textContent=q.w;
    $('#qNext').textContent=(i===Q.length-1)?'See my score \u2192':'Next \u2192';
    el.res.hidden=false;
    el.streak.textContent=streak>1?('\uD83D\uDD25 '+streak+' in a row'):'';
    var n=$('#qNext'); if(n&&n.focus) n.focus({preventScroll:true});
  }
  function finish(){
    el.play.hidden=true; el.end.hidden=false; el.bar.style.width='100%'; inView();
    var t,m;
    if(score>=11){t='Master Curator';m='Almost flawless. You could lead the tour yourself.';}
    else if(score>=8){t='Seasoned Archivist';m='You know your decades. A few exhibits are still worth another look.';}
    else if(score>=5){t='Curious Visitor';m='A solid start. Revisit the Then and Now cards and try again.';}
    else{t='First-Time Visitor';m='The exhibits are the best study guide. Explore a few tabs, then play again.';}
    $('#qTitle').textContent=t; $('#qScore').textContent=score; $('#qMsg').textContent=m+(best>1?' Longest streak: '+best+'.':'');
    var s=$('#qTitle'); s.style.animation='none'; void s.offsetWidth; s.style.animation='';
  }
  $('#qStart').addEventListener('click',start);
  $('#qAgain').addEventListener('click',start);
  $('#qNext').addEventListener('click',function(){ if(i===Q.length-1) finish(); else {i++;show();} });
  el.btns.forEach(function(b){b.addEventListener('click',function(){answer(b.dataset.a)})});
})();
})();
