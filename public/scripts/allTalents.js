

var custId = sessionStorage.getItem('custId');
console.log(custId);
if(custId == null){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var custId = urlParams.get('customerId');
    console.log("new custId assigned = " + custId);
}
getAccountTier(custId);

getAllTalentPics();


function getAllTalentPics(){
    $.ajax({
        url:'/talents/getAllTalents',
        method:'GET'
    }).done(function(data){
        console.log('we did it');
        console.log(data);
        var userId = sessionStorage.getItem('userId');
        var profiles = data.profiles;
        var latestImages = data.latestImages;
        for (var i = 0; i < profiles.length; i++){
            if (profiles[i].TalentId != userId){
                console.log(profiles[i].TalentId);
                var elem = '<li id=' + profiles[i].TalentId + '_li onClick="goToDetailsPage(' + profiles[i].TalentId + ');"></li><br><br>';
                $('#talentList').append(elem);
                var elemId = '#' + profiles[i].TalentId + '_li';
                $(elemId).append('<h2 id=' + profiles[i].TalentId + '_h2>' + profiles[i].TalentName + '</h2>');
                if (latestImages[i] != undefined){
                    $(elemId).append('<img id=' + profiles[i].TalentId + '_img src=' + latestImages[i].ImageUrl + '></img>');
                }else{
                    $(elemId).append('<p> No Images has been uploaded. </p>');
                }
                $(elemId).append('<p id=' + profiles[i].TalentId + '_p>' + profiles[i].Biography + '</p>');
            }
        }
    })
}

$(function(){
    $('.compose-wrapper').attr("display","none");
})

function goToDetailsPage(id){
    window.location.href = window.location.href + '/' + id
}


$( "#billing_portal_link" ).on( "click", function() {
    var input_data = JSON.stringify({
        custId: custId,
        dest: 'talents'
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

                
                //myStorage.setItem('userId', 3);
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