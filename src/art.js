import {FILMS} from './data.js';
/* ---------- art ---------- */
function R(x,y,w,h,f,x2){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'" '+(x2||'')+'/>'}
function C(x,y,r,f,x2){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'" '+(x2||'')+'/>'}
function Ln(x1,y1,x2,y2,c,w,x3){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+c+'" stroke-width="'+(w||4)+'" stroke-linecap="round" '+(x3||'')+'/>'}
function Pg(p,f){return '<polygon points="'+p+'" fill="'+f+'"/>'}
function sun(x,y,r,col,rays,rl,sw){var s=C(x,y,r,col);rays=rays||12;rl=rl||22;for(var i=0;i<rays;i++){var a=i*2*Math.PI/rays;s+=Ln(x+Math.cos(a)*(r+10),y+Math.sin(a)*(r+10),x+Math.cos(a)*(r+10+rl),y+Math.sin(a)*(r+10+rl),col,sw||5)}return s}
function cells(x,y,w,h,cols,rows,fill,line){var s=R(x,y,w,h,fill);for(var i=1;i<cols;i++)s+=Ln(x+w*i/cols,y,x+w*i/cols,y+h,line,1.6);for(var j=1;j<rows;j++)s+=Ln(x,y+h*j/rows,x+w,y+h*j/rows,line,1.6);return s}
function wins(x,y,cols,rows,cw,ch,gx,gy,f,lit){var s='';for(var j=0;j<rows;j++)for(var i=0;i<cols;i++){s+=R(x+i*(cw+gx),y+j*(ch+gy),cw,ch,(lit&&((i*7+j*3)%lit===0))?lit2():f)}return s}
var _l='#D9432A';function lit2(){return _l}
function turbine(x,y,h,col,rot){var s=Ln(x,y,x,y-h,col,6);s+='<g transform="translate('+x+' '+(y-h)+') rotate('+(rot||0)+')">';for(var i=0;i<3;i++)s+='<polygon points="-4,0 4,0 0,'+(-h*.62)+'" fill="'+col+'" transform="rotate('+(i*120)+')"/>';return s+C(0,0,6,col)+'</g>'}
function arcs(x,y,col,n){var s='';for(var i=1;i<=n;i++){var r=18*i+8;s+='<path d="M'+(x-r*.7)+' '+(y-r*.7)+' A'+r+' '+r+' 0 0 1 '+(x+r*.7)+' '+(y-r*.7)+'" fill="none" stroke="'+col+'" stroke-width="6" stroke-linecap="round"/>'}return s+C(x,y,7,col)}

var ILL={
feron:function(P){_l=P.b;return sun(330,92,40,P.b)+R(0,332,426,68,P.a)+Pg('96,222 196,146 296,222',P.a)+R(112,222,168,110,P.c)+R(150,262,36,70,P.pn)+R(214,258,46,42,P.b)+
 '<g transform="translate(118 206) rotate(-37)">'+cells(0,-26,100,26,4,1,P.b,P.pn)+'</g>'+Ln(300,332,426,320,P.c,3,'stroke-dasharray="3 9"')+C(56,310,7,P.b)+Ln(56,317,56,332,P.c,3)},
yaici:function(P){_l=P.b;return R(120,110,186,220,P.a)+wins(140,130,4,5,28,26,10,12,P.pn,3)+R(0,330,426,70,P.c)+arcs(213,100,P.c,3)+
 C(50,150,11,P.b)+C(380,200,11,P.b)+C(60,270,11,P.b)+C(372,290,11,P.b)+Ln(50,150,120,170,P.c,2.5)+Ln(380,200,306,200,P.c,2.5)+Ln(60,270,120,270,P.c,2.5)+Ln(372,290,306,280,P.c,2.5)},
salah:function(P){_l=P.b;return C(213,230,120,P.b)+R(0,300,426,100,P.c)+Pg('70,300 150,170 230,300',P.a)+Pg('180,300 280,130 380,300',P.a)+Pg('280,130 380,300 330,300',P.pn,'')+
 '<path d="M0 330 Q100 300 200 330 T426 320 V400 H0Z" fill="'+P.pn+'" opacity=".9"/>'+turbine(54,300,120,P.pn,18)+R(120,350,40,10,P.b)+R(180,350,40,10,P.b)+R(240,350,40,10,P.b)},
elshamy:function(P){_l=P.b;return R(80,120,200,250,P.a)+wins(100,148,4,6,32,22,12,16,P.pn,4)+R(0,370,426,30,P.c)+
 '<g transform="translate(92 114) rotate(-14)">'+cells(0,-18,100,18,4,1,P.b,P.pn)+'</g>'+C(236,96,22,P.b)+Ln(236,96,236,120,P.c,4)+'<path d="M214 96h44M236 74v44" stroke="'+P.c+'" stroke-width="2"/>'+turbine(350,370,200,P.a,10)+sun(360,60,22,P.b,8,12,4)},
hossain:function(P){_l=P.b;return R(40,300,44,70,P.a)+R(100,250,44,120,P.a)+R(160,200,44,170,P.a)+R(220,160,44,210,P.b)+R(0,370,426,30,P.c)+
 C(340,150,70,'none','stroke="'+P.c+'" stroke-width="8"')+Ln(340,150,372,112,P.b,8)+C(340,150,9,P.c)+'<path d="M290 232h100" stroke="'+P.c+'" stroke-width="6" stroke-linecap="round"/>'+'<path d="M52 140 L100 110 L148 140" fill="none" stroke="'+P.c+'" stroke-width="7" stroke-linejoin="round"/>'+Ln(52,140,52,180,P.c,7)+Ln(148,140,148,180,P.c,7)},
cavalcanti:function(P){_l=P.b;var t='';for(var i=0;i<=10;i++){var a=Math.PI*(1+i/10);t+=Ln(213+Math.cos(a)*118,230+Math.sin(a)*118,213+Math.cos(a)*100,230+Math.sin(a)*100,P.c,i%5?3:6)}
 return C(213,230,138,P.a)+C(213,230,126,P.pn)+t+'<path d="M95 230 A118 118 0 0 1 213 112" fill="none" stroke="'+P.b+'" stroke-width="12"/>'+Ln(213,230,284,168,P.c,7)+C(213,230,12,P.c)+R(150,262,126,38,P.c)+'<text x="213" y="291" text-anchor="middle" font-family="Inter Tight, system-ui, sans-serif" font-weight="600" font-size="26" fill="'+P.pn+'" letter-spacing="3">kWh</text>'+
 C(40,60,10,P.b)+C(386,60,10,P.b)+C(40,360,10,P.b)+C(386,360,10,P.b)+Ln(40,60,110,130,P.c,2.5)+Ln(386,60,316,130,P.c,2.5)+Ln(40,360,110,320,P.c,2.5)+Ln(386,360,316,320,P.c,2.5)},
nglup:function(P){_l=P.b;return C(213,200,150,P.a)+'<path d="M63 200 A150 150 0 0 0 363 200Z" fill="'+P.c+'"/>'+'<path d="M63 200 A150 150 0 0 0 363 200Z" fill="url(#hatch)"/>'+
 '<path d="M63 200 H363" stroke="'+P.pn+'" stroke-width="5"/>'+C(213,200,150,'none','stroke="'+P.c+'" stroke-width="6"')+sun(340,60,26,P.b,10,14,4)+
 C(150,260,9,P.b)+C(250,300,9,P.b)+C(210,235,9,P.b)+C(300,250,9,P.b)+Ln(150,260,210,235,P.pn,3)+Ln(210,235,300,250,P.pn,3)+Ln(210,235,250,300,P.pn,3)+R(40,368,346,14,P.c)},
aly:function(P){_l=P.b;return R(130,90,200,280,P.a)+wins(150,112,3,5,40,24,16,22,P.pn,0)+R(110,138,240,8,P.c)+R(110,214,240,8,P.c)+R(110,290,240,8,P.c)+R(0,370,426,30,P.c)+sun(50,60,26,P.b,10,14,4)+
 Ln(70,90,130,170,P.b,4,'stroke-dasharray="2 10"')+Ln(80,70,130,150,P.b,4,'stroke-dasharray="2 10"')+Ln(380,30,330,120,P.b,3,'stroke-dasharray="2 9"')},
jorgensen:function(P){_l=P.b;var s='';for(var i=0;i<5;i++)s+=R(20+i*54,330-i*40,54,70+i*40,i%2?P.a:P.c);
 return s+Pg('230,80 330,10 426,80',P.b)+R(250,80,156,76,P.a)+R(318,110,24,46,P.pn)+C(80,120,60,P.a)+C(80,120,50,P.pn)+'<g transform="translate(80 120)">'+[0,90,180,270].map(function(a){return '<path d="M0 0 C 10 -14 26 -34 0 -46 C -26 -34 -10 -14 0 0Z" fill="'+P.b+'" transform="rotate('+a+')"/>'}).join('')+C(0,0,6,P.c)+'</g>'+Ln(130,150,250,130,P.c,3,'stroke-dasharray="3 8"')},
raslan:function(P){_l=P.b;return '<path d="M20 330 A193 193 0 0 1 406 330" fill="none" stroke="'+P.c+'" stroke-width="3" stroke-dasharray="3 9"/>'+sun(300,100,30,P.b,10,14,4)+Pg('40,330 213,190 386,330',P.a)+R(60,330,306,70,P.c)+
 '<g transform="translate(70 308) rotate(-37)">'+cells(0,-34,110,34,4,1,P.b,P.pn)+'</g><g transform="translate(356 308) scale(-1 1) rotate(-37)">'+cells(0,-34,110,34,4,1,P.b,P.pn)+'</g>'+
 '<text x="30" y="372" font-family="Big Shoulders Display, Impact, Arial Narrow, sans-serif" font-weight="800" font-size="40" fill="'+P.pn+'">E</text><text x="376" y="372" font-family="Big Shoulders Display, Impact, Arial Narrow, sans-serif" font-weight="800" font-size="40" fill="'+P.pn+'">W</text>'+R(190,340,46,60,P.pn)}
};
export function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function panelInner(f){return R(0,0,426,400,f.P.pn)+ILL[f.id](f.P)+'<rect width="426" height="400" fill="url(#halft)"/>'}
export function coverInner(f){
  var P=f.P,mx=Math.max.apply(null,f.lines.map(function(l){return l.length})),fs=Math.min(108,410/(mx*.5)),t='';
  f.lines.forEach(function(l,i){t+='<text x="32" y="'+(94+fs*.72+i*fs*.86)+'" font-family="Big Shoulders Display, Impact, Arial Narrow, sans-serif" font-weight="800" font-size="'+fs.toFixed(1)+'" fill="'+P.tx+'" letter-spacing="1" class="fit" data-max="410">'+esc(l)+'</text>'});
  return R(0,0,474,900,P.bg)+'<rect x="12" y="12" width="450" height="876" fill="none" stroke="'+P.tx+'" stroke-opacity=".35"/>'+
   '<text x="32" y="56" font-family="Inter Tight, system-ui, sans-serif" font-weight="600" font-size="12" letter-spacing="2.6" fill="'+P.tx+'">SDG 7 — CLEAN ENERGY</text>'+
   '<text x="442" y="56" text-anchor="end" font-family="Inter Tight, system-ui, sans-serif" font-weight="600" font-size="12" letter-spacing="2" fill="'+P.tx+'">'+f.year+'</text>'+t+
   '<svg x="24" y="378" width="426" height="400" viewBox="0 0 426 400" overflow="hidden">'+panelInner(f)+'</svg>'+
   '<line x1="32" y1="800" x2="442" y2="800" stroke="'+P.tx+'" stroke-opacity=".5"/>'+
   '<text x="32" y="830" font-family="Inter Tight, system-ui, sans-serif" font-weight="600" font-size="15" letter-spacing="1.4" fill="'+P.tx+'">'+esc(f.auFull.toUpperCase())+'</text>'+
   '<text x="32" y="854" font-family="Inter Tight, system-ui, sans-serif" font-weight="500" font-size="11" letter-spacing="1.2" fill="'+P.tx+'" fill-opacity=".75">'+esc(f.journal.toUpperCase())+'</text>'+
   '<rect x="372" y="812" width="70" height="36" fill="none" stroke="'+P.tx+'" stroke-width="1.5"/><text x="407" y="836" text-anchor="middle" font-family="Inter Tight, system-ui, sans-serif" font-weight="600" font-size="15" letter-spacing="2" fill="'+P.tx+'">SDG 7</text>'+
   '<rect width="474" height="900" fill="url(#sheen)"/>';
}
export function coverSVG(f){return '<svg viewBox="0 0 474 900" preserveAspectRatio="none" aria-hidden="true">'+coverInner(f)+'</svg>'}
export function spineSVG(f){
  var P=f.P,len=f.spine.length,fs=Math.min(64,400/(len*.46));
  return '<svg viewBox="0 0 142 840" preserveAspectRatio="none" aria-hidden="true">'+R(0,0,142,840,P.bg)+
   '<svg x="13" y="38" width="116" height="109" viewBox="0 0 426 400" overflow="hidden">'+panelInner(f)+'</svg>'+
   '<line x1="14" y1="170" x2="128" y2="170" stroke="'+P.tx+'" stroke-opacity=".5"/>'+
   '<text transform="translate('+(71-fs*.36).toFixed(1)+' 196) rotate(90)" font-family="Big Shoulders Display, Impact, Arial Narrow, sans-serif" font-weight="800" font-size="'+fs.toFixed(1)+'" fill="'+P.tx+'" letter-spacing="1.5" class="fit" data-max="450">'+esc(f.spine)+'</text>'+
   '<text x="71" y="768" text-anchor="middle" font-family="Inter Tight, system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="1.6" fill="'+P.tx+'">'+esc(f.au)+'</text>'+
   '<rect x="40" y="784" width="62" height="28" fill="none" stroke="'+P.tx+'" stroke-width="1.5"/><text x="71" y="804" text-anchor="middle" font-family="Inter Tight, system-ui, sans-serif" font-weight="600" font-size="13" letter-spacing="1.6" fill="'+P.tx+'">SDG7</text>'+
   '<rect width="142" height="840" fill="url(#sheen)"/></svg>';
}


export function fitText(root){
  const ts=(root||document).querySelectorAll('text.fit');
  ts.forEach(t=>{const m=+t.dataset.max;t.removeAttribute('textLength');
    try{const L=t.getComputedTextLength();if(L>m){t.setAttribute('textLength',m);t.setAttribute('lengthAdjust','spacingAndGlyphs')}}catch(_){}});
}
