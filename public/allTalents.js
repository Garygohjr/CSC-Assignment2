getAllTalentPics();

function getAllTalentPics(){
    $.ajax({
        url:'/talents/getAllTalents',
        method:'GET'
    }).done(function(data){
        console.log('we did it');
        console.log(data);
        var userId = sessionStorage.getItem('userId');
        var talentData = data.results;
        for (var i = 0; i < talentData.length; i++){
            if (talentData[i].TalentId != userId){
                console.log(talentData[i].TalentId);
                var elem = '<li id=' + talentData[i].TalentId + '_li onClick="goToDetailsPage(' + talentData[i].TalentId + ');"></li><br><br>';
                $('#talentList').append(elem);
                var elemId = '#' + talentData[i].TalentId + '_li';
                $(elemId).append('<h2 id=' + talentData[i].TalentId + '_h2>' + talentData[i].TalentName + '</h2>');
                $(elemId).append('<img id=' + talentData[i].TalentId + '_img src=' + talentData[i].ImageUrl + '></img>');
                $(elemId).append('<p id=' + talentData[i].TalentId + '_p>' + talentData[i].Biography + '</p>');
            }
        }
    })
}

function goToDetailsPage(id){
    window.location.href = window.location.href + '/' + id
}

// function talentDetails(event){
//     var id = event.target.id;
//     var matches = id.match(/\d+/g); 
//     id = matches[0];
//     $.ajax({
//         url:'talents/' + id,
//         method:'POST'
//     })
// }