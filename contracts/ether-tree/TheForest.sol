// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/ether-tree/TheForest.sol)
// https://omnuslab.com/ethertree
// https://ethertree.org

// EtherTree 100 total supply ERC721

/**
*
* @dev EtherTree
*
* Distribution contract for the ether tree project. This token implements a few innovations:
* - Pre minted token supply. The total supply was minted on contract creation (which saves gas). 
* - All metadata is revealed, opensea site is up etc. so people know exactly what they are buying in to.
* - Which creates the issue of random assignment, which is solved by RandomlyAlloacted and IceRing, in their first mainnet incarnation.
*   For more details see  https://omnuslab.com/RandomlyAllocated and https://omnuslab.com/IceRing
*/

pragma solidity ^0.8.13;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@omnus/contracts/token/RandomlyAllocated/RandomlyAllocatedEtherTree.sol"; 

/**
*
* @dev Contract implements RandomlyAllocated and IceRing (which is in RandomlyAllocated)
*
*/
contract TheForest is Ownable, RandomlyAllocated, IERC721Receiver {

  IERC721 public immutable etherTree; 
  IERC721 public immutable wassiesByWassies;
  address payable public immutable etherTreesury; 
  address public immutable ice; 
  address public immutable oat; 

  uint256 public constant PRICE        = 10000000000000000; // 0.01 eth
  uint256 public constant WASSIE_PRICE =  1000000000000000; // 0.001 eth

  mapping(address => bool) private youveGotOneAlready;

  constructor(address etherTree_, address wassiesByWassies_, address payable etherTreesury_, address ice_, address oat_) 
    RandomlyAllocated(100, oat_, ice_, 0, 0, 0) {
    
    etherTree = IERC721(etherTree_);
    wassiesByWassies = IERC721(wassiesByWassies_);
    etherTreesury = etherTreesury_;
    ice = ice_;
    oat = oat_;
  }

  /**
  *
  * @dev Events
  *
  */
  event EthWithdrawal(uint256 indexed withdrawal);

  /**
  *
  * @dev Do not accept random calls:
  *
  */
  
  receive() external payable {
    revert();
  }

  fallback() external payable {
    revert();
  }

  /** 
  *
  * @dev owner can withdraw eth to treasury:
  *
  */ 
  function withdrawEth(uint256 _amount) external onlyOwner returns (bool) {
    (bool success, ) = etherTreesury.call{value: _amount}("");
    require(success, "Transfer failed.");
    emit EthWithdrawal(_amount);
    return true;
  }

  /**
  *
  * @dev claimTreeNormie
  *
  */
  function claimTreeNormie() payable external {
    require(msg.value == PRICE, "Incorrect ETH amount passed. For a shot at a free 1/1 tree go to yellowbird.ethertree.org");

    deliverTree();
  }

  /**
  *
  * @dev claimTreeWassie
  *
  */
  function claimTreeWassie() payable external {

    require((wassiesByWassies.balanceOf(msg.sender) >= 1), "Must have a wassie for this price. For a shot at a free 1/1 tree go to yellowbird.ethertree.org");
    require(msg.value == WASSIE_PRICE, "Incorrect ETH amount passed. For a shot at a free 1/1 tree go to yellowbird.ethertree.org");

    deliverTree();

  }

  /**
  *
  * @dev deliverTree
  *
  */
  function deliverTree() internal {

    require(!youveGotOneAlready[msg.sender], "Hey, one each please! You can't have two.");
    
    // Send them their randomly selected tree!
    etherTree.safeTransferFrom(address(this), msg.sender, _getItem(0));

    youveGotOneAlready[msg.sender] = true;

  }

  /**
  *
  * @dev onERC721Received: Always returns `IERC721Receiver.onERC721Received.selector`. We need this to custody NFTs on the contract:
  *
  */
  function onERC721Received(
    address,
    address,
    uint256,
    bytes memory
  ) external virtual override returns (bytes4) {
    return this.onERC721Received.selector;
  }

}