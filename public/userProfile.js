getUserProfile();

function getUserProfile(){
    var id = sessionStorage.getItem('userId');
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
            $(elem_id).append('<img src=' + results[i].ImageUrl + ' id=img_' + results[i].ImageId +'></img>');
            $(elem_id).append('<div class="desc">' + results[i].Description + '</div>');
            $(elem_id).append('<input class="cardRadio" name="radio" type=radio id='+ results[i].ImageId + ' value=' + results[i].ImageId + '></input>')
        }
        
    })
}

AWS.config.update({
    accessKeyId: 'ASIASQ2NIDX46DFBLNUZ',
    secretAccessKey: 'V/PLW4cuuZKsaO32mDXlyehem5zf2RMNaUGTpO+9',
    sessionToken: 'FwoGZXIvYXdzEKH//////////wEaDHhUaVA1/jLO3InmyyLKAZupVEGmfvjaopTSIF8sRpLvN26HSN2kf++CUVf3EmRkh3RDVhsAP9WgEWMaXXtw9ruUwr9AYL7FPM3ntpaFCt5BYw5r6Ll+JD40cPpKVUNNP5EmlJVGNdHEfybl0uJA5f51wjbq6GGIbIYn/RGxRXiuKvMaVNTtcnKZBjgSPvGmhTvZT3bEG+qIEoVZDWywuMYKEz2Lu0rQBT5LW3nKlUVWsuY6AlutTiEB+7lfnY/rQ/9/a9HsHwHZpCa613jiv0FbosnBRLnx76EouMjQgAYyLVdjEa0GWpgOA92DCu4y3PZ4l9DDn0kak8iLfEX4+VnaQQhKo82yUq7VC0cgcA=='
});
AWS.config.region = 'us-east-1';
var s3BucketName = 'talentsphotosbucket';

function validateUpload() {
    var file = document.getElementById('file').files[0];
    var description = $('#descriptionInput').val();
    if (file == null) {
        alert('No Image uploaded. Please upload an image.');
        return false;
    }else if (description == ''){
        alert('Description field is empty');
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
    var s3 = new AWS.S3({
        params: { Bucket: s3BucketName }
    });
    var file = document.getElementById('file').files[0];
    if (validateUpload()) {
        s3.putObject({
            Key: file.name,
            ContentType: file.type,
            Body: file,
            ACL: "public-read"
        },
            function (err, data) {
               if (data !== null){
                   console.log(data);
                   console.log(this);
                   var imageUrl = this.request.httpRequest.stream.responseURL;
                   var imageData = {};
                   imageData.ImageUrl = imageUrl;
                   imageData.TalentId = sessionStorage.getItem('userId');
                   imageData.Description = $('#descriptionInput').val();
                   $.ajax({
                       url:'/profile/uploadImage',
                       method:'post',
                       data: imageData
                   }).done(function(data){
                        console.log(data);
                        var results = data.results;
                        var imageId = data.id;
                       var elem = '<div class="card" id=card_' + imageId + '></div>'
                       $('#talentDetails').append(elem);
                       var elem_id = '#card_' + imageId;
                       $(elem_id).append('<img src=' + results.ImageUrl + ' id=img_' + imageId +'></img>');
                       $(elem_id).append('<div class="desc">' + results.Description + '</div>');
                       $(elem_id).append('<input class="cardRadio" name="radio" type=radio id='+ imageId + ' value=' + imageId + '></input>')
                   });
               }else{
                   alert('image uploading failed');
               }
        });
    }
}

function updateImage() {
    var s3 = new AWS.S3({
        params: { Bucket: s3BucketName }
    });
    var file = document.getElementById('file').files[0];
    var radioValue = $('input[name=radio]:checked').val();
    var originalImageSrc = $('#img_' + radioValue).attr("src");
    var imageKey = originalImageSrc.substring(originalImageSrc.lastIndexOf('/') + 1);
    console.log(imageKey);
    console.log(originalImageSrc);
    console.log(radioValue);
    if (validateUpload() || radioValue != undefined) {
        s3.putObject({
            Key: file.name,
            ContentType: file.type,
            Body: file,
            ACL: "public-read"
        },
            function (err, data) {
               if (data !== null){
                   console.log(data);
                   console.log(this);
                   var imageUrl = this.request.httpRequest.stream.responseURL;
                   var imageData = {};
                   imageData.ImageUrl = imageUrl;
                   imageData.ImageId = radioValue;
                   imageData.OriginalImageUrl = originalImageSrc;
                   imageData.Description = $('#descriptionInput').val();
                   $.ajax({
                       url:'/profile/updateImage',
                       method:'put',
                       data: imageData
                   }).done(function(data){
                        console.log(data);
                        var results = data.results;
                        var imageId = results.ImageId;
                        var elem = '<div class="card" id=card_' + imageId + '></div>'
                        var elemHTML = $.parseHTML(elem);
                        $(elemHTML).append('<img src=' + results.ImageUrl + ' id=img_' + imageId +'></img>');
                        $(elemHTML).append('<div class="desc">' + results.Description + '</div>');
                        $(elemHTML).append('<input class="cardRadio" name="radio" type=radio id='+ imageId + ' value=' + imageId + '></input>')
                        $('#card_' + imageId).replaceWith(elemHTML);
                        //if there is no more image references in the sql db, delete the s3 object hosting the image
                        if (data.imgReferences == 0){
                            
                            s3.deleteObject({
                                Key: imageKey
                            }, function(err,data){
                            });
                        }
                   });
               }else{
                    alert('image uploading failed');
               }
        });
    }else{
        if (radioValue == undefined){
            alert('please select an image to update.');
        }
    }
}

function deleteImage(){
    var s3 = new AWS.S3({
        params: { Bucket: s3BucketName }
    });
    var radioValue = $('input[name=radio]:checked').val();
    var originalImageSrc = $('#img_' + radioValue).attr("src");
    var imageKey = originalImageSrc.substring(originalImageSrc.lastIndexOf('/') + 1);
    var imageData = {};
    imageData.ImageId = radioValue;
    imageData.OriginalImageUrl = originalImageSrc;
    if (radioValue != undefined) {
        $.ajax({
            url: '/profile/deleteImage',
            method: 'delete',
            data: imageData
        }).done(function (data) {
            $('#card_' + radioValue).remove();
            //if there is no more image references in the sql db, delete the s3 object hosting the image
            if (data.imgReferences == 0) {

                s3.deleteObject({
                    Key: imageKey
                }, function (err, data) {
                });
            }
        });
    }else{
        alert('please select an image to delete.');
    }

}