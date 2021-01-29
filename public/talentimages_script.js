
var custId = sessionStorage.getItem('custId');
console.log(custId);
if(custId == null){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var custId = urlParams.get('customerId');
    console.log("new custId assigned = " + custId);
}


$( "#billing_portal_link" ).on( "click", function() {
    var input_data = JSON.stringify({
        custId: custId,
        dest: 'talentimages.html'
    });
    console.log(input_data);
    return fetch('/api/v1/stripe/accessPortal', {
        method: 'post',
        headers: {
        'Content-Type': 'application/json',
        },
        body: input_data
    })
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        window.location.replace(response.redirect_url);
    });
  });