let sidebar = document.getElementById("question-sidebar");
let background = document.getElementById("menu-background");
let leaveArea = document.getElementById("mobile-leave");

let inited = false;
let opened = false;

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

let startX = 0;
let prevX = 10000;
let curX = 0;

function handleTouchStart(e) {
    if (!opened) return;

    sidebar.classList.add("sidebar-touching");
    startX = e.targetTouches[0].pageX;
}

function handleTouchMove(e) {
    if (!opened) return;

    let newPos = e.targetTouches[0].pageX - startX;
    if (newPos > 0) {
        newPos = 20 * (Math.log(newPos / 20));
    }
    sidebar.style.transform = "translateX(" + newPos + "px)";

    prevX = curX;
    curX = e.targetTouches[0].pageX;
}

function handleTouchEnd(e) {
    if (!opened) return;

    sidebar.classList.remove("sidebar-touching");
    sidebar.style.transform = null;

    let delta = prevX - curX;

    let width = sidebar.getBoundingClientRect().width;

    console.log(width);
    if (delta > 10 || (curX - startX + width) < 0.75 * width) {
        animateMenuOut();
    }
}

export function initMobile() {
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

    document.addEventListener("touchstart", handleTouchStart);

    document.addEventListener("touchmove", handleTouchMove);

    document.addEventListener("touchend", handleTouchEnd);
}