const content_filter = (() => {
  const loop_tiles = () => {
    //in order: get user settings, ensure extension is set to "active", check that user is signed in, and loop through all product tiles applying fade or hide callback respectively
    chrome.storage.sync.get({treatment_ineligible: 'fade', enabled: 'active'}, settings => { //ensure the extension has been set to enabled. default is inactive.
      if(settings.enabled === "active"){
        let signed_in = !!document.querySelector(".user-info .header-logout-link") ? true : false; //check if user is logged in by looking for logout link
        if(signed_in){
            reset_treatments(); //do this in case a user hot-switched from in the extension options
            chrome.storage.sync.set({signed_in: 'true'}, () => {}); //set signed in to true (for options popup)
            
            let callback = settings.treatment_ineligible + "_ineligible"; //the callback options are "fade_ineligible" or "hide_ineligible". both defined below
            document.querySelectorAll(".grid-tile .product-tile").forEach(x => {
              let promo = Array.from(x.children).filter((y) => {return y.className == "product-promo";}).pop(); //get promo text from this tile
              if(!promo || (!!promo && !/(employee discount)/i.test(promo.innerText))){ //if promo text isn't blank and it includes the string "employee discount" (case INSENSITIVE)
                callbacks[callback](x); //fire callback using property name
              }
            });
        } else { 
          reset_treatments();
          chrome.storage.sync.set({signed_in: 'false'}, () => {}); //set signed in to false so that a message displays in the pop up reminding the user they must be logged in
        } //in case user no longer signed in
      } else { reset_treatments(); } //for hot-switching to disabling the extension
    });
  };
  
  const reset_treatments = () => {
    document.querySelectorAll("[class*=_discount-]").forEach(x => {
      callbacks.remove_treatments(x);
    });
  };
  
  //callback functionality in iife below
  const callbacks = (() => {
    //add a style block for the classes to be toggled. easier this way for hot-switching when options are changed.
    const style = document.createElement("style");
    document.head.appendChild(style);
    style.sheet.insertRule("._discount-fade {opacity: .1 !important}", 0);
    style.sheet.insertRule("._discount-hide {height: 20px !important; padding: 0px !important; overflow: hidden !important}", 0);
    style.sheet.insertRule("._discount-hide:before {content: 'hidden (ineligible)' !important; color: #cccccc; text-align: center  !important}", 0);
    
    return {
      fade_ineligible: (elem) => {
        elem.classList.add("_discount-fade");
      },
      hide_ineligible: (elem) => {
        elem.classList.add("_discount-hide");
      },
      remove_treatments: (elem) => {
        elem.classList.remove("_discount-fade");
        elem.classList.remove("_discount-hide");
      }
    };
  })();
  
  return {
    filter_eligible: loop_tiles
  };
})();

//simple listener from request.js. when page changes, get message, and run filter. the rest is taken from user options settings
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === 'content-change') {
    content_filter.filter_eligible();
  }
});

//listen for changes to extension options and rerun filtering, which will remove and all treatments accordingly
chrome.storage.onChanged.addListener((changes, namespace) => {
  content_filter.filter_eligible();
});