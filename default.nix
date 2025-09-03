{
  lib,
  pkgs,
  ...
}:
with pkgs;
rustPlatform.buildRustPackage rec {
  pname = "chrultrabook-tools";
  version = (builtins.fromJSON (builtins.readFile (src + "/package-lock.json"))).version;
  src = ./.;

  cargoDeps = rustPlatform.importCargoLock {
    lockFile = ./src-tauri/Cargo.lock;
  };

  npmDeps = importNpmLock {
    npmRoot = ./.;
  };

  nativeBuildInputs = [
    cargo-tauri.hook
    nodejs_22
    importNpmLock.npmConfigHook
    pkg-config
    wrapGAppsHook4
    python311
  ];

  buildInputs = [
    at-spi2-atk
    atkmm
    cairo
    gdk-pixbuf
    glib
    gtk3
    harfbuzz
    librsvg
    libsoup_3
    openssl
    pango
  ]
  ++ lib.optionals stdenv.hostPlatform.isLinux [
    libayatana-appindicator
    udev
    webkitgtk_4_1
  ];

  cargoRoot = "src-tauri";
  buildAndTestSubdir = cargoRoot;

  postFixup = ''
    patchelf $out/bin/chrultrabook-tools --add-needed libayatana-appindicator3.so.1
  '';

  meta = with lib; {
    description = "User-friendly configuration utility for Chromebooks running an alternate OS ";
    homepage = "https://github.com/death7654/Chrultrabook-Tools";
    license = licenses.gpl3;
    platforms = [
      "x86_64-linux"
      "aarch64-linux"
      # Broken
      # "x86_64-darwin"
      # "aarch64-darwin"
    ];
  };
}
