var card = null;
var stripe = null;
initStripe();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const custId = urlParams.get('customerId');


getAllPrices();

let signupForm = document.getElementById('payment-form');
console.log(signupForm);
if(signupForm){
    console.log("form found");
    signupForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        $('.errMsg').remove();
        if ($('input[name="priceId"]:checked').val()) {
            createToken();
        }
        else {
            $('#select_plan').append('<p class="errMsg" style="color: red">Please select a subscription</p>')
        }
   
      });
}

function createToken() {
    stripe.createToken(card).then(function (result) {
        if (result.error) {
            // Inform the user if there was an error
            var errorElement = document.getElementById('card-errors');
            errorElement.textContent = result.error.message;
        } else {
            // Send the token to your server
            stripeTokenHandler(result.token);
        }
    });
}

function stripeTokenHandler(token){
    // Insert the token ID into the form so it gets submitted to the server
    
    console.log($('#payment-form').serialize());
    
    var purchaseData = JSON.stringify({
        CardToken: token.id,
        CustomerId: custId,
        PriceId: $('input[name="priceId"]:checked').val()
    });
    console.log(purchaseData);
    return fetch('/api/v1/stripe/purchasePlan', {
    method: 'post',
    headers: {
        'Content-Type': 'application/json'
    },
    body: purchaseData
    })
    .then((response) => {
        console.log(response.status);
        if(response.status){
            window.location.href = '/talentimages.html?customerId=' + custId;
        }
    });
}


function initStripeElements(publishableKey) {
    stripe = Stripe(publishableKey);

    var elements = stripe.elements();
    var style = {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        },
        empty: {
            iconColor: '#fa755a',
            color: '#fa755a'
        }
    };
    card = elements.create('card', {
        hidePostalCode: true,
        style: style
    });
    // Add an instance of the card UI component into the `card-element` <div>
    card.mount('#card-element');

}

function initStripe() {
    return fetch('/api/v1/stripe/getPKey', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        // Set up Stripe Elements
        initStripeElements(response.publishableKey);
      });
}


function getAllPrices() {
    return fetch('/api/v1/stripe/getAllPrices', {
        method: 'get',
        headers: {
        'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        var prices_list = response.outputList;
        console.log(prices_list);
        for (var x = 0; x < prices_list.length; x++) {
            console.log(prices_list[x]);
            var i = x + 1;
            var label = '(SGD$' + prices_list[x].amt + '/' + prices_list[x].paymentInterval + ') ' + prices_list[x].product_name;
            var radio_row = `
                <input type="radio" id="price` + i + `" name="priceId" value="` + prices_list[x].price_id + `">
                <label for="price` + i + `">` + label + `</label><br>
            `;
            document.getElementById("select_plan").innerHTML += radio_row;
            
        }
    })
        
}

