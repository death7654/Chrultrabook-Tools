window.addEventListener("DOMContentLoaded", () => {
  const body = document.body,
    modeToggle = body.querySelector(".mode-toggle");
  sidebar = body.querySelector("nav");
  sidebarToggle = body.querySelector(".sidebar-toggle");

  //changing menus

  var home = document.getElementById("sectionDashboard");
  var fan = document.getElementById("sectionFan");
  var cbmem = document.getElementById("sectionCbmem");
  var options = document.getElementById("sectionOptions");
  var about = document.getElementById("sectionAbout");

  home.style.display = "block";
  fan.style.display = "none";
  options.style.display = "none";
  cbmem.style.display = "none";
  about.style.display = "none";

  function homeButton() {
    home.style.display = "block";
    fan.style.display = "none";
    options.style.display = "none";
    cbmem.style.display = "none";
    about.style.display = "none";
  }
  function fanButton() {
    home.style.display = "none";
    fan.style.display = "block";
    options.style.display = "none";
    cbmem.style.display = "none";
    about.style.display = "none";
  }
  function cbmemButton() {
    home.style.display = "none";
    fan.style.display = "none";
    options.style.display = "none";
    cbmem.style.display = "block";
    about.style.display = "none";
  }
  function optionsButton() {
    home.style.display = "none";
    fan.style.display = "none";
    options.style.display = "block";
    cbmem.style.display = "none";
    about.style.display = "none";
  }
  function infoButton() {
    home.style.display = "none";
    fan.style.display = "none";
    options.style.display = "none";
    cbmem.style.display = "none";
    about.style.display = "block";
  }
  document.getElementById("home").addEventListener("mousedown", () => {
    homeButton();
  });
  document.getElementById("fan").addEventListener("mousedown", () => {
    fanButton();
  });
  document.getElementById("options").addEventListener("mousedown", () => {
    optionsButton();
  });
  document.getElementById("diagnostics").addEventListener("mousedown", () => {
    cbmemButton();
  });
  document.getElementById("information").addEventListener("mousedown", () => {
    infoButton();
  });

  //mode toggles

  let getMode = localStorage.getItem("mode");
  if (getMode && getMode === "dark") {
    body.classList.toggle("dark");
  }

  let getStatus = localStorage.getItem("status");
  if (getStatus && getStatus === "close") {
    sidebar.classList.toggle("close");
  }

  modeToggle.addEventListener("mousedown", () => {
    body.classList.toggle("dark");
    if (body.classList.contains("dark")) {
      localStorage.setItem("mode", "dark");
    } else {
      localStorage.setItem("mode", "light");
    }
  });

  sidebarToggle.addEventListener("mousedown", () => {
    sidebar.classList.toggle("close");
    localStorage.setItem(
      "status",
      sidebar.classList.contains("close") ? "close" : "open"
    );
  });
});
