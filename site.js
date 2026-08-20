/* Мастерская Архангельское — общий скрипт */
var WA='https://wa.me/79851982945', TG='https://t.me/elenaisanewleet', TEL='+79851982945';
var MAIL=''; /* впишите адрес почты — кнопка «Почта» появится сама, например MAIL='zakaz@example.ru' */

function fval(id){var e=document.getElementById(id);return e&&e.value.trim()?e.value.trim():'—'}
function letter(){
  var t=(document.getElementById('f-topic')||{}).value||'';
  return 'Заявка с сайта'+(t?' · '+t:'')+'\nИмя: '+fval('f-name')+'\nСвязь: '+fval('f-contact')+'\nЗадача: '+fval('f-task');
}
function sendTo(kind){
  var t=letter();
  if(kind==='wa')  window.open(WA+'?text='+encodeURIComponent(t),'_blank');
  if(kind==='tg')  {try{navigator.clipboard.writeText(t)}catch(e){} window.open(TG,'_blank')}
  if(kind==='tel') location.href='tel:'+TEL;
  if(kind==='mail')location.href='mailto:'+MAIL+'?subject='+encodeURIComponent('Заявка с сайта')+'&body='+encodeURIComponent(t);
}
document.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('[data-send]'):null;
  if(b){e.preventDefault();sendTo(b.getAttribute('data-send'))}
});

/* мобильное меню создаётся для общей шапки на всех страницах */
(function(){
  var bar=document.querySelector('.bar .wrap'),nav=bar&&bar.querySelector('nav');if(!bar||!nav)return;
  var b=document.createElement('button');b.className='menu-toggle';b.type='button';
  b.setAttribute('aria-label','Открыть меню');b.setAttribute('aria-expanded','false');b.innerHTML='<span></span>';
  b.addEventListener('click',function(){var open=nav.classList.toggle('open');b.classList.toggle('open',open);b.setAttribute('aria-expanded',open?'true':'false');b.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню')});
  nav.addEventListener('click',function(e){if(e.target.closest('a')){nav.classList.remove('open');b.classList.remove('open');b.setAttribute('aria-expanded','false')}});
  bar.insertBefore(b,nav);
})();

/* тема заявки из карточки станка / услуги */
function setTopic(v){var e=document.getElementById('f-topic');if(e)e.value=v;
  var ta=document.getElementById('f-task');if(ta&&!ta.value)ta.placeholder='Например: '+v.toLowerCase()+' — опишите деталь и количество';}

/* ---- голосовое сообщение ---- */
(function(){
  var btn=document.getElementById('rec');if(!btn)return;
  var time=document.getElementById('rtime'),play=document.getElementById('rplay'),
      dl=document.getElementById('rdl'),hint=document.getElementById('rhint');
  if(!navigator.mediaDevices||!window.MediaRecorder){
    btn.disabled=true;btn.style.opacity=.45;
    hint.textContent='Запись голоса не поддерживается этим браузером — надиктуйте сообщение прямо в WhatsApp или Telegram.';
    return;
  }
  var mr,chunks=[],t0,tick,stream;
  function fmt(s){return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2)}
  btn.addEventListener('click',async function(){
    if(mr&&mr.state==='recording'){mr.stop();return}
    try{stream=await navigator.mediaDevices.getUserMedia({audio:true})}
    catch(err){hint.textContent='Микрофон недоступен: разрешите запись в настройках браузера или надиктуйте сообщение в мессенджере.';return}
    chunks=[];mr=new MediaRecorder(stream);
    mr.ondataavailable=function(e){if(e.data.size)chunks.push(e.data)};
    mr.onstop=function(){
      clearInterval(tick);stream.getTracks().forEach(function(t){t.stop()});
      var blob=new Blob(chunks,{type:mr.mimeType||'audio/webm'}),url=URL.createObjectURL(blob);
      play.src=url;play.hidden=false;dl.href=url;dl.hidden=false;
      dl.download='zayavka-'+new Date().toISOString().slice(0,10)+'.webm';
      btn.classList.remove('rec');btn.innerHTML='<span class="dot" style="background:currentColor"></span>Записать заново';
      hint.textContent='Готово. Сохраните файл и прикрепите его в WhatsApp или Telegram — так мы услышим задачу вашими словами.';
    };
    mr.start();t0=Date.now();btn.classList.add('rec');btn.innerHTML='<span class="dot"></span>Остановить запись';
    hint.textContent='Идёт запись. Скажите, что нужно: деталь, размеры, количество.';
    tick=setInterval(function(){
      var s=Math.round((Date.now()-t0)/1000);time.textContent=fmt(s);
      if(s>=180)mr.stop();
    },250);
  });
})();

/* ---- почта: кнопка только если адрес задан ---- */
(function(){
  var m=document.querySelectorAll('[data-send="mail"]');
  for(var i=0;i<m.length;i++) if(!MAIL) m[i].remove();
})();

/* ---- прорисовка схем станков ---- */
(function(){
  var cards=[].slice.call(document.querySelectorAll('.m'));if(!cards.length)return;
  function draw(card){
    if(card.dataset.drawn)return;card.dataset.drawn='1';
    [].slice.call(card.querySelectorAll('svg > *')).forEach(function(s,i){
      var L=0;try{L=s.getTotalLength()}catch(e){L=0}
      if(!L)return;
      s.style.strokeDasharray=L+'px';s.style.strokeDashoffset=L+'px';
      setTimeout(function(){
        s.style.transition='stroke-dashoffset .55s cubic-bezier(.4,0,.2,1), stroke .18s ease';
        s.style.strokeDashoffset='0px';
      },40+55*i);
    });
  }
  function sweep(){
    var vh=window.innerHeight||document.documentElement.clientHeight;
    cards.forEach(function(c,i){
      if(c.dataset.drawn)return;
      var r=c.getBoundingClientRect();
      if(r.top<vh*0.92&&r.bottom>0)setTimeout(function(){draw(c)},i%3*150);
    });
  }
  sweep();window.addEventListener('scroll',sweep,{passive:true});window.addEventListener('resize',sweep);
  /* приход по якорю: раскрыть и прорисовать нужный станок */
  function fromHash(){
    var id=location.hash.slice(1);if(!id)return;
    var t=document.getElementById(id);if(!t||!t.classList.contains('m'))return;
    cards.forEach(function(x){x.classList.remove('on')});
    t.classList.add('on');draw(t);
  }
  fromHash();window.addEventListener('hashchange',fromHash);
  setTimeout(function(){cards.forEach(function(c){
    [].slice.call(c.querySelectorAll('svg > *')).forEach(function(s){
      if(s.style.strokeDashoffset&&s.style.strokeDashoffset!=='0px'){s.style.strokeDasharray='';s.style.strokeDashoffset=''}
    });
  })},4000);
  cards.forEach(function(c){
    c.addEventListener('click',function(e){
      if(e.target.classList.contains('go')||e.target.parentNode.classList.contains('go')){
        var n=c.dataset.name;
        var f=document.getElementById('f-task');
        if(f){setTopic(n);document.getElementById('zayavka').scrollTop;
          var y=document.getElementById('zayavka').getBoundingClientRect().top+window.pageYOffset-80;
          window.scrollTo({top:y,behavior:'smooth'});f.focus({preventScroll:true});return}
        window.open(WA+'?text='+encodeURIComponent('Здравствуйте! Нужна работа: '+n),'_blank');return;
      }
      c.classList.toggle('on');
    });
  });
})();
