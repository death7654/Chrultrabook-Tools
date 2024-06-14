let
  pkgs = import <nixpkgs> { };
  packages = with pkgs; [
    cairo
    curl
    dbus
    gdk-pixbuf
    glib
    gtk3
    libappindicator
    libayatana-appindicator
    librsvg
    libsoup
    openssl_3
    pkg-config
    systemdLibs
    webkitgtk_4_1
    wget
  ];
in
pkgs.mkShell {
  buildInputs = packages;
  shellHook =
    ''
      export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath packages}:$LD_LIBRARY_PATH
      export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS
    '';
}
