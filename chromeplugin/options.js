// Saves options to chrome.storage
function save_options() {
  var treatment_ineligible = "fade"; //document.getElementById('treatment').value;
  var enabled = document.getElementById('active').value;
  chrome.storage.sync.set({
    enabled: enabled,
    treatment_ineligible: treatment_ineligible
  }, () => {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Updating...';
    setTimeout(() => {
      status.textContent = '';
    }, 1000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    treatment_ineligible: 'fade',
    enabled: 'active',
    signed_in: 'false'
  }, (items) => {
    //document.getElementById('treatment').value = items.treatment_ineligible;
    document.getElementById('active').value = items.enabled;
    document.getElementById('login_status').style.display = (items.signed_in == "true" ? "none" : "");
  });
}

//listen for changes updated in content.js to the signed_in key to update "you must sign in" msg
chrome.storage.onChanged.addListener((changes, namespace) => {
  if(changes.hasOwnProperty("signed_in")){
    chrome.storage.sync.get(["signed_in"], (v) => { //show "you must sign in" if user is not signed in. this stored value is updated in content.js
      document.getElementById('login_status').style.display = (v == "true" ? "none" : "");
    });
  }
});

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);