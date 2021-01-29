
getOneTalentPics();

function getOneTalentPics(){
    var url = window.location.href;
    var id = url.substring(url.lastIndexOf('/') + 1);
    console.log(id);
    $.ajax({
        url:'/talents/getOneTalent/' + id,
        method:'GET'
    }).done(function(data){
        console.log(data);
        var results = data.results;
        var header = '<h1>' + results[0].TalentName +'</h1>'
        $('#talentDetails').append(header);
        var biography = '<p>Biography: ' + results[0].Biography + '</p>'
        $('#talentDetails').append(biography);

        for (var i = 0; i < results.length;i++){
            var elem = '<div class="card" id=card_' + results[i].ImageId + '></div>'
            $('#talentDetails').append(elem);
            var elem_id = '#card_' + results[i].ImageId;
            $(elem_id).append('<img src=' + results[i].ImageUrl + '></img>');
            $(elem_id).append('<div class="desc">' + results[i].Description + '</div>');
            console.log(elem);
        }
        
    })
}