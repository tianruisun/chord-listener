const $=s=>document.querySelector(s);let rec=null,chunks=[];
const fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
async function run(ab){
 $('#status').textContent='Analysing…';$('#out').hidden=true;
 try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const buf=await ctx.decodeAudioData(ab);
  const n=buf.length,x=new Float32Array(n),ch=buf.numberOfChannels;
  for(let c=0;c<ch;c++){const d=buf.getChannelData(c);for(let i=0;i<n;i++)x[i]+=d[i]/ch;}
  await new Promise(r=>setTimeout(r,30));show(analyze(x,buf.sampleRate));
 }catch(e){$('#status').textContent='Could not read that audio: '+e.message;}}
function show(r){
 if(!r.segments.length){$('#status').textContent='No clear chords found. Try a louder, cleaner recording.';return;}
 $('#status').textContent='';$('#out').hidden=false;
 $('#key').textContent='Likely key: '+r.key;
 $('#capo').textContent=r.capo.capo?`Easier shapes: capo ${r.capo.capo}, then play ${r.capo.chords.join('  ')}`:`Chords used: ${r.capo.chords.join('  ')} (no capo needed)`;
 const box=$('#tl');box.innerHTML='';
 r.segments.forEach(s=>{const d=document.createElement('div');d.className='seg';const b=document.createElement('b');b.textContent=s.chord;
  const t=document.createElement('span');t.textContent=fmt(s.start);d.append(b,t);box.append(d);});}
$('#file').onchange=e=>{const f=e.target.files[0];if(f)f.arrayBuffer().then(run);};
$('#rec').onclick=async()=>{
 if(rec){rec.stop();return;}
 try{const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
  rec=new MediaRecorder(st);chunks=[];rec.ondataavailable=e=>chunks.push(e.data);
  rec.onstop=()=>{st.getTracks().forEach(t=>t.stop());$('#rec').textContent='Record from microphone';const b=new Blob(chunks);rec=null;b.arrayBuffer().then(run);};
  rec.start();$('#rec').textContent='Stop and analyse';
 }catch(e){$('#status').textContent='Microphone blocked: '+e.message;}};
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
