// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/extensions/IceTestImplementer.sol)

pragma solidity ^0.8.13;

import "./IceRing.sol";

contract IceTestImplementer is IceRing {

  constructor(address _oatContract, address _iceContract) 
    IceRing(_oatContract, _iceContract)
  {}

  function getNumberInRangeLight(uint256 _upperBound, uint256 _fee) external returns(uint256 numberInRange_) {
    return(_getNumberInRangeLight(_upperBound, _fee));
  }

  function getNumberInRangeStandard(uint256 _upperBound, uint256 _fee) external returns(uint256 numberInRange_) {
    return(_getNumberInRangeStandard(_upperBound, _fee));
  }

  function getNumberInRangeHeavy(uint256 _upperBound, uint256 _fee) external returns(uint256 numberInRange_) {
    return(_getNumberInRangeHeavy(_upperBound, _fee));
  }

  function getEntropyLight(uint256 _fee) external returns(uint256 numberInRange_) {
    return(_getFullEntropyLight(_fee));
  }

  function getEntropyStandard(uint256 _fee) external returns(uint256 numberInRange_) {
    return(_getFullEntropyStandard(_fee));
  }

  function getEntropyHeavy(uint256 _fee) external returns(uint256 numberInRange_) {
    return(_getFullEntropyHeavy(_fee));
  }

}