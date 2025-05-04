// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Identity Registry Interface
 * @dev Interface for the Identity Registry contract based on ERC-3643 standard
 * This contract manages the identities that are eligible to hold tokens
 */
interface IIdentityRegistry {
    // Events
    event IdentityRegistered(address indexed investorAddress, address indexed identity);
    event IdentityRemoved(address indexed investorAddress, address indexed identity);
    event CountryUpdated(address indexed investorAddress, uint16 indexed country);
    event IdentityStorageSet(address indexed identityStorage);
    event TrustedIssuersRegistrySet(address indexed trustedIssuersRegistry);
    event ClaimTopicsRegistrySet(address indexed claimTopicsRegistry);

    /**
     * @dev Returns the identity associated with an investor address
     * @param _userAddress The address of the investor
     * @return The address of the identity contract for the investor
     */
    function identity(address _userAddress) external view returns (address);

    /**
     * @dev Returns the country code of an investor
     * @param _userAddress The address of the investor
     * @return The country code of the investor
     */
    function investorCountry(address _userAddress) external view returns (uint16);

    /**
     * @dev Registers an identity for an investor
     * @param _userAddress The address of the investor
     * @param _identity The address of the identity contract
     * @param _country The country code of the investor
     */
    function registerIdentity(
        address _userAddress,
        address _identity,
        uint16 _country
    ) external;

    /**
     * @dev Updates the identity of an investor
     * @param _userAddress The address of the investor
     * @param _identity The new identity address
     */
    function updateIdentity(address _userAddress, address _identity) external;

    /**
     * @dev Updates the country of an investor
     * @param _userAddress The address of the investor
     * @param _country The new country code
     */
    function updateCountry(address _userAddress, uint16 _country) external;

    /**
     * @dev Removes an identity from the registry
     * @param _userAddress The address of the investor to remove
     */
    function deleteIdentity(address _userAddress) external;

    /**
     * @dev Checks if an investor can hold tokens
     * @param _userAddress The address of the investor
     * @return True if the investor can hold tokens, false otherwise
     */
    function isVerified(address _userAddress) external view returns (bool);

    /**
     * @dev Returns the address of the claim topics registry
     * @return The address of the claim topics registry
     */
    function claimTopicsRegistry() external view returns (address);

    /**
     * @dev Returns the address of the trusted issuers registry
     * @return The address of the trusted issuers registry
     */
    function trustedIssuersRegistry() external view returns (address);

    /**
     * @dev Returns the address of the identity storage
     * @return The address of the identity storage
     */
    function identityStorage() external view returns (address);

    /**
     * @dev Sets the address of the claim topics registry
     * @param _claimTopicsRegistry The address of the claim topics registry
     */
    function setClaimTopicsRegistry(address _claimTopicsRegistry) external;

    /**
     * @dev Sets the address of the trusted issuers registry
     * @param _trustedIssuersRegistry The address of the trusted issuers registry
     */
    function setTrustedIssuersRegistry(address _trustedIssuersRegistry) external;

    /**
     * @dev Sets the address of the identity storage
     * @param _identityStorage The address of the identity storage
     */
    function setIdentityStorage(address _identityStorage) external;
} 