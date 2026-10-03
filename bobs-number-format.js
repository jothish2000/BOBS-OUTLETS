/* 111QS quantity display only. Never use formatted strings as calculation/storage inputs. */
(function(root){'use strict';
 const normalize=u=>String(u??'').trim().toLowerCase().replace(/\.$/,'');
 const three=new Set(['kg','kgs','kilogram','kilograms','kilogramme','kilogrammes','l','lt','lts','ltr','ltrs','liter','liters','litre','litres']);
 const whole=new Set(['g','gm','gms','gram','grams','gramme','grammes','piece','pieces','pc','pcs','dozen','dozens','dz','carton','cartons','ctn','ctns','unit','units','pack','packs','packet','packets','box','boxes','bag','bags','set','sets','batch','batches']);
 function quantity(value,unit){if(value===null||value===undefined||String(value).trim()==='')return '—';const n=Number(value);if(!Number.isFinite(n))return '—';const u=normalize(unit);return three.has(u)?n.toFixed(3):whole.has(u)?n.toFixed(0):String(n);}
 const api=Object.freeze({quantity,normalize});
 root.BOBS_NUMBERS=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
