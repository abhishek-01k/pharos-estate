// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TrustID.sol";

/**
 * @title TrustIDFactory
 * @dev Factory contract for creating and registering DIDs
 */
contract TrustIDFactory {
    TrustID public trustId;
    
    // Mapping to track DID ownership for resolving name collisions
    mapping(string => address) public didRegistry;
    
    // Events
    event IdentityCreated(string did, address indexed owner, string metadataURI);
    
    constructor(address trustIdAddress) {
        trustId = TrustID(trustIdAddress);
    }
    
    /**
     * @dev Create a new identity with standard DID format
     * @param username Desired username
     * @param metadataURI URI to the identity's metadata
     * @return did The created DID
     */
    function createIdentity(string calldata username, string calldata metadataURI) external returns (string memory did) {
        // Ensure username is valid
        require(bytes(username).length > 0, "Username cannot be empty");
        
        // Format the DID as did:rsk:username
        did = string(abi.encodePacked("did:rsk:", username));
        
        // Check if DID already registered
        require(didRegistry[did] == address(0), "DID already registered");
        
        // Register the DID in our registry
        didRegistry[did] = msg.sender;
        
        // Create the identity in the TrustID contract
        trustId.createIdentity(did, metadataURI);
        
        emit IdentityCreated(did, msg.sender, metadataURI);
        
        return did;
    }
    
    /**
     * @dev Create a new identity with a completely custom DID
     * @param did Custom DID
     * @param metadataURI URI to the identity's metadata
     */
    function createCustomIdentity(string calldata did, string calldata metadataURI) external {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(didRegistry[did] == address(0), "DID already registered");
        
        // Register the DID in our registry
        didRegistry[did] = msg.sender;
        
        // Create the identity in the TrustID contract
        trustId.createIdentity(did, metadataURI);
        
        emit IdentityCreated(did, msg.sender, metadataURI);
    }
    
    /**
     * @dev Check if a DID is available
     * @param did DID to check
     * @return True if available, false if taken
     */
    function isDIDAvailable(string calldata did) external view returns (bool) {
        return didRegistry[did] == address(0);
    }
    
    /**
     * @dev Check if a username is available
     * @param username Username to check
     * @return True if available, false if taken
     */
    function isUsernameAvailable(string calldata username) external view returns (bool) {
        string memory did = string(abi.encodePacked("did:rsk:", username));
        return didRegistry[did] == address(0);
    }
} 