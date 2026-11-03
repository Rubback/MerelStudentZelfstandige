/* Mijn Studentenzaak v5 - synchroniseert jaarlijkse afschrijvingen met hoofddashboard */
(() => {
'use strict';
const INVESTMENT_KEY='studentBizInvestmentsV4';
const ADMIN_KEYS=['studentBiz2026v3','studentBiz2026v1'];
const EUR=n=>new Intl.NumberFormat('nl-BE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
function id(x){return document.getElementById(x)}
function readJSON(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch(e){return fallback}}
function adminData(){for(const k of ADMIN_KEYS){const d=readJSON(k,null);if(d&&Array.isArray(d.entries))return d}return {entries:[],settings:{year:2026}}}
function investments(){const a=readJSON(INVESTMENT_KEY,[]);return Array.isArray(a)?a:[]}
function year(){const input=id('year');const d=adminData();return Number(input?.value)||Number(d.settings?.year)||new Date().getFullYear()}
function depForYear(x,y){const start=Number(x.startYear)||new Date(x.date).getFullYear();const years=Math.max(1,Number(x.years)||1);if(y<start||y>=start+years)return 0;const base=Math.max(0,(Number(x.amount)||0)-(Number(x.residual)||0))*Math.max(0,Math.min(100,Number(x.professional)||0))/100;return base/years}
function figures(){const d=adminData(),y=year();let revenue=0,ordinary=0;for(const x of d.entries){if(x.type==='income')revenue+=Number(x.amount)||0;else if(x.type==='expense')ordinary+=Number(x.deductible)||0}const depreciation=investments().reduce((s,x)=>s+depForYear(x,y),0);return {y,revenue,ordinary,depreciation,total:ordinary+depreciation,profit:revenue-ordinary-depreciation}}
function ensureBreakdown(){if(id('costBreakdown')||!id('kExpenses'))return;const box=document.createElement('div');box.id='costBreakdown';box.className='card wide';box.innerHTML='<h2>Kostenopbouw huidig boekjaar</h2><div class="item"><span>Gewone aftrekbare kosten</span><b id="ordinaryCost">€ 0</b></div><div class="item"><span>Afschrijvingen investeringen</span><b id="depreciationCost">€ 0</b></div><div class="item"><strong>Totale kosten in resultaat</strong><strong id="totalCost">€ 0</strong></div><div class="note"><b>Geen dubbele boeking:</b> de volledige aanschafwaarde van een investering telt hier niet als gewone kost. Alleen de berekende jaarlijkse afschrijving wordt toegevoegd.</div>';
 const wide=id('kProfit')?.closest('.wide'); if(wide)wide.insertAdjacentElement('afterend',box)
}
function render(){const rev=id('kRevenue'),exp=id('kExpenses'),profit=id('kProfit');if(!rev||!exp||!profit)return;ensureBreakdown();const f=figures();rev.textContent=EUR(f.revenue);exp.textContent=EUR(f.total);profit.textContent=EUR(f.profit);if(id('ordinaryCost'))id('ordinaryCost').textContent=EUR(f.ordinary);if(id('depreciationCost'))id('depreciationCost').textContent=EUR(f.depreciation);if(id('totalCost'))id('totalCost').textContent=EUR(f.total);
 const bar=id('profitBar');if(bar)bar.style.width=Math.min(100,Math.max(0,f.profit/17374.08*100))+'%';const status=id('socialStatus'),alert=id('alertBox');if(status)status.textContent=f.profit<8687.04?'Onder grens nulbijdrage':f.profit<17374.08?'Zone verminderde bijdragen':'Grens hoofdberoep bereikt/overschreden';if(alert){alert.className='alert '+(f.profit<8687.04?'ok':f.profit<17374.08?'':'danger');alert.textContent=f.profit<8687.04?'Nog '+EUR(8687.04-f.profit)+' onder €8.687,04.':f.profit<17374.08?'Boven €8.687,04; nog '+EUR(17374.08-f.profit)+' tot €17.374,08.':'Je zit '+EUR(f.profit-17374.08)+' boven €17.374,08.'}
 const inv=id('invCurrentDep');if(inv)inv.textContent=EUR(f.depreciation)
}
let timer;function schedule(){clearTimeout(timer);timer=setTimeout(render,60)}
function init(){render();window.addEventListener('focus',schedule);window.addEventListener('storage',schedule);document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
 const target=document.body;const obs=new MutationObserver(m=>{if(m.some(x=>x.target?.id==='investmentList'||x.target?.id==='allTransactions'||x.target?.id==='recent'))schedule()});obs.observe(target,{subtree:true,childList:true,characterData:false});
 setInterval(render,1500)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
