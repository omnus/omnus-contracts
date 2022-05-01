// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/token/RandomlyAllocated/RandomlyAllocated.sol)
// https://omnuslab.com/randomallocation

// RandomlyAllocated (Allocate the items in a fixed length collection, calling IceRing to randomly assign each ID.

pragma solidity ^0.8.13;

/**
*
* @dev RandomlyAllocated
*
* This contract extension allows the selection of items from a finite collection, each selection using the IceRing
* entropy source and removing the assigned item from selection. Intended for use with random token mints etc.
*
*/

import "@openzeppelin/contracts/utils/Context.sol";  
import "@omnus/contracts/entropy/IceRing.sol";

/**
*
* @dev Contract module which allows children to randomly allocated items from a decaying array.
* You must pass in:
* 1) The length of the collection you wish to select from (e.g. 1,000)
* 2) The IceRing contract address for this chain.
* 3) The ERC20Payable contract acting as relay.
* 
* The contract will pass back the item from the array that has been selected and remove that item from the array,
* hence you have a decaying list of items to select from.
*
*/

abstract contract RandomlyAllocated is Context, IceRing {

  // The parent array holds an index addressing each of the underlying 32 entry uint8 children arrays. The number of each
  // entry in the parentArray denotes how many times 32 we elevate the number in the child array when it is selected, with 
  // each child array running from 0 to 32 (one slot). For example, if we have parentArray 4 then every number in childArray
  // 4 is elevated by 4*32, position 0 in childArray 4 therefore representing number 128 (4 * 32 * 0)
  uint16[] public parentArray; 
  // Mapping of parentArray to childArray:
  mapping (uint16 => uint8[]) childArray;
  // Track pre-loading of child arrays, if being used:
  uint256 public remainingChildArraysToLoad;
  uint256 public continueLoadFromArray;
  
  uint256 public immutable entropyMode;
  
  // In theory this approach could handle a collection of 2,097,120 items. But as that would required 65,535 parentArray entries
  // we would need to load these items in batches. Set a notional parent array max size of 1,600 items, which gives a collection
  // max size of 51,200 (1,600 * 32):
  uint256 private constant COLLECTION_LIMIT = 51200; 
  // Each child array holds 32 items (1 slot wide):
  uint256 private constant CHILD_ARRAY_WIDTH = 32;
  // Max number of child arrays that can be loaded in one block
  uint16 private constant LOAD_LIMIT = 125;
  // Save a small amount of gas by holding these values as constants:
  uint256 private constant EXPONENT_18 = 10 ** 18;
  uint256 private constant EXPONENT_36 = 10 ** 36;

  /**
  *
  * @dev must be passed supply details, ERC20 payable contract and ice contract addresses, as well as entropy mode and fee (if any)
  *
  */
  constructor(uint16 _supply, address _ERC20SpendableContract, address _iceContract, uint256 _entropyMode, uint256 _ethFee, uint256 _oatFee)
    IceRing(_ERC20SpendableContract, _iceContract, _ethFee, _oatFee) {
    
    require(_supply < (COLLECTION_LIMIT + 1),"Max supply of 51,200");

    entropyMode = _entropyMode;

    uint256 numberOfParentEntries = _supply / CHILD_ARRAY_WIDTH;

    uint256 finalChildWidth = _supply % CHILD_ARRAY_WIDTH;

    // If the supply didn't divide perfectly by the child width we have a remainder child at the end. We will load this now
    // so that all subsequent child loads can safely assume a full width load:
    if (finalChildWidth != 0) {

      // Load the final child array now:
      uint8[] memory tempArray = new uint8[](finalChildWidth);

      for(uint8 i = 0; i < uint8(finalChildWidth);) {
        tempArray[i] = i;
        unchecked{ i++; }
      }

      // Set this as the final child array:
      childArray[uint16(numberOfParentEntries)] = tempArray;

      // Add one to the numberOfParentEntries to include the finalChild (as this will have been truncated off the calc above):
      numberOfParentEntries += 1;

    }

    // Now load the parent array:
    for(uint256 i = 0; i < numberOfParentEntries;) {
      parentArray.push(uint16(i));
      unchecked{ i++; }
    }

    remainingChildArraysToLoad = numberOfParentEntries;

    // Load complete, all set up and ready to go.
  }

  /**
  *
  * @dev View total remaining items left in the array
  *
  */
  function _remainingParentItems() external view returns(uint256) {
    return(parentArray.length);
  }

  /**
  *
  * @dev View parent array
  *
  */
  function _parentItemsArray() external view returns(uint16[] memory) {
    return(parentArray);
  }

  /**
  *
  * @dev View items array
  *
  */
  function _childItemsArray(uint16 _index) external view returns(uint8[] memory) {
    return(childArray[_index]);
  }

  /**
  *
  * @dev Allocate item from array:
  *
  */
  function _getItem(uint256 _accessMode) internal returns(uint256 allocatedItem_) { //mode: 0 = light, 1 = standard, 2 = heavy
    
    require(parentArray.length != 0, "ID allocation exhausted");

    // Retrieve a uint256 of entropy from IceRing. We will use separate parts of this entropy uint for number in range
    // calcs for array selection:
    uint256 entropy = _getEntropy(_accessMode);

    // First select the entry from the parent array, using the left most 18 entropy digits:
    uint16 parentIndex = uint16(((entropy % EXPONENT_18) * parentArray.length) / EXPONENT_18);

    uint16 parent = parentArray[parentIndex];

    // Check if we need to load the child (we will the first time it is accessed):
    if (childArray[parent].length == 0) {
      childArray[parent] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
    }

    // Select the item from the child array, using the a different 18 entropy digits, and add on the elevation factor from the parent:
    uint256 childIndex = (((entropy % EXPONENT_36) / EXPONENT_18) * childArray[parent].length) / EXPONENT_18;
    
    allocatedItem_ = uint256(childArray[parent][childIndex]) + (parent * CHILD_ARRAY_WIDTH);

    // Pop this item from the child array. First set the last item index:
    uint256 lastChildIndex = childArray[parent].length - 1;

    // When the item to remove from the array is the last item, the swap operation is unnecessary
    if (childIndex != lastChildIndex) {
      childArray[parent][childIndex] = childArray[parent][lastChildIndex];
    }

    // Remove the last position of the array:
    childArray[parent].pop();

    // Check if the childArray is no more:
    if (childArray[parent].length == 0) {
      // Remove the parent as the child allocation is exhausted. First set the last index:
      uint256 lastParentIndex = parentArray.length - 1;

      // When the item to remove from the array is the last item, the swap operation is unnecessary
      if (parentIndex != lastParentIndex) {
        parentArray[parentIndex] = parentArray[lastParentIndex];
      }

      parentArray.pop();

    }

    return(allocatedItem_);
  }

  /**
  *
  * @dev Retrieve Entropy
  *
  */
  function _getEntropy(uint256 _accessMode) internal returns(uint256 entropy_) { 
    
    // Access mode of 0 is direct access, ETH payment may be required:
    if (_accessMode == 0) { 
      if (entropyMode == 0) entropy_ = (_getEntropyETH(ENTROPY_LIGHT));
      else if (entropyMode == 1) entropy_ = (_getEntropyETH(ENTROPY_STANDARD));
      else if (entropyMode == 2) entropy_ = (_getEntropyETH(ENTROPY_HEAVY));
      else revert("Unrecognised entropy mode");
    }
    // Access mode of 0 is token relayed access, OAT payment may be required:
    else {
      if (entropyMode == 0) entropy_ = (_getEntropyOAT(ENTROPY_LIGHT));
      else if (entropyMode == 1) entropy_ = (_getEntropyOAT(ENTROPY_STANDARD));
      else if (entropyMode == 2) entropy_ = (_getEntropyOAT(ENTROPY_HEAVY));
      else revert("Unrecognised entropy mode");
    }

    return(entropy_);

  }

  /**
  *
  * @dev _loadChildren: Optional function that can be used to pre-load child arrays. This can be used to shift gas costs out of
  * execution by pre-loading some or all of the child arrays.
  *
  */
  function _loadChildren() internal {
    
    require(remainingChildArraysToLoad != 0, "Load complete");

    uint256 loadUntil;

    if (remainingChildArraysToLoad > LOAD_LIMIT) {
      loadUntil = continueLoadFromArray + LOAD_LIMIT;
      remainingChildArraysToLoad -= LOAD_LIMIT;
    }
    else {
      loadUntil = continueLoadFromArray + remainingChildArraysToLoad;
      remainingChildArraysToLoad = 0;
    }

    for(uint256 i = continueLoadFromArray; i < loadUntil;) {
      childArray[uint16(i)] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
      unchecked{ i++; }
    }

    continueLoadFromArray = loadUntil;

  }

}