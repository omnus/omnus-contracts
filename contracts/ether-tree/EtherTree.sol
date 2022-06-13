// SPDX-License-Identifier: MIT
// Ether Tree - carbon negative NFT collection

pragma solidity ^0.8.11;                    

import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract EtherTree is ERC721, Ownable {
  using Strings for uint256;

  string constant BASE_URI = "https://arweave.net/rH6OmtpvUKkA5ELLsydWTxZ9_miLI12exZTObZUNEX0/";

  constructor() ERC721("EtherTree", "ETREE") {
    for (uint256 i = 0; i < 100; i++) {
      _safeMint(msg.sender, i);
    }
  }

  function totalSupply() public pure returns (uint256) {
    return (100);
  }

  function tokenURI(uint256 tokenId)
      public
      view
      override(ERC721)
      returns (string memory)
  {
    require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
    return string(abi.encodePacked(BASE_URI, tokenId.toString(), ".json"));
  }

  /**
  * @dev See {IERC721-transferFrom}.
  */
  function transferFrom(
      address from,
      address to,
      uint256 tokenId
  ) public override {

    console.log(from);
    console.log(to);
    console.log(tokenId);
    console.log(msg.sender);
    
      //solhint-disable-next-line max-line-length
      require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

      _transfer(from, to, tokenId);
  }
}