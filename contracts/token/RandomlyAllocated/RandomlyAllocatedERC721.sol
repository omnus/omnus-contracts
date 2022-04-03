// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/RandomlyAllocated/RandomlyAllocatedERC721.sol)

// RandomlyAllocatedERC721 (Example Implementation of RandomlyAllocated.sol).

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";  
import "./RandomlyAllocated.sol"; 

contract RandomlyAllocatedERC721 is ERC721, RandomlyAllocated, Ownable {

  constructor(uint16 _supply, address _oatContract, address _iceRing, uint256 _entropyMode, uint256 _fee) 
    ERC721("RandoToken", "RDT") 
    RandomlyAllocated(_supply, _oatContract, _iceRing, _entropyMode, _fee) 
  {}

  /**
  * @dev Update fee (implement an external call that calls this in child contract, likely ownerOnly)
  */
  function updateFee(uint256 _fee) external onlyOwner {
    _updateFee(_fee);
  }

  function randomlyAllocatedMint() external {
    _safeMint(msg.sender, _getItem()); 
  }
}