let signupForm = document.getElementById('customer_register');
console.log(signupForm);
if(signupForm){
    console.log("form found");
    signupForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        // Create customer
        registerCust().then((result) => {
          console.log(result);
          customer = result.customer;
          window.location.href = '/subscription.html?customerId=' + customer.id;
        });
      });
}


function registerCust(){
    var cust_email = document.querySelector('#email').value;

    var input_data = JSON.stringify({
        email: cust_email,
    });

    return fetch('/api/v1/stripe/createCustomer', {
    method: 'post',
    headers: {
        'Content-Type': 'application/json',
    },
    body: input_data,
    })
    .then((response) => {
        //return cust object as json
        return response.json();
    })
    .then((result) => {
        return result;
    });
}

function login() {
    var myStorage = window.sessionStorage;
    var username = $('#usernameInput').val();
    var password = $('#passwordInput').val();
    //check username and password with google cognito

    //userId 3 is my dummy default profile used when logging in
    myStorage.setItem('userId', 3);
    // var user={};
    // user.id = 'user123';
    // user.username= 'user123';
    // user.email='faker@gmail.com'
    // $.ajax({
    //     url:'/useDisqusSSO',
    //     method:'post',
    //     data:user
    // }).done(function(data){
    //     console.log(data);
    //     var credentials = data.credentials;
    //     myStorage.setItem('auth',credentials.auth);
    //     myStorage.setItem('pubKey',credentials.pubKey);
        window.location.href = '/talents';
    // })
    // window.location.href = '/talents';
}

