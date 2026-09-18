/* Component-owned packing. Stored on the item or included side, never in recipe ingredients. */
(function(root){'use strict';
const materials=['Aluminium coated food box - small','Aluminium coated food box - large / rice pack','Idli container / tray','Food container - small','Food container - medium','Food container - large','Sambar pouch / cup - small','Sambar pouch / cup - medium','Chutney pouch / cup','Container lid','Butter paper / food sheet','Carry bag','Spoon / fork','Rubber band / sealing item','Other packing'];
const money=n=>'₹'+Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
function create(data,options){
 const root=document.createElement('section');root.className='packing-editor';root.packingData=data;
 function change(){options.changed()}
 function input(label,value,set,type='number'){
  const l=document.createElement('label');l.textContent=label;const e=document.createElement('input');e.type=type;e.value=value??'';
  if(type==='number'){e.min='0';e.step='any';e.required=true}
  e.oninput=()=>{set(e.value);change()};l.append(e);return l;
 }
 function build(){
  root.replaceChildren();const mode=M2.packing(data).mode;root.dataset.mode=mode;
  const heading=document.createElement('h4');heading.textContent='Packing for '+options.name;root.append(heading);
  const label=document.createElement('label');label.textContent='Packing choice';const choice=document.createElement('select');choice.required=true;
  for(const [value,text] of [['','Choose packing treatment…'],['required','Additional packing required'],['none','No extra packing required'],...(!options.common?[['included','Already included in supplier price']]:[])]){const o=document.createElement('option');o.value=value;o.textContent=text;choice.append(o)}
  choice.setAttribute('aria-label','Packing choice');choice.value=mode;if(options.main)choice.id='mainPackingChoice';choice.onchange=()=>{data.packingMode=choice.value;build();change()};label.append(choice);root.append(label);
  if(options.legacy){const note=document.createElement('p');note.className='notice';note.textContent='Existing packing has been retained here. It may already include side pouches. Review these rows before adding packing under condiments; assign each material once.';root.append(note)}
  if(options.main&&M2.norm(options.name)==='idli'){
   const preset=document.createElement('button');preset.type='button';preset.id='idliPackingPreset';preset.className='secondary';preset.textContent='Set up: 2 idlis share 1 aluminium box';
   preset.onclick=()=>{if(data.packaging?.length&&!confirm('Replace ALL packing currently listed under Idli with one aluminium box shared by two idlis? Put sambar/chutney pouches under their own condiment. Google data is unchanged until Save.'))return;data.packingMode='required';data.packingPer=2;data.packaging=[{name:'Aluminium coated food box - small',qty:1,unitCost:''}];build();change()};root.append(preset);
  }
  if(mode==='required'){
   const details=document.createElement('details');details.className='packing-settings';details.open=true;
   const summary=document.createElement('summary');summary.textContent='Materials, prices & sharing';details.append(summary);
   const per=input('Sales units sharing ONE packing set',data.packingPer??1,v=>data.packingPer=v);const perInput=per.querySelector('input');perInput.min='0.001';if(options.main)perInput.id='packingPer';details.append(per);
   const help=document.createElement('p');help.className='muted';help.textContent='Count '+options.salesUnit+' sold of the main product. Example: a side pouch shared by 2 idlis uses 2 here. A separate 200 ml sambar pack normally uses 1. Whole final packing sets are charged, even if partly filled.';details.append(help);
   const rows=document.createElement('div');rows.className='packing-rows';if(options.main)rows.id='packing';
   for(const row of data.packaging||[]){
    const box=document.createElement('div');box.className='packing-material fields';
    box.append(input('Empty container / packing material',row.name||row.label,v=>row.name=v,'text'),input('Number used in ONE packing set',row.qty,v=>row.qty=v),input('Price ₹ each',row.unitCost,v=>row.unitCost=v));
    const remove=document.createElement('button');remove.type='button';remove.className='secondary';remove.textContent='Remove packing material';remove.onclick=()=>{data.packaging=data.packaging.filter(x=>x!==row);build();change()};box.append(remove);rows.append(box);
   }
   details.append(rows);
   const toolbar=document.createElement('div');toolbar.className='toolbar';const material=document.createElement('select');material.setAttribute('aria-label','Packing material to add');
   for(const name of materials){const o=document.createElement('option');o.value=name;o.textContent=name;material.append(o)}
   material.value=options.common?'Carry bag':/sambar/i.test(options.name)?materials[6]:/chutney/i.test(options.name)?materials[8]:materials[0];
   const add=document.createElement('button');add.type='button';add.textContent='+ Add packing material';if(options.main)add.id='addPacking';add.onclick=()=>{data.packaging=data.packaging||[];data.packaging.push({name:material.value,qty:1,unitCost:''});build();change()};toolbar.append(material,add);details.append(toolbar);root.append(details);
  }else if(mode==='none'||mode==='included'){
   const note=document.createElement('p');note.className='muted';note.textContent=(mode==='included'?'No extra charge: the supplier price already covers this packing.':'No extra packing charge for this component.')+(data.packaging?.length?' Saved packing rows are retained and can be re-enabled.':'');root.append(note);
  }
  const total=document.createElement('output');total.className='packing-summary notice';if(options.main)total.id='packingSummary';total.setAttribute('aria-live','polite');root.append(total);
  if(options.main){const note=document.createElement('p');note.className='muted';note.textContent='Enter mixed-product carry bags once in Overall COGS shared outlet packing. Put each side pouch under that side; never enter its food price as packaging.';root.append(note)}
 }
 build();return root;
}
function update(element,cost,sold){
 const p=cost.packingCost,output=element.querySelector('.packing-summary');
 output.textContent=p.missing.length?p.missing.join('. '):p.mode==='none'||p.mode==='included'?'Additional packing: ₹0.00.':money(p.perPack)+' per packing set ÷ '+p.per+' sales units = '+money(p.perItem)+' standard packing per sales unit'+(sold===null?'':'. '+sold+' sold → '+p.parcels+' whole sets → '+money(p.total)+'; allocated per unit '+money(p.allocated)+'.');
}
root.M2PackingUI={create,update};
})(window);
