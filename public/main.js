
var objPeople = [
    {
        username: "motanu",
        password: "cine"
    },
    {
        username: "rares",
        password: "cristea"
    },
]

// Login page getInfo for login

function getInfo() {

    var username = document.getElementById("username");
    var password = document.getElementById("password");

    if(localStorage.getItem('username') && localStorage.getItem('password')) {
        username.value = localStorage.getItem('username');
        password.value = localStorage.getItem('password');
    }
    
    var flag = false
    for (i = 0; i < objPeople.length; i++) {
        if (username.value == objPeople[i].username && password.value == objPeople[i].password) {
            flag = true;
            localStorage.setItem('username', username.value);
            localStorage.setItem('password', password.value);
            setTimeout(function(){ alert("Succesful login!"); }, 2000);
        }
    }
        
    if (!flag){
        setTimeout(function(){ alert("Unknown credentials!"); }, 2000);
    }

    console.log(username.value + ", " + password.value);
}

function gameCardClicked(card) {
    card.style.transform = "scale(1.2)";
    return false;
}


function gameCardOnMouseOut(card) {
    card.style.transform = "scale(1.0)";
}

function gameCardChangeImage(card, img) {
    card.childNodes[1].src = img;
}

function gameCardChangeTitle(card, title) {
    card.childNodes[3].childNodes[1].innerHTML = title;
}

function count(){
    var texte = document.getElementsByTagName("body");
    var ct = texte[0].innerText.split(" ").length;
    document.getElementsByTagName("footer")[0].innerHTML += "Word count: " + ct;
}
