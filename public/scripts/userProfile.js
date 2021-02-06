var gatewayUrl = 'https://rdvkdfmsk0.execute-api.us-east-1.amazonaws.com';

getUserProfile();

function getUserProfile(){
    var id = sessionStorage.getItem('custId');
    console.log(id);
    $.ajax({
        url: gatewayUrl + '/api/v1/talents/getOneTalent/' + id,
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
                $(elem_id).append('<img src=' + images[i].ImageUrl + ' id=img_' + images[i].ImageId + '></img>');
                $(elem_id).append('<div class="desc">' + images[i].Description + '</div>');
                $(elem_id).append('<input class="cardRadio" name="radio" type=radio id='+ images[i].ImageId + ' value=' + images[i].ImageId + '></input>')
                console.log(elem);
            }
        }
        
    })
}

AWS.config.update({
    accessKeyId: 'ASIASQ2NIDX4SFQUZHFW',
    secretAccessKey: 'pW0J3+e9h1EdnwIeSGmZHKiNT7TlLtWPvFVCy5PM',
    sessionToken: 'FwoGZXIvYXdzEMn//////////wEaDC5QinkvDGqq7MBwSSLKAQG57+spaCkVkyIHqSmQQweOx1F8lpjDiQQQyQq/6CeMxWDCHrFUR5dv5Vvqh+eqPYHJed+guZOI9vK6yY3+w6dy2UH0fFUJKcAIyOD0px1BcLq5LE/3GtQ4lX0Y+i5mJ1gihXpf8b5cpKS1tkU9lchJZcd/9TW6+zodKnFjP2VRvEQ9OtiNmuG6/phM9qvqB4tjMclMZ+ZYR/IEVmE7osoEi8fbkZAHDEOEMW3TZl/zcduxC/JGnU4rYs5nSTlJEnOc8zjDZRg1sEQo8rTZgAYyLRd/40gbkw2miLda7VSbDnCg85oE6Sos56uW+O461tJ5HnJ7Yo4BmGydxTMDNg=='
});

AWS.config.region = 'us-east-1';
var s3BucketName = 'talentsphotosbucket';

function validateUpload() {
    var file = document.getElementById('file').files[0];
    var description = $('#descriptionInput').val();
    var radioValue = $('input[name=radio]:checked').val();
    if (file == null) {
        alert('No Image uploaded. Please upload an image.');
        return false;
    }else if (description == ''){
        alert('Description field is empty.');
        return false;
    }else {
        var fileName = file.name;
        var allowed_extensions = new Array("jpg", "png", "jpeg");
        var file_extension = fileName.split('.').pop().toLowerCase();

        for (var i = 0; i < allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true;
            }
        }
        $("#file").val('');
        alert('invalid file extension. Please choose a valid extension.');
        return false;
    }
}

function uploadImage() {
    var reader = new FileReader;
    var file = document.getElementById('file').files[0];
    reader.onload = function () {
        var imageDataUrl = reader.result; 
        var imageData = {};
        imageData.FileName = file.name;
        imageData.FileType = file.type;
        imageData.ImageDataUrl = imageDataUrl;
        imageData.TalentId = sessionStorage.getItem('custId');
        imageData.Description = $('#descriptionInput').val();
        $.ajax({
            url: gatewayUrl + '/api/v1/profile/uploadImage',
            method: 'post',
            data: imageData
        }).done(function (data) {
            console.log(data);
            var imageUrl = data.imageUrl;
            var imageId = data.imageId;
            var description = data.description;
            var elem = '<div class="card" id=card_' + imageId + '></div>'
            $('#talentDetails').append(elem);
            var elem_id = '#card_' + imageId;
            $(elem_id).append('<img src=' + imageUrl + ' id=img_' + imageId + '></img>');
            $(elem_id).append('<div class="desc">' + description + '</div>');
            $(elem_id).append('<input class="cardRadio" name="radio" type=radio id=' + imageId + ' value=' + imageId + '></input>')
        }).fail(function(error){
            alert(error.responseJSON.msg);
        });
    }
    if (validateUpload()) {
        reader.readAsDataURL(file);
    }
}

function updateImage() {
    var radioValue = $('input[name=radio]:checked').val();
    var file = document.getElementById('file').files[0];
    var reader = new FileReader;
if (radioValue != undefined) {
    var originalImageSrc = $('#img_' + radioValue).attr("src");
    var imageKey = originalImageSrc.substring(originalImageSrc.lastIndexOf('/') + 1);

    reader.onload = function () {
            var imageDataUrl = reader.result;
            var imageData = {};
            imageData.FileName = file.name;
            imageData.FileType = file.type;
            imageData.ImageDataUrl = imageDataUrl;
            imageData.ImageId = radioValue;
            imageData.ImageKey = imageKey;
            imageData.OriginalImageUrl = originalImageSrc;
            imageData.Description = $('#descriptionInput').val();
            $.ajax({
                url: '/api/v1/profile/updateImage',
                method: 'put',
                data: imageData
            }).done(function (data) {
                console.log(data);
                var imageId = data.imageId;
                var description = data.description;
                var imageUrl = data.imageUrl;
                var elem = '<div class="card" id=card_' + imageId + '></div>'
                var elemHTML = $.parseHTML(elem);
                $(elemHTML).append('<img src=' + imageUrl + ' id=img_' + imageId + '></img>');
                $(elemHTML).append('<div class="desc">' + description + '</div>');
                $(elemHTML).append('<input class="cardRadio" name="radio" type=radio id=' + imageId + ' value=' + imageId + '></input>')
                $('#card_' + imageId).replaceWith(elemHTML);
            }).fail(function (error) {
                alert(error.responseJSON.msg);
            });
        } 
        
    }else {
        alert('Please select an image to update.');
    }
    if (validateUpload()) {
        reader.readAsDataURL(file);
    }
}

function deleteImage(){
    var radioValue = $('input[name=radio]:checked').val();
    var originalImageSrc = $('#img_' + radioValue).attr("src");
    var imageKey = originalImageSrc.substring(originalImageSrc.lastIndexOf('/') + 1);
    var imageData = {};
    imageData.ImageId = radioValue;
    imageData.OriginalImageUrl = originalImageSrc;
    imageData.ImageKey = imageKey;
        if (radioValue != undefined) {
            $.ajax({
                url: gatewayUrl + '/api/v1/profile/deleteImage',
                method: 'delete',
                data: imageData
            }).done(function (data) {
                $('#card_' + radioValue).remove();
            });
        } else {
            alert('please select an image to delete.');
        }
    

}