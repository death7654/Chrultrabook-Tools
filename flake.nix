{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      rust-overlay,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            (pkgs.rust-bin.fromRustupToolchain {
              channel = "stable";
              components = [
                "rustfmt"
                "rust-src"
                "clippy"
              ];
              targets = [ "wasm32-unknown-unknown" ];
              profile = "minimal";
            })
            cargo-deny
            cargo-edit
            cargo-watch
            cargo-tauri
            rust-analyzer
          ];

          inputsFrom = [ self.packages.${system}.default ];

          LD_LIBRARY_PATH = "${pkgs.libayatana-appindicator}/lib";
        };

        packages.default = pkgs.callPackage ./default.nix {
          lib = nixpkgs.lib;
          inherit pkgs;
        };
      }
    );

}
