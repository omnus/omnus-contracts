require("dotenv").config()
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("hardhat-etherscan-abi")
require("hardhat-abi-exporter")
require("hardhat-contract-sizer")
require("@nomiclabs/hardhat-etherscan")
require("@appliedblockchain/chainlink-plugins-fund-link")
const { types } = require("hardhat/config")

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.4.24",
      },
    ],
  },
  abiExporter: {
    path: "./data/abi",
    clear: true,
    flat: true,
    spacing: 2,
    pretty: false,
  },
  mocha: {
    timeout: 60000,
    bail: true,
    // exit: true,
    // recursive: false,
  },
  defaultNetwork: "hardhat",
}
