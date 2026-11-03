/* Mijn Studentenzaak v6 - eenvoudige investeringsmodule, volledig binnen tab Investeringen */
(() => {
'use strict';
const KEY='studentBizInvestmentsV4';
let investments=[];
let currentImage='';
const $=id=>document.getElementById(id);
const EUR=n=>new Intl.NumberFormat('nl-BE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');investments=Array.isArray(x)?x:[]}catch(e){investments=[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(investments));render();window.dispatchEvent(new Event('storage'));}catch(e){alert('Opslaan mislukt. Maak een back-up en controleer de browseropslag.')}}
function currentYear(){return Number($('year')?.value)||2026}
function base(x){return Math.max(0,(+x.amount||0)-(+x.residual||0))*Math.max(0,Math.min(100,+x.professional||0))/100}
function annual(x){return base(x)/Math.max(1,+x.years||1)}
function dep(x,y){const s=+x.startYear||new Date(x.date).getFullYear(),n=Math.max(1,+x.years||1);return y>=s&&y<s+n?annual(x):0}
function book(x,y){const s=+x.startYear||new Date(x.date).getFullYear(),n=Math.max(1,+x.years||1),elapsed=Math.max(0,Math.min(n,y-s+1));return Math.max(0,base(x)-annual(x)*elapsed)}
function styles(){if($('invV6Styles'))return;const s=document.createElement('style');s.id='invV6Styles';s.textContent=`#investmentFormPanel{display:none}#investmentFormPanel.open{display:block}.inv-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.inv-schedule{width:100%;border-collapse:collapse;margin-top:10px}.inv-schedule th,.inv-schedule td{padding:7px;border-bottom:1px solid #dbe4ef;text-align:right;font-size:12px}.inv-schedule th:first-child,.inv-schedule td:first-child{text-align:left}.inv-photo{width:56px;height:56px;object-fit:cover;border-radius:9px;border:1px solid #dbe4ef}.inv-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}.inv-form-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}@media(max-width:390px){.inv-form-actions{grid-template-columns:1fr}}`;document.head.appendChild(s)}
function removeOld(){
  document.querySelectorAll('#investmentModal').forEach(x=>x.remove());
  document.querySelectorAll('#investments').forEach(x=>x.remove());
  document.querySelectorAll('.tabs button[data-page="investments"]').forEach(x=>x.remove());
}
function inject(){
  removeOld();
  const nav=document.querySelector('.tabs'),main=document.querySelector('main');if(!nav||!main)return;
  const tab=document.createElement('button');tab.dataset.page='investments';tab.innerHTML='<b>▣</b>Investeringen';nav.insertBefore(tab,nav.lastElementChild);
  const sec=document.createElement('section');sec.id='investments';sec.className='page';sec.innerHTML=`
  <div class="card"><h2>Investeringen & afschrijvingen</h2><div class="note"><b>Indicatief.</b> Alleen de jaarlijkse afschrijving telt mee in het resultaat, niet de volledige aankoopwaarde.</div><button id="toggleInvestmentForm" type="button" class="primary" style="margin-top:12px">+ Investering toevoegen</button></div>
  <div id="investmentFormPanel" class="card"><div class="modalhead"><h2>Nieuwe investering</h2><button id="cancelInvestmentTop" type="button" class="close">×</button></div><form id="investmentForm">
  <div class="row"><div><label>Aankoopdatum</label><input id="invDate" type="date" required></div><div><label>Bedrag incl. btw</label><input id="invAmount" type="number" inputmode="decimal" min="0" step="0.01" required></div></div>
  <label>Actief</label><input id="invName" placeholder="bv. iPhone, laptop, camera" required><label>Leverancier</label><input id="invSupplier" required>
  <div class="row"><div><label>Categorie</label><select id="invCategory"><option>Smartphone & telefoon</option><option>Computer & tablet</option><option>Camera & audiovisueel</option><option>Kantoormeubilair</option><option>Voertuig & mobiliteit</option><option>Machines & apparatuur</option><option>Andere investering</option></select></div><div><label>Beroepspercentage</label><input id="invProfessional" type="number" min="0" max="100" value="75" required></div></div>
  <div class="row"><div><label>Afschrijvingstermijn (jaar)</label><input id="invYears" type="number" min="1" max="30" value="3" required></div><div><label>Startjaar</label><input id="invStartYear" type="number" min="2000" max="2100" required></div></div>
  <label>Restwaarde</label><input id="invResidual" type="number" min="0" step="0.01" value="0"><label>Omschrijving / beroepsdoel</label><input id="invPurpose" placeholder="bv. contentopnames en klantcontact" required>
  <div class="receiptbox"><b>📷 Aankoopfactuur of bonnetje</b><div class="small">Maak een foto of kies een bestaand beeld. De foto blijft lokaal op het toestel.</div><input id="invPhoto" type="file" accept="image/*" capture="environment"><img id="invPreview" class="hidden" alt="Bewijsstuk"><div id="invStatus" class="status">Kies optioneel een foto.</div></div>
  <div class="inv-form-actions"><button id="cancelInvestment" type="button" class="secondary">Annuleren</button><button type="submit" class="primary">Investering opslaan</button></div></form></div>
  <div class="grid"><div class="card kpi"><span>Aanschafwaarde</span><strong id="invTotal">€ 0</strong></div><div class="card kpi"><span>Afschrijving huidig jaar</span><strong id="invCurrentDep">€ 0</strong></div><div class="card kpi wide"><span>Resterende boekwaarde beroepsdeel</span><strong id="invBookValue">€ 0</strong></div></div>
  <div class="card"><h2>Investeringsregister</h2><div id="investmentList"></div></div>`;
  main.appendChild(sec);styles();wireNav();wire();render();
}
function wireNav(){document.querySelectorAll('[data-page]').forEach(b=>b.onclick=function(){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));$(this.dataset.page)?.classList.add('active');this.classList.add('active');scrollTo(0,0)})}
function resetForm(){$('invDate').value=new Date().toISOString().slice(0,10);$('invStartYear').value=currentYear();$('invAmount').value='';$('invName').value='';$('invSupplier').value='';$('invCategory').value='Smartphone & telefoon';$('invProfessional').value='75';$('invYears').value='3';$('invResidual').value='0';$('invPurpose').value='';clearPhoto()}
function openForm(){resetForm();$('investmentFormPanel').classList.add('open');$('toggleInvestmentForm').textContent='− Formulier sluiten';$('investmentFormPanel').scrollIntoView({behavior:'smooth',block:'start'})}
function closeForm(){$('investmentFormPanel').classList.remove('open');$('toggleInvestmentForm').textContent='+ Investering toevoegen'}
function wire(){
 $('toggleInvestmentForm').onclick=()=>{$('investmentFormPanel').classList.contains('open')?closeForm():openForm()};
 $('cancelInvestment').onclick=closeForm;$('cancelInvestmentTop').onclick=closeForm;
 $('invCategory').onchange=function(){const map={'Smartphone & telefoon':[75,3],'Computer & tablet':[75,3],'Camera & audiovisueel':[75,3],'Kantoormeubilair':[100,10],'Voertuig & mobiliteit':[50,5],'Machines & apparatuur':[100,5],'Andere investering':[0,3]},v=map[this.value];$('invProfessional').value=v[0];$('invYears').value=v[1]};
 $('investmentForm').onsubmit=submit;$('invPhoto').onchange=photo;
}
function submit(e){e.preventDefault();const amount=+$('invAmount').value,residual=+$('invResidual').value,years=+$('invYears').value,professional=+$('invProfessional').value;if(!(amount>0)||residual<0||residual>=amount||years<1||professional<0||professional>100){alert('Controleer bedrag, restwaarde, termijn en beroepspercentage.');return}investments.push({id:Date.now(),date:$('invDate').value,name:$('invName').value.trim(),supplier:$('invSupplier').value.trim(),category:$('invCategory').value,amount,residual,years,professional,startYear:+$('invStartYear').value,purpose:$('invPurpose').value.trim(),image:currentImage,method:'lineair'});save();closeForm()}
async function photo(){const f=this.files?.[0];if(!f)return;$('invStatus').textContent='Foto voorbereiden…';try{currentImage=await compress(f);$('invPreview').src=currentImage;$('invPreview').classList.remove('hidden');$('invStatus').textContent='Foto opgeslagen bij de investering.'}catch(e){$('invStatus').textContent='Foto kon niet worden geladen.'}}
function clearPhoto(){currentImage='';if($('invPhoto'))$('invPhoto').value='';if($('invPreview')){$('invPreview').src='';$('invPreview').classList.add('hidden')}if($('invStatus'))$('invStatus').textContent='Kies optioneel een foto.'}
function compress(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,1400/im.width),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.76))};im.onerror=rej;im.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
function schedule(x){let rows='';for(let i=0;i<+x.years;i++){const y=+x.startYear+i;rows+=`<tr><td>${y}</td><td>${EUR(annual(x))}</td><td>${EUR(book(x,y))}</td></tr>`}return `<table class="inv-schedule"><tr><th>Jaar</th><th>Afschrijving</th><th>Boekwaarde</th></tr>${rows}</table>`}
function render(){if(!$('invTotal'))return;const y=currentYear();$('invTotal').textContent=EUR(investments.reduce((s,x)=>s+(+x.amount||0),0));$('invCurrentDep').textContent=EUR(investments.reduce((s,x)=>s+dep(x,y),0));$('invBookValue').textContent=EUR(investments.reduce((s,x)=>s+book(x,y),0));$('investmentList').innerHTML=investments.length?investments.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<div class="item" style="display:block"><div class="inv-head"><div>${x.image?`<img class="inv-photo" src="${x.image}" alt="Bewijsstuk">`:''}<strong>${esc(x.name)}</strong><span class="pill">${esc(x.category)}</span><div class="small">${esc(x.date)} · ${esc(x.supplier)} · ${x.professional}% beroepsmatig · ${x.years} jaar lineair</div><div class="small">${esc(x.purpose)}</div></div><div class="amount">${EUR(x.amount)}</div></div>${schedule(x)}<div class="inv-actions"><button type="button" class="secondary inv-delete" data-id="${x.id}">Verwijder</button></div></div>`).join(''):'<div class="empty">Nog geen investeringen.</div>';document.querySelectorAll('.inv-delete').forEach(b=>b.onclick=function(){if(confirm('Investering verwijderen?')){investments=investments.filter(x=>x.id!==+this.dataset.id);save()}})}
load();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
