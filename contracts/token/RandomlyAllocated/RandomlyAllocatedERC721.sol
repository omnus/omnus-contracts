// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/RandomlyAllocated/RandomlyAllocatedERC721.sol)
// https://omnuslab.com/randomallocation

// RandomlyAllocatedERC721 (Example Implementation of RandomlyAllocated.sol).

pragma solidity ^0.8.13;

/**
*
* @dev RandomlyAllocated
*
* This is an example of a contract extension which allows the selection of items from a finite collection, each selection
* using the IceRing entropy source and removing the assigned item from selection. Intended for use with random token mints etc.
*
*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";  
import "./RandomlyAllocated.sol"; 

contract RandomlyAllocatedERC721 is ERC721, RandomlyAllocated, Ownable {

  /**
  *
  * @dev must be passed supply details, ERC20 payable contract and ice contract addresses, as well as entropy mode and fee (if any)
  *
  */
  constructor(uint16 _supply, address _ERC20SpendableContract, address _iceRing, uint256 _entropyMode, uint256 _ethFee, uint256 _oatFee) 
    ERC721("RandoToken", "RDT") 
    RandomlyAllocated(_supply, _ERC20SpendableContract, _iceRing, _entropyMode, _ethFee, oatFee) {
    }


  /**
  *
  * @dev Update fee:
  *
  */
  function updateETHFee(uint256 _ethFee) external onlyOwner {
    _updateETHFee(_ethFee);
  }

  /**
  *
  * @dev Update fee:
  *
  */
  function updateOATFee(uint256 _oatFee) external onlyOwner {
    _updateOATFee(_oatFee);
  }

  /**
  *
  * @dev Preload children
  *
  */
  function preloadChildArrays() external onlyOwner {
    _loadChildren();
  }

  /**
  *
  * @dev Mint a random tokenId:
  *
  */
  function randomlyAllocatedMint(uint256 _accessMode) external {
    _safeMint(msg.sender, _getItem(_accessMode)); 
  }

    /**
  *
  * @dev Do not receive unidentified Eth or function calls:
  *
  */
  receive() external payable {
    require(msg.sender == owner(), "Only owner can fund contract");
  }

  fallback() external payable {
    revert();
  }
}