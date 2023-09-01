window.addEventListener("DOMContentLoaded", () => {
    window.currentFrame = document.querySelector(".view_frame");
    const body = document.body,
          modeToggle = body.querySelector(".mode-toggle");
          sidebar = body.querySelector("nav");
          sidebarToggle = body.querySelector(".sidebar-toggle");
    
    function loadPage(path) {
        if (window.currentFrame.src.endsWith(path)) return;
        const newFrame = document.createElement("iframe");
        newFrame.classList.add("view_frame");
        newFrame.addEventListener("load", () => {
            newFrame.style.display = "";
            window.currentFrame.remove();
            window.electronAPI.requestData();
            window.currentFrame = newFrame;
        })
        newFrame.style.display = "none";
        newFrame.src = path;
        window.currentFrame.parentElement.insertBefore(newFrame, window.currentFrame);
    }

    var home = document.getElementById("sectionDashboard");
    var fan = document.getElementById("sectionFan");
    var cbmem = document.getElementById("sectionCbmem");
    var about = document.getElementById("sectionAbout");
    
    home.style.display = "block";
    fan.style.display = "none";
    cbmem.style.display = "none";
    about.style.display = "none";

    function homeButton()
    {
        home.style.display = "block";
        fan.style.display = "none";
        cbmem.style.display = "none";
        about.style.display = "none";
    }
    function fanButton()
    {
        home.style.display = "none";
        fan.style.display = "block";
        cbmem.style.display = "none";
        about.style.display = "none";
    }
    function cbmemButton()
    {
        home.style.display = "none";
        fan.style.display = "none";
        cbmem.style.display = "block";
        about.style.display = "none";
    }
    function infoButton()
    {
        home.style.display = "none";
        fan.style.display = "none";
        cbmem.style.display = "none";
        about.style.display = "block";
    }
    document.getElementById("home").addEventListener("click", () => {
        homeButton();
    })
    document.getElementById("fan").addEventListener("click", () => {
        fanButton();
    })
    document.getElementById("diagnostics").addEventListener("click", () => {
        cbmemButton();
    })
    document.getElementById("information").addEventListener("click", () => {
        infoButton();
    })    
    
    
    let getMode = localStorage.getItem("mode");
    if (getMode && getMode ==="dark") {
        body.classList.toggle("dark");
    }

    let getStatus = localStorage.getItem("status");
    if (getStatus && getStatus ==="close") {
        sidebar.classList.toggle("close");
    }

    modeToggle.addEventListener("click", () =>{
        body.classList.toggle("dark");
        if (body.classList.contains("dark")) {
            localStorage.setItem("mode", "dark");
        } else {
            localStorage.setItem("mode", "light");
        }
    });

    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("close");
        window.currentFrame.contentDocument.querySelector("nav").classList.toggle("close", sidebar.classList.contains("close"));
        localStorage.setItem("status", sidebar.classList.contains("close") ? "close" : "open");
    });
})
