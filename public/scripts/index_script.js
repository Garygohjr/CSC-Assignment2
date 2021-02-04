sessionStorage.removeItem('custId');
let signupForm = document.getElementById('customer_register');
console.log(signupForm);
if(signupForm){
    console.log("form found");
    signupForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        $('#reg_error').text('');
        $('.errMsg').remove();
        // Create customer
        var validated = validateReg();

        if(validated){

            registerCust().then((result) => {
                console.log(result);
                // if(!result.error_bool){
                //   var stripe_id = result.stripe_id;
      
                //   registerTalent(stripe_id).then((result) => {
                //       if(result.success == true){
                //           window.location.href = '/subscription.html?customerId=' + stripe_id;
                //       }
                //       else{
                //           console.log(result.msg);
                //       }
                //   });
                // }
                // else{
                //   $('#reg_error').text(result.error_msg);
                //   console.log(result.error_msg);
                // }
                
              });
        }

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
                case 200: 
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
            code = response.status;
            return response.json();
        })
        .then((result) => {
            if(code == 200){
                result.error_bool = false;
            }
            else{
                result.error_bool = true;
            }
            
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

    //empty username error handling done by cognito
    if(cust_password == ""){ 
        $('#err_login').text("Password cannot be empty");
        return null;
    }

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
            
            case 400:
                $('#err_login').text(result.error);
                break;
            default:
                console.log(result);
                break;
        }

        
    });


}

function validateReg(){

    var result = true;
    const email_re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const name_re = new RegExp("^[a-zA-Z0-9_\*\.\\s\,\&']+$");
    const password_re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    var email = $('#email').val();
    var name = $('#name').val();
    var biography = $('#biography').val();
    var password = $('#password').val();

    if (!email) {
        result = false;
        $('#email').after(errHTML("Email is required"));
    }
    else if (!email_re.test(String(email).toLowerCase())) {
        result = false;
        $('#email').after(errHTML("Please enter a valid email"));
    }

    if (!name) {
        result = false;
        $('#txtName').after(errHTML("Name is required"));
    }
    else if (!name_re.test(String(name).toLowerCase())) {
        result = false;
        $('#txtName').after(errHTML("Please enter a valid name with alphanumerical characters or '_', '*', '.'"));
    }

    if (!biography) {
        result = false;
        $('#biography').after(errHTML("Biography is required"));
    }

    if (!password) {
        result = false;
        $('#password').after(errHTML("Password is required"));
    }
    else if (!password_re.test(String(password))) {
        result = false;
        $('#password').after(errHTML("Password must contain minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"));
    }

    return result;
}




function errHTML(text) {
    var ans = '<p class="errMsg" style="display: inline; margin-left: 20px; color: red">' + text + '</p>';
    return ans;
}
