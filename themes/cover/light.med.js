/* ---- najeon cover medallion (water · moon · pine in lower-left) ---- */
(function(){
  var NS='http://www.w3.org/2000/svg',art=document.getElementById('art');if(!art)return;
  var IR=['url(#ir1)','url(#ir2)','url(#ir3)','url(#ir4)'];
  function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e;}
  function ri(){return IR[Math.floor(rnd()*IR.length)];}
  function mb(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var rnd=mb(11);
  var hz=454,bot=716;
  for(var y=hz;y<bot;y+=8){var dp=(y-hz)/(bot-hz),ct=Math.floor(28+dp*34);
    for(var i=0;i<ct;i++){var x=20+rnd()*720,w=4+rnd()*(12+dp*20),op=(0.18+rnd()*0.62)*(1-dp*0.42);
      art.appendChild(el('rect',{x:x.toFixed(1),y:y.toFixed(1),width:w.toFixed(1),height:(1.4+rnd()*1.6).toFixed(1),rx:1,fill:ri(),opacity:op.toFixed(2)}));}}
  function streak(cx){for(var y=hz;y<bot;y+=7){var dp=(y-hz)/(bot-hz),w=10+rnd()*26;
    art.appendChild(el('rect',{x:(cx-w/2+(rnd()-0.5)*30).toFixed(1),y:y.toFixed(1),width:w.toFixed(1),height:(1.6+rnd()*1.8).toFixed(1),rx:1,fill:ri(),opacity:((0.30+rnd()*0.55)*(1-dp*0.40)).toFixed(2)}));}}
  streak(210);streak(536);
  art.appendChild(el('circle',{cx:536,cy:96,r:78,fill:'url(#moonGrad)'}));
  art.appendChild(el('circle',{cx:536,cy:96,r:78,fill:'none',stroke:'#fff5e6','stroke-width':3,opacity:.10}));
  var tg=el('g',{transform:'translate(-98 132)'});art.appendChild(tg);
  var SH=['#fbe7ee','#f4d4e0','#ecc0d0','#e3b0c2','#d9a0b6','#ffffff'];
  function sh(){return SH[Math.floor(rnd()*4)];}
  function P(x,y){return x.toFixed(1)+','+y.toFixed(1);}
  function fan(x,y,open,sc){var arc=1.5+rnd()*0.5,a1=open-arc/2,a2=open+arc/2,R=(28+rnd()*16)*sc;
    var b1x=x+Math.cos(a1)*R,b1y=y+Math.sin(a1)*R,b2x=x+Math.cos(a2)*R,b2y=y+Math.sin(a2)*R;
    tg.appendChild(el('path',{d:'M'+P(x,y)+' L'+P(b1x,b1y)+' A'+R.toFixed(1)+' '+R.toFixed(1)+' 0 0 1 '+P(b2x,b2y)+' Z',fill:ri(),opacity:(0.14+rnd()*0.14).toFixed(2)}));
    var rays=18+Math.floor(rnd()*10);
    for(var i=0;i<rays;i++){var a=a1+arc*(i/(rays-1)),len=R*(0.82+rnd()*0.22);
      tg.appendChild(el('line',{x1:x.toFixed(1),y1:y.toFixed(1),x2:(x+Math.cos(a)*len).toFixed(1),y2:(y+Math.sin(a)*len).toFixed(1),stroke:sh(),'stroke-width':(0.7+rnd()*0.7).toFixed(1),'stroke-linecap':'round',opacity:(0.45+rnd()*0.4).toFixed(2)}));}
    tg.appendChild(el('path',{d:'M'+P(b1x,b1y)+' A'+R.toFixed(1)+' '+R.toFixed(1)+' 0 0 1 '+P(b2x,b2y),fill:'none',stroke:sh(),'stroke-width':0.8,opacity:(0.28+rnd()*0.3).toFixed(2)}));
    tg.appendChild(el('circle',{cx:x.toFixed(1),cy:y.toFixed(1),r:(2+rnd()*2).toFixed(1),fill:sh(),opacity:.7}));}
  function limb(pts,w0){for(var i=0;i<pts.length-1;i++){var w=Math.max(1.4,w0*(1-i/(pts.length-1)*0.62));
    tg.appendChild(el('line',{x1:pts[i][0],y1:pts[i][1],x2:pts[i+1][0],y2:pts[i+1][1],stroke:sh(),'stroke-width':w.toFixed(1),'stroke-linecap':'round',opacity:.82}));
    var dx=pts[i+1][0]-pts[i][0],dy=pts[i+1][1]-pts[i][1],L=Math.hypot(dx,dy),st=Math.max(1,Math.floor(L/9)),ang=Math.atan2(dy,dx)*57.2958;
    for(var s=0;s<st;s++){var t=s/st,fx=pts[i][0]+dx*t,fy=pts[i][1]+dy*t;
      if(rnd()<0.5)tg.appendChild(el('ellipse',{cx:fx.toFixed(1),cy:fy.toFixed(1),rx:(1+rnd()*2).toFixed(1),ry:(0.6+rnd()*1.2).toFixed(1),fill:ri(),opacity:(0.3+rnd()*0.4).toFixed(2),transform:'rotate('+ang.toFixed(0)+' '+fx.toFixed(1)+' '+fy.toFixed(1)+')'}));
      if(rnd()<0.32){var na=Math.atan2(dy,dx)+Math.PI/2,cl=w*0.85;tg.appendChild(el('line',{x1:(fx-Math.cos(na)*cl).toFixed(1),y1:(fy-Math.sin(na)*cl).toFixed(1),x2:(fx+Math.cos(na)*cl).toFixed(1),y2:(fy+Math.sin(na)*cl).toFixed(1),stroke:'#c489a0','stroke-width':0.8,opacity:.5}));}}}}
  function cf(x,y,open,sc){var k=3+Math.floor(rnd()*3);for(var c=0;c<k;c++)fan(x+(rnd()-0.5)*22*sc,y+(rnd()-0.5)*16*sc,open+(rnd()-0.5)*0.6,sc*(0.72+rnd()*0.45));}
  limb([[160,458],[226,442],[292,420],[356,404],[428,372],[488,330],[542,292],[568,256]],24);
  limb([[226,442],[286,478],[330,540],[352,606]],14);
  limb([[292,420],[250,402],[210,372],[180,342]],13);
  limb([[356,404],[352,352],[336,306],[324,270]],11);
  limb([[428,372],[452,322],[463,274]],11);
  limb([[488,330],[528,366],[558,422]],11);
  limb([[428,372],[470,360],[510,340]],9);
  limb([[356,404],[392,388],[430,392]],8);
  cf(180,342,-2.1,1.8);cf(214,374,-2.5,1.4);cf(252,402,-2.4,1.1);cf(324,270,-1.6,1.7);cf(300,410,-1.5,1.5);cf(372,398,-1.5,1.5);cf(432,390,-1.5,1.2);cf(463,274,-1.1,1.8);cf(510,340,-0.9,1.4);cf(568,256,-0.6,1.9);cf(540,300,-1.0,1.2);cf(558,422,0.5,1.6);cf(352,606,1.3,1.6);cf(286,478,1.9,1.2);cf(160,458,-2.9,1.2);
})();
