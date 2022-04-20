// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/RandomlyAllocated/StripeAllocatedERC721.sol)
// https://omnuslab.com/randomallocation

// StripeAllocatedERC721 (Example Implementation of StripeAllocated.sol).

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
import "./StripeAllocated.sol"; 

contract StripeAllocatedERC721 is ERC721, StripeAllocated, Ownable {

  /**
  *
  * @dev must be passed supply details, ERC20 payable contract and ice contract addresses, as well as entropy mode and fee (if any)
  *
  */
  constructor(uint256 _supply, address _ERC20SpendableContract, address _iceRing, uint256 _entropyMode, uint256 _ethFee, uint256 _oatFee) 
    ERC721("RandoToken", "RDT") 
    StripeAllocated(_supply, _ERC20SpendableContract, _iceRing, _entropyMode, _ethFee, _oatFee) {
    }


  /**
  *
  * @dev Mint a random tokenId:
  *
  */
  function randomlyAllocatedMint() external {
    _safeMint(msg.sender, _getItem()); 
  }
}