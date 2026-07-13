/* ---- najeon seal (flat: celadon + pink + cream) ---- */
(function(){
  var m='<svg viewBox="0 0 52 16">'
    +'<ellipse cx="6" cy="9" rx="5" ry="3" fill="#74a89f" opacity=".9"/>'
    +'<ellipse cx="17" cy="9" rx="3.3" ry="2.1" fill="#e6bcc7" opacity=".85"/>'
    +'<ellipse cx="25" cy="9" rx="1.9" ry="1.3" fill="#cdbfb0" opacity=".6"/>'
    +'<circle cx="44" cy="7" r="4" fill="#efe4cf" opacity=".85"/></svg>';
  document.querySelectorAll('.seal').forEach(function(s){s.innerHTML=m;});
})();

/* ---- daily: date strip, mood faces (Material sentiment_*), water glasses ---- */
(function(){
  var ds=document.getElementById('dstrip');
  if(ds){var h='';for(var d=1;d<=31;d++){h+='<span'+(d===6?' class="on"':'')+'>'+d+'</span>';}ds.innerHTML=h;}

  var moods=document.getElementById('moods');
  if(moods){
    var MOOD_PATHS=[
      'M480-260q68 0 123.5-38.5T684-400H276q25 63 80.5 101.5T480-260ZM312-520l44-42 42 42 42-42-84-86-86 86 42 42Zm250 0 42-42 44 42 42-42-86-86-84 86 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z',
      'M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 260q68 0 123.5-38.5T684-400h-66q-22 37-58.5 58.5T480-320q-43 0-79.5-21.5T342-400h-66q25 63 80.5 101.5T480-260Zm0 180q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z',
      'M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm20 180h240v-60H360v60ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z',
      'M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 100q-68 0-123.5 38.5T276-280h66q22-37 58.5-58.5T480-360q43 0 79.5 21.5T618-280h66q-25-63-80.5-101.5T480-420Zm0 340q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z',
      'M480-420q-68 0-123.5 38.5T276-280h408q-25-63-80.5-101.5T480-420Zm-168-60 44-42 42 42 42-42-42-42 42-44-42-42-42 42-44-42-42 42 42 44-42 42 42 42Zm250 0 42-42 44 42 42-42-42-42 42-44-42-42-44 42-42-42-42 42 42 44-42 42 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z'
    ];
    moods.innerHTML=MOOD_PATHS.map(function(d){return '<svg class="moodface" viewBox="0 -960 960 960"><path d="'+d+'"/></svg>';}).join('');
  }

  var cups=document.getElementById('cups');
  if(cups){var cup='<svg class="cup" viewBox="0 0 24 26">'
    +'<path class="water" d="M6.75 13 Q9 11.4 12 13 Q15 14.6 17.25 13 L16.9 22.9 Q16.85 23.5 16.3 23.5 H7.7 Q7.15 23.5 7.1 22.9 Z"/>'
    +'<path class="glass" d="M5 3 H19 L17.4 23 Q17.3 24 16.3 24 H7.7 Q6.7 24 6.6 23 Z"/></svg>';
    var c='';for(var i=0;i<7;i++){c+=cup;}cups.innerHTML=c;}
})();

/* ---- monthly calendar grid (undated: sequential days, no weekday header) ---- */
(function(){
  var cal=document.getElementById('cal');if(!cal)return;
  var n=31,cells=Math.ceil(n/7)*7,h='';
  for(var i=0;i<cells;i++){var day=i+1;
    if(day>n)h+='<div class="cell dim"></div>';else h+='<div class="cell">'+day+'</div>';}
  cal.innerHTML=h;
})();

/* ---- year-at-a-glance cards (12 months, each a mini undated calendar) ---- */
(function(){
  var yag=document.getElementById('yag');if(!yag)return;
  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var MLEN=[31,29,31,30,31,30,31,31,30,31,30,31];
  var h='';
  MONTHS.forEach(function(name,i){
    var n=MLEN[i],cells='';
    for(var d=1;d<=n;d++)cells+='<i>'+d+'</i>';
    h+='<div class="ycard"><a class="ym" href="#p-monthly">'+name+'</a>'
      +'<a class="ynotes" href="#p-notes">'+name+' notes</a>'
      +'<a class="yg" href="#p-monthly">'+cells+'</a></div>';
  });
  yag.innerHTML=h;
})();

/* ---- gratitude log rows (12 months) ---- */
(function(){
  var grat=document.getElementById('grat');if(!grat)return;
  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  grat.innerHTML=MONTHS.map(function(name){
    return '<a class="gr" href="#p-monthly"><div class="gr-mo">'+name+'</div></a>';
  }).join('');
})();

/* ---- habit grid ---- */
(function(){
  var hb=document.getElementById('hb');if(!hb)return;
  var habits=['Move my body','Drink water','Time outside','Read','Sleep by 11','No-phone hour','Be kind to myself'];
  var head='<div class="hb-row"><div class="hb-name head">Habit</div><div class="hb-days">';
  for(var d=1;d<=31;d++)head+='<div class="hb-c">'+d+'</div>';head+='</div></div>';
  function dots(){var s='';for(var d=1;d<=31;d++){s+='<div class="hb-c"><div class="o"></div></div>';}return s;}
  var rows=head;
  habits.forEach(function(name){
    rows+='<div class="hb-row"><div class="hb-name">'+name+'</div><div class="hb-days">'+dots()+'</div></div>';
  });
  for(var i=0;i<5;i++){
    rows+='<div class="hb-row"><div class="hb-name hb-blank"></div><div class="hb-days">'+dots()+'</div></div>';
  }
  hb.innerHTML=rows;
})();
