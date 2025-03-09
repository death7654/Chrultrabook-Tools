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
  ];

  buildInputs =
    [
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
    patchelf $out/bin/Chrultrabook-Tools --add-needed libayatana-appindicator3.so.1
  '';

}
