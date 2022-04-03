// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/ERC20Spendable/OAT.sol) 

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC20Spendable.sol"; 

contract OAT is ERC20Spendable {
  constructor() ERC20("OAT", "OAT") {
    _mint(msg.sender, 1000000000 * 10 ** decimals());
  }

  function decimals() public pure override returns (uint8) {
		return 10;
	}

}
