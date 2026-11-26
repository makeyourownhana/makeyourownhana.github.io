(function(){
  var text="A candid selfie of Hana on her bed, soft window light from the left, white knit top, messy room behind her, everyday phone look.";
  var typed=document.getElementById('typed'),caret=document.getElementById('caret'),
      cv=document.getElementById('pix'),img=document.getElementById('final'),
      bar=document.getElementById('bar'),status=document.getElementById('status'),
      prog=document.getElementById('prog'),again=document.getElementById('again'),
      ctx=cv.getContext('2d');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var run=0;

  function setStatus(t,done){status.innerHTML='<i class="dot"></i>'+t;bar.classList.toggle('done',!!done)}
  function size(){var r=cv.getBoundingClientRect();cv.width=Math.round(r.width);cv.height=Math.round(r.height)}
  function cover(sw,sh,dw,dh){var s=Math.max(dw/sw,dh/sh);return [(sw-dw/s)/2,(sh-dh/s)/2,dw/s,dh/s]}
  function draw(block){
    var w=cv.width,h=cv.height,sw=Math.max(1,Math.round(w/block)),sh=Math.max(1,Math.round(h/block));
    var c=cover(img.naturalWidth,img.naturalHeight,w,h);
    var t=document.createElement('canvas');t.width=sw;t.height=sh;
    t.getContext('2d').drawImage(img,c[0],c[1],c[2],c[3],0,0,sw,sh);
    ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,w,h);ctx.drawImage(t,0,0,sw,sh,0,0,w,h);
  }
  function finish(){cv.style.opacity=0;prog.style.width='100%';setStatus('Done in 4.2s',true);caret.style.display='none'}

  function start(){
    var id=++run;
    typed.textContent='';caret.style.display='';cv.style.opacity=1;cv.style.transition='none';
    prog.style.transition='none';prog.style.width='0';
    if(reduce){typed.textContent=text;finish();return}
    size();ctx.fillStyle='#fbe7b8';ctx.fillRect(0,0,cv.width,cv.height);
    setStatus('Writing prompt',false);
    var i=0;
    (function type(){
      if(id!==run)return;
      i+=2;typed.textContent=text.slice(0,i);
      if(i<text.length){setTimeout(type,28)}else{render()}
    })();
    function render(){
      setStatus('Generating',false);
      prog.style.transition='width 2.6s linear';prog.style.width='100%';
      var steps=[64,40,24,14,8,4,2],k=0;
      (function step(){
        if(id!==run)return;
        draw(steps[k]);k++;
        if(k<steps.length){setTimeout(step,370)}
        else{cv.style.transition='opacity .5s ease';setTimeout(function(){if(id===run)finish()},120)}
      })();
    }
  }
  again.addEventListener('click',start);
  function go(){
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){io.disconnect();start()}},{threshold:.4});
      io.observe(cv);
    }else start();
  }
  if(img.complete&&img.naturalWidth)go();else img.addEventListener('load',go);

  // before / after
  var ba=document.getElementById('ba'),r=document.getElementById('baRange');
  r.addEventListener('input',function(){ba.style.setProperty('--x',r.value+'%')});

  // copy
  document.querySelectorAll('.copy').forEach(function(btn){
    btn.addEventListener('click',function(){
      var t=document.getElementById(btn.dataset.target).innerText,orig=btn.textContent;
      function done(){btn.textContent='Copied';setTimeout(function(){btn.textContent=orig},1600)}
      function fallback(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');done()}catch(e){btn.textContent='Long-press to copy'}document.body.removeChild(a)}
      if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(done,fallback)}else fallback();
    });
  });
})();

(function(){
  var box=document.getElementById('live');if(!box)return;
  var nums=box.querySelectorAll('.num');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fmt(v,dec,to){return (v>=to?String(to):v.toFixed(dec))}
  function run(){
    box.classList.add('run');
    if(reduce)return;
    nums.forEach(function(el,i){
      var to=parseFloat(el.dataset.to),dec=parseInt(el.dataset.dec||'0',10),suf=el.dataset.suf||'',t0=null,dur=1900+i*250;
      el.textContent=(0).toFixed(dec)+suf;
      function tick(t){
        if(!t0)t0=t;var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
        el.textContent=fmt(to*e,dec,to)+suf;
        if(p<1)requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){io.disconnect();run()}},{threshold:.5});
    io.observe(box);
  }else run();
})();
