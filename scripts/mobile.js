let sidebar = document.getElementById("question-sidebar");
let background = document.getElementById("menu-background");

function animateMenuIn() {
    sidebar.classList.add("question-sidebar-visible");
    background.classList.add("menu-background-visible");  
}

function animateMenuOut() {
    sidebar.classList.remove("question-sidebar-visible");
    background.classList.remove("menu-background-visible");  
}

let hamburgerButton = document.getElementById("hamburger-button");

let opened = false;
hamburgerButton.addEventListener("click", (e) => {
    opened = !opened;
    if (opened) {
        animateMenuIn();
    } else {
        animateMenuOut();
    }
})