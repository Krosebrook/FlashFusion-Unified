{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.npm-9_x
    pkgs.git
    pkgs.curl
    pkgs.wget
  ];
}