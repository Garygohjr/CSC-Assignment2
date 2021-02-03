sessionStorage.removeItem('custId');
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

          registerTalent(customer.id).then((result) => {
            if(result.success == true){
                window.location.href = '/subscription.html?customerId=' + customer.id;
            }
            else{
                console.log(result.msg);
            }
          });
        });
      });
}

function registerTalent(cust_id){
    var code = null;
    var cust_name = document.querySelector('#name').value;
    var biography = document.querySelector('#biography').value;

    var input_data = JSON.stringify({
        custId: cust_id,
        name: cust_name,
        bio: biography
    });

    return fetch('/api/v1/talents/createTalent', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: input_data,
        })
        .then((response) => {
            //return cust object as json
            code = response.status;

            switch(code){
                case 200: //successful login
                    return {success: true, msg: "Customer added as talent"};
                    break;
                
                case 500:
                    return {success: false, msg: "Database error occured!"};
                    break;
                default:
                    return {success: false, msg: "Error!"};
                    break;
            }


        });
}


function registerCust(){
    var cust_email = document.querySelector('#email').value;
    var cust_name = document.querySelector('#name').value;
    var cust_password = document.querySelector('#password').value;

    var input_data = JSON.stringify({
        email: cust_email,
        name: cust_name,
        password: cust_password
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
    $('#err_login').text("");
    var myStorage = window.sessionStorage;
    var cust_email = $('#email_login_input').val();
    var cust_password = $('#passwordInput').val();
    //check username and password with google cognito
    var code = null;

    var input_data = JSON.stringify({
        email: cust_email,
        password: cust_password
    });

    return fetch('/api/v1/stripe/loginCustomer', {
    method: 'post',
    headers: {
        'Content-Type': 'application/json',
    },
    body: input_data,
    })
    .then((response) => {
        //return cust object as json
        code = response.status;
        return response.json();
    })
    .then((result) => {
        //userId 3 is my dummy default profile used when logging in

        console.log(result);

        switch(code){
            case 200: //successful login

                myStorage.setItem('custId', result.stripe_id);
                //myStorage.setItem('userId', 3);
                window.location.href = '/allTalents.html';
                break;
            
            case 402:
                $('#err_login').text(result.error);
                break;
            default:
                console.log(result);
                break;
        }

        
    });

    
    //userId 3 is my dummy default profile used when logging in
    //myStorage.setItem('userId', 3);
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
        //window.location.href = '/talents';
    // })
    // window.location.href = '/talents';
}

