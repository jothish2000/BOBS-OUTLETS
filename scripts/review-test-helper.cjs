/* Existing regression scenarios explicitly confirm already-reviewed fixture inputs.
   New guided-review browser tests exercise the normal walkthrough and blind-click guard. */
module.exports=async function review(locator){
 const page=locator.page();
 const eligible=await locator.evaluate(n=>!!window.BOBS_REVIEW?.isReview(n));
 if(!eligible)return locator.check();
 if(await locator.isChecked())return;
 await locator.evaluate(n=>window.BOBS_REVIEW.request(n));
 const panel=page.locator('[data-review-ui=choices]');
 await panel.locator('[data-review-shortcut]').check();
 await panel.getByRole('button',{name:'Confirm these inputs and continue',exact:true}).click();
 if(!await locator.isChecked())throw Error('Existing review validator rejected confirmation');
};
