(function(){
'use strict';
/* ===== ONE-TIME SETUP (site owner) =====
   Paste ONE of these so submissions reach you by email:
   - web3forms: your free Access Key from web3forms.com (they email it to you)
   - formspree: your form address from formspree.io, e.g. "https://formspree.io/f/abcdwxyz"
   Leave both empty and visitors will see a "not connected yet" notice. */
var CONFIG={web3forms:"ef31f5ed-c920-4df7-b7ee-2b49d326e918",formspree:""};

/* ===== GUESTBOOK WALL =====
   Add comments here ONLY with the visitor's permission. Example:
   {stars:5,text:"Loved the Nokia exhibit.",name:"Ana, classmate"} */
var REVIEWS=[
];

var $=function(s,r){return (r||document).querySelector(s)};
var form=$('#fbform'); if(!form) return;
var msg=$('.fmsg',form), btn=$('button[type=submit]',form);
var labels={1:'Needs work',2:'Fair',3:'Good',4:'Very good',5:'Excellent'};

/* wall */
(function(){
  var w=$('#wall'); if(!w) return;
  if(!REVIEWS.length){w.innerHTML='<div class="empty"><b>&#10086;</b>The guestbook is empty. Be the first to leave a note.</div>';return;}
  w.innerHTML=REVIEWS.map(function(r){
    var s=''; for(var i=1;i<=5;i++) s+=(i<=r.stars?'★':'☆');
    return '<div class="rev"><div class="rs" aria-label="'+r.stars+' out of 5">'+s+'</div><q>'+esc(r.text)+'</q><cite>'+esc(r.name||'A visitor')+'</cite></div>';
  }).join('');
})();
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* live labels */
form.addEventListener('change',function(e){
  if(e.target.name==='rating') $('#rateOut').textContent=labels[e.target.value]||'';
});
var ta=form.elements.message, cnt=$('.count',form);
ta.addEventListener('input',function(){cnt.textContent=ta.value.length+' / '+ta.maxLength});

function say(t,err){msg.textContent=t;msg.className='fmsg'+(err?' err':'')}

form.addEventListener('submit',function(e){
  e.preventDefault();
  var f=form.elements, rating=(form.querySelector('input[name=rating]:checked')||{}).value, text=f.message.value.trim();
  if(!rating){say('Please choose a star rating first.',1);return;}
  if(text.length<5){say('Please write a short comment (at least a few words).',1);f.message.focus();return;}
  if(f.website.value){done();return;}                     /* spam trap */
  try{var last=+localStorage.getItem('fbLast')||0; if(Date.now()-last<30000){say('Please wait a moment before sending another note.',1);return;}}catch(x){}
  var topic=(form.querySelector('input[name=topic]:checked')||{}).value||'The whole museum';
  var data={rating:rating+' / 5',topic:topic,name:f.name.value.trim()||'Anonymous',message:text,may_quote:f.quote.checked?'Yes':'No',page:location.href,sent:new Date().toISOString()};
  var req;
  if(CONFIG.web3forms){
    data.access_key=CONFIG.web3forms; data.subject='New feedback for The Archive ('+data.rating+')'; data.from_name='The Archive visitor';
    req=fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
  }else if(CONFIG.formspree){
    req=fetch(CONFIG.formspree,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
  }else{
    say('The feedback form is not connected yet. Please check back soon.',1);return;
  }
  btn.disabled=true; say('Sending…');
  req.then(function(r){return r.ok?r.json().catch(function(){return {}}):Promise.reject(r)})
     .then(function(j){ if(j&&j.success===false) throw 0; try{localStorage.setItem('fbLast',Date.now())}catch(x){} done(); })
     .catch(function(){btn.disabled=false;say('Sorry, that did not go through. Please try again in a moment.',1)});
});
function done(){
  $('.fcard').classList.add('sent');
  var t=$('.thanks'); if(t&&t.scrollIntoView) t.scrollIntoView({block:'center',behavior:'smooth'});
}
var again=$('#again'); if(again) again.addEventListener('click',function(){
  form.reset(); cnt.textContent='0 / '+ta.maxLength; $('#rateOut').textContent=''; say(''); btn.disabled=false; $('.fcard').classList.remove('sent');
});
})();
