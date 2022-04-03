// SPDX-License-Identifier: MIT
// Omnus Contracts (contracts/entropy/Ice.sol)

// ICE (In Chain Entropy)

pragma solidity ^0.8.13;

/**
  * @dev ICE - In-Chain Entropy
  *
  * This protocol is intended as a way to generate in-chain randomness (OK, ON-chain not in-chain, but that didn't make a cool acronym...).
  * Solidity and blockchains are deterministic, so standard warnings apply, this produces pseudorandomness. For very strict levels of 
  * randomness the answer remains to go off-chain, but that carries a cost and also introduces an off-chain dependency that could fail or,
  * worse, some day be tampered with or become vulnerable. 
  * 
  * The core premise of this protocol is that we aren't chasing true random (does that even exist? Philosophers - go!). What we are chasing 
  * is a source or sources of entropy that are unpredictable in that they can't practically be controlled by a single entity.
  *
  * A key source of entropy in this protocol is contract balances, namely the balances of contracts that change with every block. Think large 
  * value wallets, like exchange wallets. We store a list of these contract addresses and every request combines the eth value of these addresses
  * with the current block time and a modulo and hashes it. 
  * 
  * Block.timestamp has been used as entropy before, but it has a significant drawback in that it can be controlled by miners. If the incentive is
  * high enough a miner could look to control the outcome by controlling the timestamp. 
  * 
  * When we add into this a variable contract balance we require a single entity be able to control both the block.timestamp and, for example, the 
  * eth balance of a binance hot wallet. In the same block. To make it even harder, we loop through our available entropy sources, so the one that
  * a transaction uses depends on where in the order we are, which depends on any other txns using this protocol before it. So to be sure of the 
  * outcome an entity needs to control the block.timestamp, either control other txns using this in the block or make sure it's the first txn in 
  * the block, control the balance of another parties wallet than changes with every block, then be able to hash those known variables to see if the
  * outcome is a positive one for them. Whether any entity could achieve that is debatable, but you would imagine that would come at significant cost.
  *
  *
  *                                                             D I S C L A I M E R
  *                                                             ===================    
  *                   Use at your own risk, obvs. I've tried hard to make this good quality entropy, but whether random exists is
  *                   a question for philosophers not solidity devs. If there is a lot at stake on whatever it is you are doing 
  *                   please DYOR on what option is best for you. There are no guarantees the entropy seeds here will be maintained
  *                   (I mean, no one might ever use this). No liability is accepted etc.
  */

import "@openzeppelin/contracts/access/Ownable.sol";  
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IIce.sol";    
import "../storage/OmStorage.sol"; 
import "../token/ERC20Spendable/ERC20SpendableReceiver.sol"; 

contract Ice is Ownable, OmStorage, ERC20SpendableReceiver, IIce { 
  using SafeERC20 for IERC20;
  
  mapping (uint256 => address) entropyItem;

  constructor(address _ERC20Spendable)
    ERC20SpendableReceiver(_ERC20Spendable)
    OmStorage(3, 3, 8, 49, 12, 0, 0, 0, 0, 0, 0, 0) {
    encodeNus(0, 0, 10000000, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }

  function receiveSpendableERC20(address, uint256 _tokenPaid, uint256[] memory _arguments) override external onlyERC20Spendable(msg.sender) returns(bool, uint256[] memory) { 
    uint256 fee = getOm05();

    if (fee != 0) {
      require(_tokenPaid == fee, "Incorrect ERC20 payment");
    }

    uint256[] memory returnResults = new uint256[](1);

    // Number in range request, send with light / normal / heavy designation:
    if (_arguments[0] == 0) {
      returnResults[0] = getNumberInRangeLight(_arguments[1]); 
      return(true, returnResults);
    }
    if (_arguments[0] == 1) {
      returnResults[0] = getNumberInRange(_arguments[1]); 
      return(true, returnResults);
    }

    if (_arguments[0] == 2) {
      returnResults[0] = getNumberInRangeHeavy(_arguments[1]); 
      return(true, returnResults);
    }

    // Standard entropy request, send with light / normal / heavy designation:
    if (_arguments[0] == 3) {
      returnResults[0] = getEntropyLight(); 
      return(true, returnResults);
    }
    if (_arguments[0] == 4) {
      returnResults[0] = getEntropy(); 
      return(true, returnResults);
    }

    if (_arguments[0] == 5) {
      returnResults[0] = getEntropyHeavy(); 
      return(true, returnResults);
    }  

    return(false, returnResults);
  }

  /**
  * @dev View details of a given entropy seed address:
  */
  function viewEntropyAddress(uint256 _index) external view returns (address entropyAddress) {
    return (entropyItem[_index]) ;
  }
  
  /**
  * @dev Owner can add entropy seed address:
  */
  function addEntropy(address _entropyAddress) external onlyOwner {
    (uint256 seed, uint256 counter, uint256 modulo, address seedAddress) = getOmValues(); 
    counter += 1;
    entropyItem[counter] = _entropyAddress;
    seedAddress = _entropyAddress;
    emit EntropyAdded(_entropyAddress);
    encodeNus(seed, counter, modulo, uint256(uint160(seedAddress)), 0, 0, 0, 0, 0, 0, 0, 0);
  }

  /**
  * @dev Owner can update entropy seed address:
  */
  function updateEntropy(uint256 _index, address _newAddress) external onlyOwner {
    address oldEntropyAddress = entropyItem[_index];
    entropyItem[_index] = _newAddress;
    emit EntropyUpdated(_index, _newAddress, oldEntropyAddress); 
  }

  /**
  * @dev Owner can clear the list to start again:
  */
  function deleteAllEntropy() external onlyOwner {
    (uint256 seed, uint256 counter, uint256 modulo, address seedAddress) = getOmValues();
    require(counter > 0, "No entropy defined");
    for (uint i = 1; i <= counter; i++){
        delete entropyItem[i];
    }
    counter = 0;
    seedAddress = address(0);
    encodeNus(seed, counter, modulo, uint256(uint160(seedAddress)), 0, 0, 0, 0, 0, 0, 0, 0);
    emit EntropyCleared();
  }

  /**
  * @dev Owner can updte the fee
  */
  function updateFee(uint256 _fee) external onlyOwner {
    (uint256 seed, uint256 counter, uint256 modulo, address seedAddress) = getOmValues(); 
    uint256 oldFee = getOm05();
    encodeNus(seed, counter, modulo, uint256(uint160(seedAddress)), _fee, 0, 0, 0, 0, 0, 0, 0);
    emit FeeUpdated(oldFee, _fee);
  }

  /**
  * @dev Create hash of entropy seeds:
  */
  function _hashEntropy(bool _lightMode) internal returns(uint256 hashedEntropy_){
    
    (uint256 seed, uint256 counter, uint256 modulo, address seedAddress) = getOmValues();
    
    if (modulo >= 99999999) {
      modulo = 10000000;
    }  
    else {
      modulo = modulo + 1; 
    } 

    if (_lightMode) {
      hashedEntropy_ = (uint256(keccak256(abi.encode(seedAddress.balance + (block.timestamp % modulo)))));
    }
    else {
      if (seed >= counter) {
      seed = 1;
      }  
      else {
        seed = seed + 1; 
      } 
      address rotatingSeedAddress = entropyItem[seed];
      uint256 seedAddressBalance = rotatingSeedAddress.balance;
      hashedEntropy_ = (uint256(keccak256(abi.encode(seedAddressBalance, (block.timestamp % modulo)))));
      emit EntropyServed(rotatingSeedAddress, seedAddressBalance, block.timestamp, modulo, hashedEntropy_); 
    }         

    encodeNus(seed, counter, modulo, uint256(uint160(seedAddress)), 0, 0, 0, 0, 0, 0, 0, 0);
      
    return(hashedEntropy_);
  }

  
  /**
  * @dev Find the number within a range:
  */
  function _numberInRange(uint256 _upperBound, bool _lightMode) internal returns(uint256 numberWithinRange){
    return((((_hashEntropy(_lightMode) % 10 ** 18) * _upperBound) / (10 ** 18)) + 1);
  }

  /**
  * @dev Get OM values from the NUS
  */
  function getOmValues() public view returns(uint256 seedIndex_, uint256 counter_, uint256 modulo_, address seedAddress_){
    seedIndex_ = getOm01();  
    counter_   =  getOm02(); 
    modulo_    =  getOm03();
    seedAddress_ = address(uint160(getOm04()));
    return(seedIndex_, counter_, modulo_, seedAddress_);
  }

  /**
  * @dev Return a full uint256 of entropy:
  */
  function getEntropy() internal returns(uint256 entropy_){
    entropy_ = _hashEntropy(false); 
    return(entropy_);
  }

  /**
  * @dev Return a full uint256 of entropy - light mode. Light mode uses the most recent added seed address which is stored
  * in the control integer. This avoids another read from storage at the cost of not cycling through multiple entropy
  * sources. The normal (non-light) version increments through the seed mapping.
  */
  function getEntropyLight() internal returns(uint256 entropy_){
    entropy_ = _hashEntropy(true); 
    return(entropy_);
  }

  /**
  * @dev Return a full uint256 of entropy - heavy mode. Heavy mode looks to maximise the number of sources of entropy that an
  * entity would need to control in order to predict an outome. It creates a hash of all our entropy sources, 1 to n, hashed with
  * the block.timestamp altered by an increasing modulo.
  */
  function getEntropyHeavy() internal returns(uint256 entropy_){
    uint256 counter =  getOm02();
    
    uint256 loopEntropy;

    for (uint i = 1; i <= counter; i++){
      loopEntropy = _hashEntropy(false); 
      entropy_ = (uint256(keccak256(abi.encode(entropy_, loopEntropy))));
    }
    return(entropy_);
  }

  /**
  * @dev Return a number within a range (1 to upperBound):
  */
  function getNumberInRange(uint256 upperBound) internal returns(uint256 numberInRange_){
    numberInRange_ = _numberInRange(upperBound, false);
    return(numberInRange_);
  }

  /**
  * @dev Return a number within a range (1 to upperBound) - light mode. Light mode uses the most recent added seed address which is stored
  * in Om Storage. This avoids another read from storage at the cost of not cycling through multiple entropy
  * sources. The normal (non-light) version increments through the seed mapping.
  */
  function getNumberInRangeLight(uint256 upperBound) internal returns(uint256 numberInRange_){
    numberInRange_ = _numberInRange(upperBound, true);
    return(numberInRange_);
  }

  /**
  * @dev Return a number within a range (1 to upperBound) - heavy mode.
  */
  function getNumberInRangeHeavy(uint256 upperBound) internal returns(uint256 numberInRange_){
    numberInRange_ = ((((getEntropyHeavy() % 10 ** 18) * upperBound) / (10 ** 18)) + 1);
    return(numberInRange_);
  }

  /**
  * @dev Validate proof:
  */
  function validateProof(uint256 _seedValue, uint256 _modulo, uint256 _timeStamp, uint256 _entropy) external pure returns(bool valid){
    if (uint256(keccak256(abi.encode(_seedValue, (_timeStamp % _modulo)))) == _entropy) return true;
    else return false;
  }

  /**
  * @dev Allow any token payments to be withdrawn:
  */
  function withdrawERC20(IERC20 _token, uint256 _amountToWithdraw) public onlyOwner {
    _token.safeTransfer(msg.sender, _amountToWithdraw); 
  }

  /**
  * @dev Repeat last entropy:
  */
  function repeatLastGetEntropy() public view returns(uint256 entropy_){
    uint256 seed = getOm01();
    uint256 modulo = getOm03();  
    address rotatingSeedAddress = entropyItem[seed];
    uint256 seedAddressBalance = rotatingSeedAddress.balance;
    return(uint256(keccak256(abi.encode(seedAddressBalance, (block.timestamp % modulo)))));
  }

  /**
  * @dev Repeat last light entropy
  */
  function repeatLastGetEntropyLight() public view returns(uint256 entropy_){
    uint256 modulo = getOm03();
    address seedAddress_ = address(uint160(getOm04()));
    return(uint256(keccak256(abi.encode(seedAddress_.balance + (block.timestamp % modulo)))));
  }

  /**
  * @dev Repeat last heavy entropy
  */
  function repeatLastGetEntropyHeavy() public view returns(uint256 entropy_){
    uint256 seed = getOm01();
    uint256 counter = getOm02();
    uint256 modulo = getOm03();  
    uint256 loopEntropy;
    address rotatingSeedAddress = entropyItem[seed];
    uint256 seedAddressBalance = rotatingSeedAddress.balance;

    for (uint i = 1; i <= counter; i++){
      loopEntropy = (uint256(keccak256(abi.encode(seedAddressBalance, (block.timestamp % modulo)))));
      entropy_ = (uint256(keccak256(abi.encode(entropy_, loopEntropy))));
    }

    return(entropy_);
  }

  /**
  * @dev Repeat last number in range:
  */
  function repeatLastGetNumberInRange(uint256 _upperBound) external view returns(uint256 entropy_){
    return((((repeatLastGetEntropy() % 10 ** 18) * _upperBound) / (10 ** 18)) + 1);
  }

  /**
  * @dev Repeat last light number in range
  */
  function repeatLastGetNumberInRangeLight(uint256 _upperBound) external view returns(uint256 entropy_){
    return((((repeatLastGetEntropyLight() % 10 ** 18) * _upperBound) / (10 ** 18)) + 1);
  }
  
  /**
  * @dev Repeat last light number in range
  */
  function repeatLastGetNumberInRangeHeavy(uint256 _upperBound) external view returns(uint256 entropy_){
    return((((repeatLastGetEntropyHeavy() % 10 ** 18) * _upperBound) / (10 ** 18)) + 1);
  }
}