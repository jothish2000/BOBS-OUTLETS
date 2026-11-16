(async function(){
  'use strict';
  const el = id => document.getElementById(id);
  const money = amount => amount === null ? 'Pending' : '₹' + amount.toFixed(2);
  function addCells(row, values) {
    for (const text of values) {
      const td = document.createElement('td');
      td.textContent = text;
      row.append(td);
    }
  }
  try {
    const outlet = new URLSearchParams(location.search).get('outlet');
    if (!outlet) throw Error('Select an outlet to see its costs.');
    const date = BOBS_COST_FLOW.today();
    const [raw, master] = await Promise.all([M2.read(outlet), BOBS_OPERATIONAL_RECIPES.load()]);
    const state = M2.state(raw);
    M2.installSides(master.recipes, state);
    el('back').href = 'method2.html?outlet=' + encodeURIComponent(outlet);
    el('recovery').href = 'method2-recovery.html?outlet=' + encodeURIComponent(outlet);

    function render(s) {
      el('rows').replaceChildren();
      el('usageRows').replaceChildren();
      const usage = new Map();
      const seenSides = new Set();
      let sales = 0, dayCost = 0, packing = 0, selectedCount = 0;
      let salesComplete = true, costsComplete = true, packingComplete = true;
      for (const cat of CAT_ORDER) ITEM_DATA[cat].forEach((item, i) => {
        if (!M2.selected(s,cat,i)) return;
        if (cat === M2.SIDES) {
          const sideKey = M2.purchaseKey(item.recipeName || item.name);
          if (seenSides.has(sideKey)) return;
          seenSides.add(sideKey);
        }
        selectedCount++;
        const key = M2.keys(cat,i).k;
        const d = M2.draft(s,cat,i,item);
        const editor = s.itemEditors[key];
        const commercial = s.commercial[key];
        const savedDate = editor?.businessDate || (editor?.savedAt && new Date(editor.savedAt).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}));
        const confirmed = savedDate === date && d.soldConfirmed && M2.number(editor.sold) !== null;
        const sold = confirmed ? M2.number(editor.sold) : null;
        const price = confirmed ? M2.number(editor.price) : null;
        const revenue = sold === null || price === null ? null : sold * price;
        const matching = confirmed && commercial && M2.number(commercial.soldQuantity) === sold &&
          (!commercial.costEvidence || commercial.costEvidence.date === date);
        const amount = field => matching ? M2.number(commercial[field]) : null;
        const direct = amount('actualDayCost'), itemPacking = amount('totalPackingCost');
        if (revenue === null) salesComplete = false; else sales += revenue;
        if (direct === null) costsComplete = false; else dayCost += direct;
        if (itemPacking === null) packingComplete = false; else packing += itemPacking;
        const row = document.createElement('tr');
        addCells(row, [item.name,d.mode,sold === null ? 'Pending' : BOBS_NUMBERS.quantity(sold,d.unit),
          money(amount('finalCogs')),money(amount('totalSoldCogs')),money(revenue)]);
        const actions = document.createElement('td');
        actions.append(BOBS_COST_DETAIL.link('production',{outlet,cat,i,date}));
        row.append(actions);
        el('rows').append(row);
        if (!confirmed) return;
        for (const u of M2.calculate(d,item,master.recipes).usage) {
          if (u.quantity === null) continue;
          const id = M2.norm(u.name)+'|'+u.source+'|'+u.unit;
          const entry = usage.get(id) || {name:u.name,source:u.source,unit:u.unit,included:0,separate:0};
          entry[u.role] += u.quantity;
          usage.set(id,entry);
        }
      });
      const shared = M2.orderPackingCost(s);
      const sharedCurrent = !s.orderPacking?.enabled ||
        (s.orderPacking.businessDate === date && !shared.missing.length);
      const recordedCost = selectedCount && costsComplete && sharedCurrent ? dayCost+shared.total : null;
      const recordedSales = selectedCount && salesComplete ? sales : null;
      el('status').textContent = 'Outlet '+outlet+' · '+date+(selectedCount ? '' : ' · No selected items');
      el('daySales').textContent = money(recordedSales);
      el('dayCost').textContent = money(recordedCost);
      el('dayProfit').textContent = money(recordedCost === null || recordedSales === null ? null : recordedSales-recordedCost);
      el('packingSummary').textContent = 'Packing within items: '+money(selectedCount && packingComplete ? packing : null)+
        ' · Shared outlet packing: '+money(sharedCurrent ? shared.total : null);
      for (const u of usage.values()) {
        const row = document.createElement('tr');
        const qty = v => BOBS_NUMBERS.quantity(v,u.unit)+' '+u.unit;
        addCells(row,[u.name,u.source,qty(u.included),qty(u.separate),qty(u.included+u.separate)]);
        el('usageRows').append(row);
      }
    }
    render(state);
    M2OrderUI.init(outlet,state,render);
    el('sharedControls').disabled = false;
  } catch (error) { el('status').textContent = error.message; }
})();
