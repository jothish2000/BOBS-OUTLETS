(async function(){try{
 const outlet=new URLSearchParams(location.search).get('outlet');if(!outlet)throw Error('Outlet is required.');
 const [raw,master]=await Promise.all([M2.read(outlet),M2.read('COMPANY','RECIPE_MASTER','STANDARD_V1')]),s=M2.state(raw),recipes=master?.recipes||[];
 let sum=0,complete=true;
 for(const cat of CAT_ORDER)ITEM_DATA[cat].forEach((item,i)=>{if(!M2.selected(s,cat,i))return;
 const d=M2.draft(s,cat,i,item),c=M2.calculate(d,item,recipes),row=document.createElement('tr');
 if(c.missing.length)complete=false;else sum+=c.soldCost||0;
 [item.name,d.mode,d.sold,c.missing.length?'Incomplete':'₹'+c.final.toFixed(2),c.missing.length?'Incomplete':'₹'+(c.soldCost||0).toFixed(2),'₹'+(c.revenue||0).toFixed(2)].forEach(v=>{const td=document.createElement('td');td.textContent=v;row.append(td)});document.getElementById('rows').append(row);
 });document.getElementById('status').textContent='Outlet '+outlet+' · '+(complete?'Total sold COGS ₹'+sum.toFixed(2):'Costs incomplete — review recipe rates.');
}catch(e){document.getElementById('status').textContent=e.message}})();
