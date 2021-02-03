
getOneTalentPics();

function getOneTalentPics(){
    var url = window.location.href;
    var id = url.substring(url.lastIndexOf('/') + 1);
    console.log(id);
    $.ajax({
        url:'/api/v1/talents/getOneTalent/' + id,
        method:'GET'
    }).done(function(data){
        console.log(data);
        var profile = data.profile;
        var images = data.images;
        console.log(images);
        if (profile[0] != undefined) {
            var header = '<h1>' + profile[0].TalentName + '</h1>'
            $('#talentDetails').append(header);
            var biography = '<p>Biography: ' + profile[0].Biography + '</p>'
            $('#talentDetails').append(biography);

            for (var i = 0; i < images.length; i++) {
                var elem = '<div class="card" id=card_' + images[i].ImageId + '></div>'
                $('#talentDetails').append(elem);
                var elem_id = '#card_' + images[i].ImageId;
                $(elem_id).append('<img src=' + images[i].ImageUrl + '></img>');
                $(elem_id).append('<div class="desc">' + images[i].Description + '</div>');
                console.log(elem);
            }
        }
    })
}