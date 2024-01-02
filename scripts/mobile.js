let sidebar = document.getElementById("question-sidebar");
let background = document.getElementById("menu-background");
let leaveArea = document.getElementById("mobile-leave");

let inited = false;
let opened = false;
let firstMove = false;

let lock = 0;

let closing = false;

export function animateMenuIn() {
    if (!inited) return;

    let cur = ++lock;

    opened = true;

    background.classList.remove("hidden");
    leaveArea.classList.remove("hidden");
    setTimeout(() => {
        sidebar.classList.add("question-sidebar-visible");
        background.classList.add("menu-background-visible"); 
    }, 5);

    setTimeout(() => {
        if (cur != lock) return;
        lock = 0;
    }, 300);
    
}

export function animateMenuOut() {
    if (!inited) return;

    sidebar.classList.remove("question-sidebar-visible");
    background.classList.remove("menu-background-visible");

    opened = false;
    closing = true;
    
    leaveArea.classList.add("hidden");
    
    let cur = ++lock;
    setTimeout(() => {
        if (cur != lock) return;

        background.classList.add("hidden"); 
        closing = false;
    }, 300);
}

let hamburgerButton = document.getElementById("hamburger-button");

let startX = 0;
let curTime = 0;
let prevX = 10000;
let prevTime = 0;
let curX = 0;
let swiping = false;

function handleTouchStart(e) {
    if (!opened || closing) return;

    swiping = true;

    sidebar.classList.add("sidebar-touching");
    background.classList.add("sidebar-touching");
    startX = e.targetTouches[0].pageX;
    curX = startX;
    curTime = window.performance.now();

    firstMove = true;
}

function handleTouchMove(e) {
    if (!opened || !swiping) return;

    let width = sidebar.getBoundingClientRect().width;

    prevX = curX;
    curX = e.targetTouches[0].pageX;

    prevTime = curTime;
    curTime = window.performance.now();

    let newPos = curX - startX;
    let opacity = Math.max(0, Math.min(1, (newPos + width) / width));

    opacity = Math.sqrt(opacity);

    if (newPos > 0) {
        // newPos = 0;
        newPos = 12 * (Math.log((newPos) / 12 + 1));
    }
    
    
    sidebar.style.transform = "translateX(" + newPos + "px)";
    background.style.opacity = opacity.toString();
}

function handleTouchEnd(e) {
    if (!opened || !swiping) return;

    revertSwipes();

    let velocity = (prevX - curX) / (curTime - prevTime);

    let width = sidebar.getBoundingClientRect().width;

    console.log(velocity);

    if (velocity < 0) return;

    if (velocity > 0.3 || (curX - startX + width) < 0.75 * width) {
        animateMenuOut();
    }
}

function revertSwipes() {
    swiping = false;

    sidebar.classList.remove("sidebar-touching");
    background.classList.remove("sidebar-touching");
    sidebar.style.transform = null;
    background.style.opacity = null;
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

    leaveArea.addEventListener("touchstart", handleTouchStart);
    leaveArea.addEventListener("touchmove", handleTouchMove);
    leaveArea.addEventListener("touchend", handleTouchEnd);
}