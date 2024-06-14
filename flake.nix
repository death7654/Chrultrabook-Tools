{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, rust-overlay, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            (pkgs.rust-bin.fromRustupToolchain {
              channel = "stable"; # feel free to change the channel
              components = [ "rustfmt" "rust-src" ];
              targets = [ "wasm32-unknown-unknown" ];
              profile = "minimal";
            })
            pkgs.cairo
            pkgs.curl
            pkgs.dbus
            pkgs.gdk-pixbuf
            pkgs.glib
            pkgs.gtk3
            pkgs.libappindicator
            pkgs.libayatana-appindicator
            pkgs.librsvg
            pkgs.libsoup
            pkgs.openssl_3
            pkgs.pkg-config
            pkgs.systemdLibs
            pkgs.webkitgtk_4_1
            pkgs.wget
          ];
        };
      }
    );
}
