const path = require("path");

module.exports = {
  packagerConfig: {
    icon: path.resolve(__dirname, "./assets/icon/feelings"),
    executableName: "kickbotter",
    win32metadata: {
      FileDescription: "Automated socials' actions",
      InternalName: "kickbotter",
      OriginalFilename: "kickbotter",
      ProductName: "kickbotter",
    },
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "Kickbotter",
        exe: "KickBotter.exe",
        authors: "Enrico Di Grazia",
        description: "Some automated browser program.",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          icon: path.resolve(__dirname, "./assets/icon/feelings.png"),
          maintainer: "enrico-dgr",
          homepage: "https://github.com/enrico-dgr/Kick-Botter",
          description: "Some automated browser program.",
          productDescription: "Some automated browser program.",
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        format: "ULFO",
      },
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      platforms: ["darwin"],
      config: {
        repository: {
          owner: "enrico-dgr",
          name: "Kick-Botter",
        },
      },
      draft: true,
    },
  ],
};
