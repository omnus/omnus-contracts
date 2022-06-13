// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./ERC721Lean2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//import "@omnus/contracts/token/ERC721BatchTransfer/ERC721BatchTransfer.sol";

contract mockERC721Lean2 is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Lean2", "LEAN2") {}

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
