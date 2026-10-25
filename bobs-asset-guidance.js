/* Capacity and supplier evidence belong to the same ASSET_MASTER machine identity. */
(function(root){'use strict';
const prices=[
 {name:'RSR gas steamer · 120 idlis, 6 trays',match:/idli|idly|steam/i,amount:26000,url:'https://www.rsrengineering.in/idli-steamer.html'},
 {name:'Santhosh commercial tilting wet grinder · 5 L drum',match:/wet.*grind|grind.*wet/i,amount:26000,url:'https://www.santhoshtiltingwetgrinder.com/wet-grinder.html'},
 {name:'Srihari Maharani mixer · 2 / 3 L jars, 1700 W',match:/mixer|blender/i,amount:11000,url:'https://www.sriharikitchenequipments.in/kitchen-equipment.html'}
];
const el=(tag,text)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;return x};
function render(row,asset,changed){
 const box=el('details'),title=el('summary','Choose capacity and review market references');box.append(title);const facts=asset.capacityFacts||{status:'unknown'};
 const fields={};function field(key,label,value,options){const l=el('label',label),x=el(options?'select':'input');x.dataset.capacityField=key;if(options)for(const [value,text]of options){const o=el('option',text);o.value=value;x.append(o)}x.value=value??'';l.append(x);box.append(l);fields[key]=x;return x}
 field('status','Capacity status',facts.status,[['unknown','Not known yet'],['estimate','Reference estimate — needs checking'],['confirmed','Confirmed against my machine / trial']]);
 field('value','Required usable capacity per machine / cycle',facts.value).type='number';fields.value.min='0';fields.value.step='any';
 field('unit','Capacity unit',facts.unit);field('basis','Material / measurement basis',facts.basis);field('evidence','Specification / trial evidence',facts.evidence);field('referenceUrl','Capacity source URL',facts.referenceUrl);
 box.append(el('p','Small-hotel examples are starting points. Nominal drum or vessel litres are not finished food output. Review recipe-specific cycles and deadlines in Production Planning.'));
 for(const ref of root.BOBS_EQUIPMENT_REFERENCES||[]){const d=el('details');d.append(el('summary',ref.name),el('p',ref.note));const source=el('a','View manufacturer capacity reference');source.href=ref.url;source.target='_blank';source.rel='noopener';d.append(source);for(const choice of ref.choices){const b=el('button','Use example: '+choice.label);b.type='button';b.onclick=()=>{fields.status.value='estimate';fields.value.value=choice.capacity??choice.nominal;fields.unit.value=ref.unit;fields.basis.value=choice.material?choice.material+' per separate cycle':choice.nominal?'Nominal vessel / jar volume; usable output pending':choice.label;fields.evidence.value=ref.source;fields.referenceUrl.value=choice.url||ref.url;changed()};d.append(b)}box.append(d)}
 const price=el('div');price.append(el('h4','Indicative supplier prices'),el('p','Public listings checked 25 October 2026; estimates, not quotations. Verify the exact model, tax, delivery and installation. Other equipment requires its own supplier reference.'));
 for(const ref of prices.filter(p=>p.match.test(asset.name||''))){const a=el('a',ref.name+' — ₹'+ref.amount.toLocaleString('en-IN'));a.href=ref.url;a.target='_blank';a.rel='noopener';price.append(a);const b=el('button','Use this price as an estimate');b.type='button';b.onclick=()=>{row.querySelector('[data-field="unitCost"]').value=ref.amount;row.querySelector('[data-field="costConfirmed"]').checked=false;asset.priceReference={name:ref.name,url:ref.url,amount:ref.amount,checkedAt:'2026-10-25',status:'estimate'};changed()};price.append(b)}
 const saved=asset.priceReference;if(saved){price.append(el('p','Selected reference: '+saved.name+'; '+saved.checkedAt+'; review required.'))}box.append(price);row.querySelector('h3').after(box);
}
function read(row,asset){const fields=row.querySelectorAll('[data-capacity-field]');if(!fields.length)return;const next=Object.fromEntries([...fields].map(x=>[x.dataset.capacityField,x.value]));if(!asset.capacityFacts&&next.status==='unknown'&&Object.entries(next).every(([k,v])=>k==='status'||!v))return;asset.capacityFacts=next;const f=asset.capacityFacts;
 asset.capacityNote=f.status==='unknown'?'Capacity pending — measure before production planning':(f.status==='estimate'?'Reference estimate':'Confirmed measurement')+': '+f.value+' '+f.unit+'; '+f.basis+'; '+f.evidence;
}
function validate(asset){const f=asset.capacityFacts;if(!f)return;
 if(f.status!=='unknown'&&(!(Number.isFinite(+f.value)&&+f.value>0)||!f.unit.trim()||!f.basis.trim()))throw Error(asset.name+': enter positive capacity, unit and measurement basis.');
 if(f.status==='confirmed'&&!f.evidence.trim())throw Error(asset.name+': describe the specification or trial confirming capacity.');
 asset.capacityNote=f.status==='unknown'?'Capacity pending — measure before production planning':(f.status==='estimate'?'Reference estimate':'Confirmed measurement')+': '+f.value+' '+f.unit+'; '+f.basis+'; '+f.evidence;
}
root.BOBS_ASSET_GUIDANCE={render,read,validate};
})(window);
