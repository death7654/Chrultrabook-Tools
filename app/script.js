window.addEventListener("DOMContentLoaded", () => {
    window.electronAPI.requestSystemInfo();
    const body = document.body,
          modeToggle = body.querySelector(".mode-toggle");
          sidebar = body.querySelector("nav");
          sidebarToggle = body.querySelector(".sidebar-toggle");
    

    //changing menus

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

    
    //mode toggles
    
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
        localStorage.setItem("status", sidebar.classList.contains("close") ? "close" : "open");
    });
        var autoFan = document.getElementById("fanAuto");
        var offFan = document.getElementById("fanOff");
        var maxFan = document.getElementById("fanMax");

    function fanMax(){
        window.parent.electronAPI.ectool(modeOne);
        autoFan.classList.remove("activeButton");
        offFan.classList.remove("activeButton");
        maxFan.classList.add("activeButton");
    }
    function fanOff(){
        window.parent.electronAPI.ectool(modeTwo);
        autoFan.classList.remove("activeButton");
        offFan.classList.add("activeButton");
        maxFan.classList.remove("activeButton");
    }
    function fanAuto(){
        window.parent.electronAPI.ectool(modeThree);
        autoFan.classList.add("activeButton");
        offFan.classList.remove("activeButton");
        maxFan.classList.remove("activeButton");
    }

    //information senter and getter
    const modeOne = 1;
    const modeTwo = 2;
    const modeThree = 3;
    const modeFour = 4;
    const modeFive = 5;
    const modeSix = 6;

    const buttonfanMax = document.getElementById('fanMax');
    buttonfanMax.addEventListener('click', () => fanMax());

    const buttonfanOff = document.getElementById('fanOff');
    buttonfanOff.addEventListener('click', () => fanOff());

    const buttonfanAuto = document.getElementById('fanAuto');
    buttonfanAuto.addEventListener('click', () =>  fanAuto());

    const buttoncbMem = document.getElementById('cbMem');
    buttoncbMem.addEventListener('click', () => window.parent.electronAPI.ectool(modeFour));

    const buttonClose = document.getElementById('close');
    buttonClose.addEventListener('click', () => window.parent.electronAPI.ectool(modeFive));

    const buttonMinimize = document.getElementById('minimize');
    buttonMinimize.addEventListener('click', () =>  window.parent.electronAPI.ectool(modeSix));
    
    window.openExternal = (url) => {
        window.electronAPI.openExternal(url);
    }


    function copyTxt (htmlElement) {
        if(!htmlElement) return;

        let elementText = htmlElement.innerText;

        let inputElement = document.createElement('input');
        inputElement.setAttribute('value', elementText);
        document.body.appendChild(inputElement);
        inputElement.select();
        document.execCommand('copy');
        inputElement.parentElement.removeChild(inputElement);

    }
    document.querySelector('#copyButton').addEventListener("click", () => {
        copyTxt(document.querySelector('#cbMemInfo'))
    })

})
