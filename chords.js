const NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function fft(re,im){const n=re.length;
 for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}}
 for(let len=2;len<=n;len<<=1){const a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);
  for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let k=0;k<len/2;k++){const u=i+k,v=u+len/2,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;
   re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t;}}}}
function chromaFrames(x,sr,N=16384,hop=Math.round(sr*0.4)){
 const win=new Float32Array(N);for(let i=0;i<N;i++)win[i]=0.5-0.5*Math.cos(2*Math.PI*i/(N-1));
 const lo=Math.ceil(65*N/sr),hi=Math.floor(2000*N/sr),pc=new Int8Array(hi+1);
 for(let k=lo;k<=hi;k++)pc[k]=((Math.round(12*Math.log2(k*sr/N/440))+69)%12+12)%12;
 const out=[];
 for(let s=0;s+N<=x.length;s+=hop){const re=new Float64Array(N),im=new Float64Array(N);let e=0;
  for(let i=0;i<N;i++){const v=x[s+i];e+=v*v;re[i]=v*win[i];}
  const c=new Array(12).fill(0);
  if(Math.sqrt(e/N)>0.01){fft(re,im);const m=new Float64Array(hi+2);let mx=0;
   for(let k=lo-1;k<=hi+1;k++){m[k]=Math.hypot(re[k],im[k]);if(k>=lo&&k<=hi&&m[k]>mx)mx=m[k];}
   for(let k=lo;k<=hi;k++)if(m[k]>m[k-1]&&m[k]>=m[k+1]&&m[k]>0.1*mx)c[pc[k]]+=Math.sqrt(m[k]);}
  out.push({t:s/sr,c});}
 return out;}
const TYPES=[['',[0,4,7]],['m',[0,3,7]]];
function bestChord(c){let best=null,bs=0.5;
 for(let r=0;r<12;r++)for(const[tn,iv]of TYPES){const t=new Array(12).fill(0);iv.forEach((d,j)=>t[(r+d)%12]=j?1:1.1);
  let dot=0,na=0,nb=0;for(let i=0;i<12;i++){dot+=c[i]*t[i];na+=c[i]*c[i];nb+=t[i]*t[i];}
  const s=na?dot/Math.sqrt(na*nb):0;if(s>bs){bs=s;best=NOTES[r]+tn;}}
 return best;}
function smooth(ch,w=2){return ch.map((_,i)=>{const cnt={};for(let j=Math.max(0,i-w);j<=Math.min(ch.length-1,i+w);j++)if(ch[j])cnt[ch[j]]=(cnt[ch[j]]||0)+1;
 let b=null,m=0;for(const k in cnt)if(cnt[k]>m){m=cnt[k];b=k;}return b;});}
const MAJ=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],MIN=[6.33,2.68,3.52,5.38,2.6,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
function corr(a,b){const ma=a.reduce((x,y)=>x+y)/12,mb=b.reduce((x,y)=>x+y)/12;let n=0,da=0,db=0;
 for(let i=0;i<12;i++){n+=(a[i]-ma)*(b[i]-mb);da+=(a[i]-ma)**2;db+=(b[i]-mb)**2;}return n/Math.sqrt(da*db||1);}
function estimateKey(sum){let b='?',bs=-2;for(let r=0;r<12;r++)for(const[n,p]of[['',MAJ],['m',MIN]]){
 const s=corr(sum,p.map((_,i)=>p[(i-r+12)%12]));if(s>bs){bs=s;b=NOTES[r]+n;}}return b;}
const OPEN=new Set(['C','D','E','G','A','Am','Dm','Em']);
function shift(ch,n){const m=ch.match(/^([A-G]#?)(m?)$/);return NOTES[(NOTES.indexOf(m[1])-n+12)%12]+m[2];}
function suggestCapo(seg){const cs=seg.map(s=>s.chord);let best=0,bs=-1;
 for(let c=0;c<=7;c++){const s=cs.filter(x=>OPEN.has(shift(x,c))).length;if(s>bs){bs=s;best=c;}}
 return{capo:best,chords:[...new Set(cs.map(x=>shift(x,best)))]};}
function analyze(x,sr){
 let pk=0;for(let i=0;i<x.length;i++)pk=Math.max(pk,Math.abs(x[i]));
 if(pk>0)for(let i=0;i<x.length;i++)x[i]/=pk;
 const fr=chromaFrames(x,sr);
 for(const f of fr){const m=f.c.reduce((a,b)=>a+b,0)/12;f.c=f.c.map(v=>Math.max(0,v-m));}
 const sm=smooth(fr.map(f=>bestChord(f.c))),seg=[];
 sm.forEach((ch,i)=>{if(!ch)return;const l=seg[seg.length-1];
  if(l&&l.chord===ch&&fr[i].t-l.end<1)l.end=fr[i].t+0.4;else seg.push({chord:ch,start:fr[i].t,end:fr[i].t+0.4});});
 const sum=new Array(12).fill(0);fr.forEach(f=>f.c.forEach((v,i)=>sum[i]+=v));
 return{segments:seg,key:estimateKey(sum),capo:suggestCapo(seg)};}
if(typeof module!=='undefined')module.exports={analyze};
