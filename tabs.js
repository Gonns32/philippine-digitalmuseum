(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var tabs=$$('.mtab'), secs=$$('.wsec');
if(!tabs.length) return;
function centerTab(t){var bar=t&&t.parentNode;if(!bar||bar.scrollWidth<=bar.clientWidth)return;bar.scrollTo({left:t.offsetLeft-(bar.clientWidth-t.offsetWidth)/2,behavior:'smooth'});}
function show(id,scroll){
  tabs.forEach(function(t){var on=t.dataset.p===id;t.classList.toggle('on',on);t.setAttribute('aria-selected',on)});
  secs.forEach(function(s){s.classList.toggle('on',s.id===id)});
  if(scroll){var t=$('.mtabs');window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-68,behavior:'smooth'});}
  centerTab($('.mtab.on'));
}
tabs.forEach(function(t){t.addEventListener('click',function(){show(t.dataset.p,true);try{history.replaceState(null,'','#'+t.dataset.p)}catch(e){}})});
document.addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(g)show(g.dataset.go,true)});
function fromHash(){
  var h=(location.hash||'').slice(1), first=secs[0].id;
  if(!h){show(first,false);return;}
  var el=document.getElementById(h);
  var sec=el&&(el.classList.contains('wsec')?el:el.closest('.wsec'));
  show(sec?sec.id:first,false);
  if(el&&el!==sec){setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'start'})},120);}
}
fromHash();
addEventListener('hashchange',fromHash);
})();
