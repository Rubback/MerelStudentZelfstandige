/* Mijn Studentenzaak - categorievoorstellen v3 */
(() => {
  const proposals = {
    'Software & abonnementen': { pct: 100, note: 'Voorstel 100% bij uitsluitend beroepsmatig gebruik. Splits privégebruik af.' },
    'Telefoon & internet': { pct: 30, note: 'Voorstel 30% als startpunt. Pas aan volgens je werkelijk en verdedigbaar beroepsgebruik.' },
    'Kantoorbenodigdheden': { pct: 100, note: 'Voorstel 100% wanneer de aankoop uitsluitend voor je activiteit dient.' },
    'Marketing & reclame': { pct: 100, note: 'Voorstel 100% bij aantoonbare zakelijke reclame. Geschenken, sponsoring en privégebruik apart beoordelen.' },
    'Verplaatsingen': { pct: 100, note: 'Voorstel 100% alleen voor een zuiver beroepsmatige verplaatsing. Auto-, woon-werk- en gemengde kosten kunnen bijkomende beperkingen hebben.' },
    'Opleiding': { pct: 100, note: 'Voorstel 100% wanneer de opleiding rechtstreeks verband houdt met je huidige activiteit.' },
    'Professionele diensten': { pct: 100, note: 'Voorstel 100% voor zuiver beroepsmatige boekhouding, juridisch advies of andere expertise.' },
    'Bankkosten': { pct: 100, note: 'Voorstel 100% voor kosten van een zakelijke rekening of beroepsmatige transactie.' },
    'Materiaal & aankopen': { pct: 100, note: 'Voorstel 100% bij uitsluitend beroepsgebruik. Duurzame aankopen kunnen over meerdere jaren moeten worden afgeschreven.' },
    'Huur & werkruimte': { pct: 15, note: 'Voorstel 15% als voorzichtig startpunt voor een thuiswerkruimte. Gebruik uiteindelijk een verdedigbare verhouding van beroepsruimte en gebruik.' },
    'Verzekeringen': { pct: 100, note: 'Voorstel 100% voor een zuiver beroepsmatige polis. Splits gemengde verzekeringen.' },
    'Maaltijden & representatie': { pct: 69, note: 'Voorstel 69% voor een aantoonbaar zakelijke restaurantkost. Privémaaltijden blijven 0%.' },
    'Kleding & styling': { pct: 25, note: 'Voorstel 25% volgens jouw werkmethode in Dexxter. Gewone privé-draagbare kleding is fiscaal niet automatisch aftrekbaar; controleer de beroepslink.' },
    'Andere beroepskosten': { pct: 0, note: 'Geen veilig standaardpercentage. Beoordeel de kost individueel en pas het percentage handmatig aan.' }
  };

  function ensureUI() {
    const category = document.getElementById('entryCategory');
    const percent = document.getElementById('entryPercent');
    if (!category || !percent) return;

    if (![...category.options].some(o => o.value === 'Kleding & styling')) {
      const opt = document.createElement('option');
      opt.value = opt.textContent = 'Kleding & styling';
      const other = [...category.options].find(o => o.value === 'Andere beroepskosten');
      category.insertBefore(opt, other || null);
    }

    let card = document.getElementById('categoryProposal');
    if (!card) {
      card = document.createElement('div');
      card.id = 'categoryProposal';
      card.className = 'note';
      card.style.marginTop = '8px';
      percent.insertAdjacentElement('afterend', card);
    }

    function applyProposal(force = true) {
      const p = proposals[category.value] || proposals['Andere beroepskosten'];
      if (force) percent.value = p.pct;
      card.innerHTML = `<b>Automatisch voorstel: ${p.pct}%</b><br>${p.note}<br><span style="display:block;margin-top:5px"><b>Disclaimer:</b> dit is een praktisch invulvoorstel, geen bindende fiscale beoordeling. Controleer steeds beroepsdoel, bewijsstuk, privégebruik en eventuele wettelijke beperking.</span>`;
    }

    if (!category.dataset.proposalLinked) {
      category.addEventListener('change', () => applyProposal(true));
      category.dataset.proposalLinked = '1';
    }

    const oldOpen = window.openForm;
    if (typeof oldOpen === 'function' && !window.__proposalOpenWrapped) {
      window.openForm = function(type) {
        oldOpen(type);
        if (type === 'expense') setTimeout(() => applyProposal(true), 0);
      };
      window.__proposalOpenWrapped = true;
    }

    applyProposal(false);

    const limitsTable = document.querySelector('#limits .card:nth-of-type(2) .limits');
    if (limitsTable && !document.getElementById('clothingLimitRow')) {
      const row = limitsTable.insertRow(-1); row.id = 'clothingLimitRow';
      row.innerHTML = '<td>Kleding & styling</td><td>25% voorstel; gewone privé-draagbare kleding niet automatisch aftrekbaar</td>';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureUI);
  else ensureUI();
})();
