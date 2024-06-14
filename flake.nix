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
          nativeBuildInputs = [ 
	    pkgs.pkg-config 
            pkgs.libappindicator
	    pkgs.libayatana-appindicator
	  ];
          buildInputs = [
            (pkgs.rust-bin.fromRustupToolchain {
              channel = "stable"; # feel free to change the channel
              components = [ "rustfmt" "rust-src" ];
              targets = [ "wasm32-unknown-unknown" ];
              profile = "minimal";
            })
            pkgs.pkg-config
            pkgs.atk
            pkgs.pango
            pkgs.libsoup_3
            pkgs.libappindicator
	    pkgs.libayatana-appindicator
            pkgs.webkitgtk_4_1
            pkgs.openssl
            pkgs.cargo-tauri
            pkgs.trunk
            pkgs.systemdLibs
          ];
        };
      }
    );
}
