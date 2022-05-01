// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@omnus/contracts/token/ERC721BatchTransfer/ERC721BatchTransfer.sol";

contract mockERC721 is ERC721, Ownable, ERC721BatchTransfer {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("BatchableERC721", "BATCHERC721") {}    

    function safeMint() public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
    }

    function gimme100IWannaPlay() external {
      for (uint256 i = 0; i < 100; i++) {
        safeMint();
      }
    }
}