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
    
    document.getElementById("home").addEventListener("click", () => {
        loadPage("Dashboard/index.html");
    })
    document.getElementById("fan").addEventListener("click", () => {
        loadPage("fanControl/fancontrol.html");
    })
    document.getElementById("diagnostics").addEventListener("click", () => {
        loadPage("cbmem/cbmem.html");
    })
    document.getElementById("information").addEventListener("click", () => {
        loadPage("about/info.html");
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
