{ pkgs }: {
    deps = [
        pkgs.nodejs-18_x
        pkgs.yarn
        pkgs.esbuild
        pkgs.nodePackages.typescript
        pkgs.nodePackages.typescript-language-server
    ];
}
