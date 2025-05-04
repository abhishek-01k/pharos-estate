// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./ONCHAINID.sol";

/**
 * @title IdentityRegistryStorage
 * @dev Contract to store identity-related data
 */
contract IdentityRegistryStorage is Initializable, OwnableUpgradeable {
    // Mapping between a wallet address and the corresponding identity contract
    mapping(address => address) private identities;
    
    // Mapping between a wallet address and its country code
    mapping(address => uint16) private countries;
    
    // Events
    event IdentityRegistered(address indexed account, address indexed identity);
    event IdentityRemoved(address indexed account, address indexed identity);
    event IdentityUpdated(address indexed account, address indexed oldIdentity, address indexed newIdentity);
    event CountryUpdated(address indexed account, uint16 indexed country);
    
    /**
     * @dev Initializes the contract
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }
    
    /**
     * @dev Registers an identity for an account
     * @param _account The account address
     * @param _identity The identity address
     */
    function registerIdentity(address _account, address _identity, uint16 _country) external onlyOwner {
        require(_account != address(0), "IdentityRegistryStorage: invalid account address");
        require(_identity != address(0), "IdentityRegistryStorage: invalid identity address");
        require(identities[_account] == address(0), "IdentityRegistryStorage: identity already registered");
        
        identities[_account] = _identity;
        countries[_account] = _country;
        
        emit IdentityRegistered(_account, _identity);
        emit CountryUpdated(_account, _country);
    }
    
    /**
     * @dev Removes an identity from an account
     * @param _account The account address
     */
    function deleteIdentity(address _account) external onlyOwner {
        require(_account != address(0), "IdentityRegistryStorage: invalid account address");
        require(identities[_account] != address(0), "IdentityRegistryStorage: identity not registered");
        
        address identity = identities[_account];
        
        delete identities[_account];
        delete countries[_account];
        
        emit IdentityRemoved(_account, identity);
    }
    
    /**
     * @dev Updates an identity for an account
     * @param _account The account address
     * @param _identity The new identity address
     */
    function updateIdentity(address _account, address _identity) external onlyOwner {
        require(_account != address(0), "IdentityRegistryStorage: invalid account address");
        require(_identity != address(0), "IdentityRegistryStorage: invalid identity address");
        require(identities[_account] != address(0), "IdentityRegistryStorage: identity not registered");
        
        address oldIdentity = identities[_account];
        identities[_account] = _identity;
        
        emit IdentityUpdated(_account, oldIdentity, _identity);
    }
    
    /**
     * @dev Updates the country code for an account
     * @param _account The account address
     * @param _country The new country code
     */
    function updateCountry(address _account, uint16 _country) external onlyOwner {
        require(_account != address(0), "IdentityRegistryStorage: invalid account address");
        require(identities[_account] != address(0), "IdentityRegistryStorage: identity not registered");
        
        countries[_account] = _country;
        
        emit CountryUpdated(_account, _country);
    }
    
    /**
     * @dev Retrieves the identity for an account
     * @param _account The account address
     * @return The identity address
     */
    function identity(address _account) external view returns (address) {
        return identities[_account];
    }
    
    /**
     * @dev Retrieves the country code for an account
     * @param _account The account address
     * @return The country code
     */
    function country(address _account) external view returns (uint16) {
        return countries[_account];
    }
}

/**
 * @title IdentityRegistry
 * @dev Implementation of the IIdentityRegistry interface
 */
contract IdentityRegistry is Initializable, OwnableUpgradeable, IIdentityRegistry {
    address private _trustedIssuersRegistry;
    address private _claimTopicsRegistry;
    address private _identityStorage;
    
    // Events
    event TrustedIssuersRegistrySet(address indexed trustedIssuersRegistry);
    event ClaimTopicsRegistrySet(address indexed claimTopicsRegistry);
    event IdentityStorageSet(address indexed identityStorage);
    
    /**
     * @dev Initializes the contract
     */
    function initialize(
        address trustedIssuersRegistry_,
        address claimTopicsRegistry_,
        address identityStorage_
    ) public initializer {
        __Ownable_init(msg.sender);
        
        require(trustedIssuersRegistry_ != address(0), "IdentityRegistry: invalid trusted issuers registry address");
        require(claimTopicsRegistry_ != address(0), "IdentityRegistry: invalid claim topics registry address");
        require(identityStorage_ != address(0), "IdentityRegistry: invalid identity storage address");
        
        _trustedIssuersRegistry = trustedIssuersRegistry_;
        _claimTopicsRegistry = claimTopicsRegistry_;
        _identityStorage = identityStorage_;
        
        emit TrustedIssuersRegistrySet(trustedIssuersRegistry_);
        emit ClaimTopicsRegistrySet(claimTopicsRegistry_);
        emit IdentityStorageSet(identityStorage_);
    }
    
    /**
     * @dev Registers an identity for an account
     * @param _account The account address
     * @param _identity The identity address
     */
    function registerIdentity(address _account, address _identity) external override onlyOwner {
        require(_account != address(0), "IdentityRegistry: invalid account address");
        require(_identity != address(0), "IdentityRegistry: invalid identity address");
        
        IdentityRegistryStorage(_identityStorage).registerIdentity(_account, _identity, 0);
    }
    
    /**
     * @dev Removes an identity from an account
     * @param _account The account address
     */
    function deleteIdentity(address _account) external override onlyOwner {
        require(_account != address(0), "IdentityRegistry: invalid account address");
        
        IdentityRegistryStorage(_identityStorage).deleteIdentity(_account);
    }
    
    /**
     * @dev Updates an identity for an account
     * @param _account The account address
     * @param _identity The new identity address
     */
    function updateIdentity(address _account, address _identity) external override onlyOwner {
        require(_account != address(0), "IdentityRegistry: invalid account address");
        require(_identity != address(0), "IdentityRegistry: invalid identity address");
        
        IdentityRegistryStorage(_identityStorage).updateIdentity(_account, _identity);
    }
    
    /**
     * @dev Checks if an identity has valid claims for all required topics
     * @param _identity The identity address
     * @return Whether the identity has valid claims for all required topics
     */
    function hasValidClaims(address _identity) public view returns (bool) {
        if (_identity == address(0)) {
            return false;
        }
        
        // Get required claim topics
        IClaimTopicsRegistry claimTopicsRegistry = IClaimTopicsRegistry(_claimTopicsRegistry);
        uint256[] memory claimTopics = claimTopicsRegistry.getClaimTopics();
        
        if (claimTopics.length == 0) {
            return true;
        }
        
        // Check trusted issuers registry
        ITrustedIssuersRegistry trustedIssuersRegistry = ITrustedIssuersRegistry(_trustedIssuersRegistry);
        address[] memory trustedIssuers = trustedIssuersRegistry.getTrustedIssuers();
        
        if (trustedIssuers.length == 0) {
            return false;
        }
        
        IONCHAINID identityContract = IONCHAINID(_identity);
        
        // Check if identity has valid claims for each topic from at least one trusted issuer
        for (uint256 i = 0; i < claimTopics.length; i++) {
            bool hasValidClaimForTopic = false;
            
            for (uint256 j = 0; j < trustedIssuers.length; j++) {
                if (trustedIssuersRegistry.hasClaimTopic(trustedIssuers[j], claimTopics[i])) {
                    bytes32[] memory claimIds = identityContract.getClaimIdsByTopic(claimTopics[i]);
                    
                    for (uint256 k = 0; k < claimIds.length; k++) {
                        try identityContract.getClaim(claimTopics[i], trustedIssuers[j]) returns (
                            uint256 topic,
                            uint256 scheme,
                            address issuer,
                            bytes memory signature,
                            bytes memory data,
                            string memory uri
                        ) {
                            if (issuer == trustedIssuers[j]) {
                                hasValidClaimForTopic = true;
                                break;
                            }
                        } catch {
                            continue;
                        }
                    }
                    
                    if (hasValidClaimForTopic) {
                        break;
                    }
                }
            }
            
            if (!hasValidClaimForTopic) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Checks if an account is verified with valid claims
     * @param _account The account address
     * @return Whether the account is verified
     */
    function isVerified(address _account) external view override returns (bool) {
        address identityAddress = identity(_account);
        return hasValidClaims(identityAddress);
    }
    
    /**
     * @dev Retrieves the identity for an account
     * @param _account The account address
     * @return The identity address
     */
    function identity(address _account) public view override returns (address) {
        return IdentityRegistryStorage(_identityStorage).identity(_account);
    }
    
    /**
     * @dev Retrieves the country code for an account
     * @param _account The account address
     * @return The country code
     */
    function investorCountry(address _account) external view override returns (uint16) {
        return IdentityRegistryStorage(_identityStorage).country(_account);
    }
    
    /**
     * @dev Sets the trusted issuers registry
     * @param _trustedIssuersRegistry The new trusted issuers registry address
     */
    function setTrustedIssuersRegistry(address _trustedIssuersRegistry) external onlyOwner {
        require(_trustedIssuersRegistry != address(0), "IdentityRegistry: invalid trusted issuers registry address");
        
        _trustedIssuersRegistry = _trustedIssuersRegistry;
        emit TrustedIssuersRegistrySet(_trustedIssuersRegistry);
    }
    
    /**
     * @dev Sets the claim topics registry
     * @param _claimTopicsRegistry The new claim topics registry address
     */
    function setClaimTopicsRegistry(address _claimTopicsRegistry) external onlyOwner {
        require(_claimTopicsRegistry != address(0), "IdentityRegistry: invalid claim topics registry address");
        
        _claimTopicsRegistry = _claimTopicsRegistry;
        emit ClaimTopicsRegistrySet(_claimTopicsRegistry);
    }
    
    /**
     * @dev Sets the identity storage
     * @param _identityStorage The new identity storage address
     */
    function setIdentityStorage(address _identityStorage) external onlyOwner {
        require(_identityStorage != address(0), "IdentityRegistry: invalid identity storage address");
        
        _identityStorage = _identityStorage;
        emit IdentityStorageSet(_identityStorage);
    }
    
    /**
     * @dev Retrieves the trusted issuers registry
     * @return The trusted issuers registry address
     */
    function trustedIssuersRegistry() external view override returns (address) {
        return _trustedIssuersRegistry;
    }
    
    /**
     * @dev Retrieves the claim topics registry
     * @return The claim topics registry address
     */
    function claimTopicsRegistry() external view override returns (address) {
        return _claimTopicsRegistry;
    }
    
    /**
     * @dev Retrieves the identity storage
     * @return The identity storage address
     */
    function identityStorage() external view override returns (address) {
        return _identityStorage;
    }
} 