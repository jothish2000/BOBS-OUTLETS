// Keeping view links separate from editing actions preserves the caller's input draft.
(function(root){
 'use strict';
 const labels={production:'Daily production cost',ingredients:'Ingredient usage and cost',sides:'Accompaniment costs',packing:'Packing',utilities:'Fuel and utilities',labour:'Labour allocation',expenses:'Fixed expenses and overheads',assets:'Assets and depreciation'};
 function link(section,context){
  const url=new URL('daily-cost-details.html',location.href);
  for(const key of ['outlet','cat','i','date'])url.searchParams.set(key,context[key]);
  url.searchParams.set('section',section);
  url.searchParams.set('returnTo',location.href);
  const a=document.createElement('a');
  a.href=url.href;
  a.target='_blank';
  a.dataset.bobsWindow='auxiliary';
  a.textContent='View '+labels[section].toLowerCase();
  return a;
 }
 function links(host,context){
  if(!host||host.children.length)return;
  const list=document.createElement('ul');
  for(const section of Object.keys(labels)){
   const li=document.createElement('li');
   li.append(link(section,context));
   list.append(li);
  }
  const details=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent='View saved cost breakdowns';
  details.append(summary,list);
  host.append(link('production',context),details);
 }
 root.BOBS_COST_DETAIL={labels,link,links};
})(window);
