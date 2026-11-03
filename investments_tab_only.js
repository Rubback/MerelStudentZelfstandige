/* Mijn Studentenzaak - stap 1: alleen een stabiel tabblad Investeringen */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);

  function initInvestmentTab() {
    if ($('investments')) return;

    const nav = document.querySelector('.tabs');
    const main = document.querySelector('main');
    if (!nav || !main) return;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.dataset.page = 'investments';
    tab.innerHTML = '<b>▣</b>Investeringen';
    nav.insertBefore(tab, nav.lastElementChild);

    const section = document.createElement('section');
    section.id = 'investments';
    section.className = 'page';
    section.innerHTML = `
      <div class="card">
        <h2>Investeringen</h2>
        <div class="note">
          Hier bouwen we stap voor stap je investeringsregister op. In deze eerste versie wordt nog niets ingevoerd of berekend.
        </div>
        <button id="futureInvestmentButton" type="button" class="primary" style="margin-top:12px">
          + Investering toevoegen
        </button>
      </div>
      <div class="card">
        <h2>Mijn investeringen</h2>
        <div class="empty">Nog geen investeringen.</div>
      </div>`;
    main.appendChild(section);

    function activate(pageId, button) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
      const page = $(pageId);
      if (page) page.classList.add('active');
      if (button) button.classList.add('active');
      window.scrollTo(0, 0);
    }

    document.querySelectorAll('.tabs button[data-page]').forEach(button => {
      button.onclick = () => activate(button.dataset.page, button);
    });

    $('futureInvestmentButton').onclick = () => {
      alert('Stap 1 werkt. In de volgende stap koppelen we hier pas het eenvoudige investeringsformulier aan.');
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInvestmentTab);
  } else {
    initInvestmentTab();
  }
})();
