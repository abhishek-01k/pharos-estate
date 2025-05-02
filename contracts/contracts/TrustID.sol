// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title TrustID
 * @dev Decentralized identity and reputation management system
 */
contract TrustID is Ownable {
    using ECDSA for bytes32;

    // DID structure (Decentralized Identifier)
    struct Identity {
        address owner;
        string metadataURI;  // IPFS or other decentralized storage URI for profile data
        uint256 createdAt;
        uint256 updatedAt;
        bool active;
    }

    // Credential structure
    struct Credential {
        bytes32 id;
        address issuer;
        address subject;
        string credentialType;
        string metadataURI;  // Credential data stored in IPFS
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
    }

    // Reputation score structure
    struct ReputationScore {
        uint256 score;        // 0-1000 score representing reputation
        uint256 lastUpdated;
        mapping(string => uint256) categoryScores; // Specific scores for different categories
    }

    // Mapping from DID to Identity
    mapping(string => Identity) private _identities;
    
    // Mapping from DID to its credentials
    mapping(string => bytes32[]) private _identityCredentials;
    
    // Mapping from credential ID to Credential
    mapping(bytes32 => Credential) private _credentials;
    
    // Mapping from DID to its reputation score
    mapping(string => ReputationScore) private _reputationScores;

    // Events
    event IdentityCreated(string did, address indexed owner, string metadataURI);
    event IdentityUpdated(string did, string metadataURI);
    event IdentityTransferred(string did, address indexed previousOwner, address indexed newOwner);
    event IdentityDeactivated(string did);
    event IdentityReactivated(string did);
    
    event CredentialIssued(bytes32 indexed credentialId, address indexed issuer, address indexed subject, string credentialType);
    event CredentialRevoked(bytes32 indexed credentialId, address indexed revoker);
    
    event ReputationUpdated(string did, uint256 newScore, string category);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new identity
     * @param did Decentralized identifier (unique identifier for this identity)
     * @param metadataURI URI to the identity's metadata
     */
    function createIdentity(string calldata did, string calldata metadataURI) external {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(_identities[did].owner == address(0), "Identity already exists");
        
        _identities[did] = Identity({
            owner: msg.sender,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            active: true
        });
        
        // Initialize reputation with default values
        _reputationScores[did].score = 500; // Initial middle score
        _reputationScores[did].lastUpdated = block.timestamp;
        
        emit IdentityCreated(did, msg.sender, metadataURI);
    }
    
    /**
     * @dev Update an identity's metadata
     * @param did Decentralized identifier
     * @param metadataURI New URI to the identity's metadata
     */
    function updateIdentity(string calldata did, string calldata metadataURI) external {
        require(_identities[did].owner == msg.sender, "Not the identity owner");
        require(_identities[did].active, "Identity is not active");
        
        _identities[did].metadataURI = metadataURI;
        _identities[did].updatedAt = block.timestamp;
        
        emit IdentityUpdated(did, metadataURI);
    }
    
    /**
     * @dev Transfer identity ownership to a new address
     * @param did Decentralized identifier
     * @param newOwner Address of the new owner
     */
    function transferIdentity(string calldata did, address newOwner) external {
        require(_identities[did].owner == msg.sender, "Not the identity owner");
        require(newOwner != address(0), "New owner cannot be zero address");
        require(_identities[did].active, "Identity is not active");
        
        address previousOwner = _identities[did].owner;
        _identities[did].owner = newOwner;
        _identities[did].updatedAt = block.timestamp;
        
        emit IdentityTransferred(did, previousOwner, newOwner);
    }
    
    /**
     * @dev Deactivate an identity
     * @param did Decentralized identifier
     */
    function deactivateIdentity(string calldata did) external {
        require(_identities[did].owner == msg.sender, "Not the identity owner");
        require(_identities[did].active, "Identity is already deactivated");
        
        _identities[did].active = false;
        _identities[did].updatedAt = block.timestamp;
        
        emit IdentityDeactivated(did);
    }
    
    /**
     * @dev Reactivate an identity
     * @param did Decentralized identifier
     */
    function reactivateIdentity(string calldata did) external {
        require(_identities[did].owner == msg.sender, "Not the identity owner");
        require(!_identities[did].active, "Identity is already active");
        
        _identities[did].active = true;
        _identities[did].updatedAt = block.timestamp;
        
        emit IdentityReactivated(did);
    }
    
    /**
     * @dev Issue a credential to a subject
     * @param subject Address that will receive the credential
     * @param credentialType Type of credential (e.g. "KYC", "Education", etc.)
     * @param metadataURI URI to credential metadata
     * @param expiresAt Expiration timestamp (0 for no expiration)
     * @return credentialId The ID of the newly created credential
     */
    function issueCredential(
        address subject,
        string calldata subjectDid,
        string calldata credentialType,
        string calldata metadataURI,
        uint256 expiresAt
    ) external returns (bytes32 credentialId) {
        require(bytes(subjectDid).length > 0, "Subject DID cannot be empty");
        require(_identities[subjectDid].owner == subject, "Subject is not the owner of the DID");
        require(_identities[subjectDid].active, "Subject identity is not active");
        
        // Generate a unique credential ID
        credentialId = keccak256(
            abi.encodePacked(
                msg.sender,
                subject,
                credentialType,
                metadataURI,
                block.timestamp
            )
        );
        
        // Store the credential
        _credentials[credentialId] = Credential({
            id: credentialId,
            issuer: msg.sender,
            subject: subject,
            credentialType: credentialType,
            metadataURI: metadataURI,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false
        });
        
        // Add credential to identity's credentials list
        _identityCredentials[subjectDid].push(credentialId);
        
        emit CredentialIssued(credentialId, msg.sender, subject, credentialType);
        
        return credentialId;
    }
    
    /**
     * @dev Revoke a credential
     * @param credentialId ID of the credential to revoke
     */
    function revokeCredential(bytes32 credentialId) external {
        Credential storage credential = _credentials[credentialId];
        require(credential.issuer == msg.sender, "Not the credential issuer");
        require(!credential.revoked, "Credential already revoked");
        
        credential.revoked = true;
        
        emit CredentialRevoked(credentialId, msg.sender);
    }
    
    /**
     * @dev Update reputation score (only by authorized reputation providers)
     * @param did The DID to update
     * @param newScore New reputation score (0-1000)
     * @param category Category of reputation (e.g. "finance", "social", etc.)
     * @param categoryScore Category-specific score (0-1000)
     */
    function updateReputation(
        string calldata did,
        uint256 newScore,
        string calldata category,
        uint256 categoryScore
    ) external onlyOwner {
        require(_identities[did].active, "Identity is not active");
        require(newScore <= 1000, "Score must be between 0 and 1000");
        require(categoryScore <= 1000, "Category score must be between 0 and 1000");
        
        _reputationScores[did].score = newScore;
        _reputationScores[did].lastUpdated = block.timestamp;
        _reputationScores[did].categoryScores[category] = categoryScore;
        
        emit ReputationUpdated(did, newScore, category);
    }
    
    // View functions
    
    /**
     * @dev Get identity information
     * @param did The DID to query
     * @return owner The address that owns this identity
     * @return metadataURI URI pointing to additional data
     * @return createdAt When the identity was created
     * @return updatedAt When the identity was last updated
     * @return active Whether the identity is active
     */
    function getIdentity(string calldata did) external view returns (
        address owner,
        string memory metadataURI,
        uint256 createdAt,
        uint256 updatedAt,
        bool active
    ) {
        Identity storage identity = _identities[did];
        require(identity.owner != address(0), "Identity does not exist");
        
        return (
            identity.owner,
            identity.metadataURI,
            identity.createdAt,
            identity.updatedAt,
            identity.active
        );
    }
    
    /**
     * @dev Get credential information
     * @param credentialId The credential ID to query
     * @return id The unique identifier for the credential
     * @return issuer The address that issued the credential
     * @return subject The address that owns the credential
     * @return credentialType The type of credential
     * @return metadataURI URI pointing to the credential data
     * @return issuedAt When the credential was issued
     * @return expiresAt When the credential expires (0 for no expiration)
     * @return revoked Whether the credential has been revoked
     */
    function getCredential(bytes32 credentialId) external view returns (
        bytes32 id,
        address issuer,
        address subject,
        string memory credentialType,
        string memory metadataURI,
        uint256 issuedAt,
        uint256 expiresAt,
        bool revoked
    ) {
        Credential storage credential = _credentials[credentialId];
        require(credential.issuer != address(0), "Credential does not exist");
        
        return (
            credential.id,
            credential.issuer,
            credential.subject,
            credential.credentialType,
            credential.metadataURI,
            credential.issuedAt,
            credential.expiresAt,
            credential.revoked
        );
    }
    
    /**
     * @dev Verify if a credential is valid (not expired, not revoked)
     * @param credentialId The credential ID to verify
     * @return True if credential is valid
     */
    function verifyCredential(bytes32 credentialId) external view returns (bool) {
        Credential storage credential = _credentials[credentialId];
        
        // Check if credential exists
        if (credential.issuer == address(0)) return false;
        
        // Check if credential is revoked
        if (credential.revoked) return false;
        
        // Check if credential is expired
        if (credential.expiresAt > 0 && block.timestamp > credential.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get all credentials owned by an identity
     * @param did The DID to query
     * @return Array of credential IDs
     */
    function getIdentityCredentials(string calldata did) external view returns (bytes32[] memory) {
        return _identityCredentials[did];
    }
    
    /**
     * @dev Get reputation score
     * @param did The DID to query
     * @return score The overall reputation score
     * @return lastUpdated When the score was last updated
     */
    function getReputation(string calldata did) external view returns (uint256 score, uint256 lastUpdated) {
        ReputationScore storage reputation = _reputationScores[did];
        
        return (reputation.score, reputation.lastUpdated);
    }
    
    /**
     * @dev Get category-specific reputation score
     * @param did The DID to query
     * @param category The category to query
     * @return The category-specific score
     */
    function getCategoryReputation(string calldata did, string calldata category) external view returns (uint256) {
        return _reputationScores[did].categoryScores[category];
    }
} 