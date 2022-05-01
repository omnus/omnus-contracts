// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/ERC721BatchTransfer/ERC721BatchTransfer.sol)
// https://omnuslab.com/erc721-batch-transfer

// ERC721BatchTransfer 

pragma solidity ^0.8.13;

/**
*
* @dev ERC721BatchTransfer - library contract for an ER721 extension that allows owners
* to transfer multiple tokens in a single transaction, therefore saving gas and manual work.
*
*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Context.sol";  

/**
*
* @dev ERC721BatchTransfer is an extension of ERC721:
*
*/
abstract contract ERC721BatchTransfer is Context, ERC721 {

  /**
  *
  * @dev New function, safeTransferFromBatched, that allows the transfer of mulitle tokens in one transaction, saving time and gas.
  *
  */
  function safeTransferFromBatched(
        address from,
        address to,
        uint256[] memory tokenIds
    ) public virtual {


    for (uint256 i = 0; i < tokenIds.length; i++) {
      safeTransferFrom(from, to, tokenIds[i], "");
    }

  }

}