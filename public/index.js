function login() {
    var myStorage = window.sessionStorage;
    var username = $('#usernameInput').val();
    var password = $('#passwordInput').val();
    //check username and password with google cognito

    //userId 3 is my dummy default profile used when logging in
    myStorage.setItem('userId', 3);
    window.location.href = '/talents'
}