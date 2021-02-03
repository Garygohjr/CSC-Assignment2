var gatewayUrl = 'https://rdvkdfmsk0.execute-api.us-east-1.amazonaws.com';
gatewayUrl = "";
var custId = sessionStorage.getItem('custId');
console.log(custId);
if(custId == null){
    //allow unregistered users
    console.log('none');
}
else{
    $( "#homeLink_list" ).remove();
    getAccountTier(custId);
    $('#buttonList').append('<li><button type="button" class="btn btn-primary" id="billing_portal_link" style="margin-bottom: 4px">Change subscription plan</button></li>'+
    '<li><button type="button" class="btn btn-primary" id="logout" style="margin-bottom: 4px">Log out</button></li>'+
    '<li><a id ="talentsLink" href="/talents">All Talents</a></li>'+
    '<li><a id ="profileLink" href="/profile">My Profile</a></li>');
    $( "#homeLink" ).remove();
}


getAllTalentPics();

function getAllTalentPics(){
    $.ajax({
        url: gatewayUrl + '/api/v1/talents/getAllTalents',
        method:'GET'
    }).done(function(data){
        console.log('we did it');
        console.log(data);
        var profiles = data.profiles;
        var latestImages = data.latestImages;
        for (var i = 0; i < profiles.length; i++){
            if (profiles[i].TalentId != custId){
                console.log(profiles[i].TalentId);
                var elem = '<li id=' + profiles[i].TalentId + '_li onClick="goToDetailsPage(\'' + profiles[i].TalentId + '\');"></li><br><br>';
                $('#talentList').append(elem);
                var elemId = '#' + profiles[i].TalentId + '_li';
                $(elemId).append('<h2 id=' + profiles[i].TalentId + '_h2>' + profiles[i].TalentName + '</h2>');
                var added = false;  //added is a boolean to show whether a profile image has been added
                for(var x = 0; x < latestImages.length; x++){
                    
                    if(latestImages[x].TalentId == profiles[i].TalentId){
                        $(elemId).append('<img id=' + profiles[i].TalentId + '_img src=' + latestImages[x].ImageUrl + '></img>');
                        added = true; //state a profile image has been added
                    }
                }
                if(added == false){
                    $(elemId).append('<p> No Images has been uploaded. </p>');
                }

                $(elemId).append('<p id=' + profiles[i].TalentId + '_p>' + profiles[i].Biography + '</p>');
            }
        }
    })
}


function goToDetailsPage(id){
    window.location.href = '/talents/' + id
}


$( "#billing_portal_link" ).on( "click", function() {
    var input_data = JSON.stringify({
        custId: custId,
        dest: 'allTalents.html'
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



$( "#logout" ).on( "click", function() {
    var code = null;
    return fetch('/api/v1/stripe/logoutCustomer', {
        method: 'post',
        headers: {
        'Content-Type': 'application/json',
        }
    })
    .then((response) => {
        code = response.status;
        return response.json();
    })
    .then((result) => {
        switch(code){
            case 200: //successful login

                
                sessionStorage.removeItem('custId');
                
                //window.location.href = '/talents';
                window.location.href = '/';
                break;
            
            case 402:
                $('#err_login').text(result.error);
                break;
            default:
                console.log(result);
                break;
        }
    });
});


function getAccountTier(custId){
    var input_data = JSON.stringify({
        custId: custId,
    });
    console.log(input_data);
    return fetch('/api/v1/stripe/getAccountTier', {
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
        console.log(response);
    });
}