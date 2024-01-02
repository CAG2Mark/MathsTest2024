let sidebar = document.getElementById("question-sidebar");
let background = document.getElementById("menu-background");
let leaveArea = document.getElementById("mobile-leave");

let inited = false;

let lock = 0;

export function animateMenuIn() {
    if (!inited) return;

    let cur = ++lock;

    background.classList.remove("hidden");
    leaveArea.classList.remove("hidden");
    setTimeout(() => {
        sidebar.classList.add("question-sidebar-visible");
        background.classList.add("menu-background-visible"); 
        lock = false;
    }, 5);

    setTimeout(() => {
        if (cur != lock) return;
    }, 300);
    
}

export function animateMenuOut() {
    if (!inited) return;

    sidebar.classList.remove("question-sidebar-visible");
    background.classList.remove("menu-background-visible");
    
    leaveArea.classList.add("hidden");
    
    let cur = ++lock;
    setTimeout(() => {
        if (cur != lock) return;

        background.classList.add("hidden"); 
    }, 300);
}

let hamburgerButton = document.getElementById("hamburger-button");

export function initMobile() {
    let opened = false;
    hamburgerButton.addEventListener("click", (e) => {
        opened = !opened;
        if (opened) {
            animateMenuIn();
        } else {
            animateMenuOut();
        }
    })

    leaveArea.addEventListener("click", (_e) => animateMenuOut());

    inited = true;
}