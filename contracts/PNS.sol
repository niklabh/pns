// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PNS is Ownable {
    // Mapping from name hash to owner address
    mapping(bytes32 => address) public nameOwner;
    
    // Mapping from name hash to resolver address
    mapping(bytes32 => address) public resolvers;
    
    // Mapping from name hash to registration timestamp
    mapping(bytes32 => uint256) public registrationTime;
    
    // Registration duration (1 year in seconds)
    uint256 public constant REGISTRATION_DURATION = 365 days;
    
    // Events
    event NameRegistered(string name, address indexed owner, uint256 timestamp);
    event NameTransferred(string name, address indexed oldOwner, address indexed newOwner);
    event ResolverUpdated(string name, address indexed resolver);

    constructor() {}

    // Generate name hash from string
    function getNameHash(string memory _name) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_name));
    }

    // Register a new name
    function register(string memory _name) external payable {
        bytes32 nameHash = getNameHash(_name);
        require(nameOwner[nameHash] == address(0), "Name already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        nameOwner[nameHash] = msg.sender;
        registrationTime[nameHash] = block.timestamp;
        
        emit NameRegistered(_name, msg.sender, block.timestamp);
    }

    // Transfer name ownership
    function transfer(string memory _name, address _newOwner) external {
        bytes32 nameHash = getNameHash(_name);
        require(nameOwner[nameHash] == msg.sender, "Not the name owner");
        require(_newOwner != address(0), "Invalid new owner");
        
        address oldOwner = nameOwner[nameHash];
        nameOwner[nameHash] = _newOwner;
        
        emit NameTransferred(_name, oldOwner, _newOwner);
    }

    // Set resolver for a name
    function setResolver(string memory _name, address _resolver) external {
        bytes32 nameHash = getNameHash(_name);
        require(nameOwner[nameHash] == msg.sender, "Not the name owner");
        require(_resolver != address(0), "Invalid resolver address");
        
        resolvers[nameHash] = _resolver;
        
        emit ResolverUpdated(_name, _resolver);
    }

    // Check if a name is available
    function isAvailable(string memory _name) external view returns (bool) {
        bytes32 nameHash = getNameHash(_name);
        return nameOwner[nameHash] == address(0);
    }

    // Get name owner
    function getOwner(string memory _name) external view returns (address) {
        return nameOwner[getNameHash(_name)];
    }

    // Get name resolver
    function getResolver(string memory _name) external view returns (address) {
        return resolvers[getNameHash(_name)];
    }

    // Check if registration has expired
    function isExpired(string memory _name) external view returns (bool) {
        bytes32 nameHash = getNameHash(_name);
        return block.timestamp > registrationTime[nameHash] + REGISTRATION_DURATION;
    }
}
