// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ONCHAINID Interface
 * @dev Interface for the ONCHAINID identity contract required by ERC-3643
 */
interface IONCHAINID {
    /**
     * @dev Returns the keys of a claim type.
     * @param _claimType The claim type to query.
     * @return The keys of the claim type.
     */
    function keys(uint256 _claimType) external view returns (bytes32[] memory);

    /**
     * @dev Checks if a claim exists for a given key.
     * @param _key The key to check.
     * @return Whether the claim exists or not.
     */
    function keyHasPurpose(bytes32 _key, uint256 _purpose) external view returns (bool);

    /**
     * @dev Gets the claim data for a given claim type issued by a specific issuer.
     * @param _claimType The claim type to query.
     * @param _issuer The address of the issuer.
     * @return topic The claim topic
     * @return scheme The scheme used to verify the claim
     * @return issuer The issuer of the claim
     * @return signature The signature of the claim
     * @return data The claim data
     * @return uri The URI for the claim
     */
    function getClaim(uint256 _claimType, address _issuer) external view returns (
        uint256 topic,
        uint256 scheme,
        address issuer,
        bytes memory signature,
        bytes memory data,
        string memory uri
    );

    /**
     * @dev Gets all claims of a specific type.
     * @param _claimType The claim type to query.
     * @return A list of claims for the claim type.
     */
    function getClaimIdsByTopic(uint256 _claimType) external view returns (bytes32[] memory);

    /**
     * @dev Adds a claim to the identity.
     * @param _topic The claim topic.
     * @param _scheme The scheme used to verify the claim.
     * @param _issuer The issuer of the claim.
     * @param _signature The signature of the claim.
     * @param _data The claim data.
     * @param _uri The URI for the claim.
     * @return The ID of the claim.
     */
    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes calldata _signature,
        bytes calldata _data,
        string calldata _uri
    ) external returns (bytes32);

    /**
     * @dev Removes a claim from the identity.
     * @param _claimId The ID of the claim to remove.
     * @return The success status of the operation.
     */
    function removeClaim(bytes32 _claimId) external returns (bool);

    /**
     * @dev Adds a key to the identity.
     * @param _key The key to add.
     * @param _purpose The purpose of the key.
     * @param _keyType The type of the key.
     * @return The success status of the operation.
     */
    function addKey(bytes32 _key, uint256 _purpose, uint256 _keyType) external returns (bool);

    /**
     * @dev Removes a key from the identity.
     * @param _key The key to remove.
     * @return The success status of the operation.
     */
    function removeKey(bytes32 _key) external returns (bool);

    /**
     * @dev Executes an action on behalf of the identity.
     * @param _to The address to which the action is directed.
     * @param _value The value to be sent.
     * @param _data The data for the action.
     * @return The result of the execution.
     */
    function execute(address _to, uint256 _value, bytes calldata _data) external returns (bytes memory);
}

/**
 * @title Identity Registry Interface
 * @dev Interface for the Identity Registry required by ERC-3643
 */
interface IIdentityRegistry {
    /**
     * @dev Registers an identity to the registry.
     * @param _account The account address of the identity.
     * @param _identity The ONCHAINID address of the identity.
     */
    function registerIdentity(address _account, address _identity) external;

    /**
     * @dev Removes an identity from the registry.
     * @param _account The account address of the identity to remove.
     */
    function deleteIdentity(address _account) external;

    /**
     * @dev Checks if an identity is registered.
     * @param _account The account address to check.
     * @return Whether the identity is registered or not.
     */
    function isVerified(address _account) external view returns (bool);

    /**
     * @dev Gets the ONCHAINID address of an identity.
     * @param _account The account address to query.
     * @return The ONCHAINID address.
     */
    function identity(address _account) external view returns (address);

    /**
     * @dev Gets the country code of an identity.
     * @param _account The account address to query.
     * @return The country code.
     */
    function investorCountry(address _account) external view returns (uint16);

    /**
     * @dev Updates an identity in the registry.
     * @param _account The account address of the identity.
     * @param _identity The new ONCHAINID address of the identity.
     */
    function updateIdentity(address _account, address _identity) external;

    /**
     * @dev Gets the trusted issuers registry.
     * @return The address of the trusted issuers registry.
     */
    function trustedIssuersRegistry() external view returns (address);

    /**
     * @dev Gets the claim topics registry.
     * @return The address of the claim topics registry.
     */
    function claimTopicsRegistry() external view returns (address);

    /**
     * @dev Gets the identity storage.
     * @return The address of the identity storage.
     */
    function identityStorage() external view returns (address);
}

/**
 * @title Trusted Issuers Registry Interface
 * @dev Interface for the Trusted Issuers Registry required by ERC-3643
 */
interface ITrustedIssuersRegistry {
    /**
     * @dev Adds a trusted issuer to the registry.
     * @param _issuer The address of the issuer.
     * @param _claimTopics The claim topics supported by the issuer.
     */
    function addTrustedIssuer(address _issuer, uint256[] calldata _claimTopics) external;

    /**
     * @dev Removes a trusted issuer from the registry.
     * @param _issuer The address of the issuer to remove.
     */
    function removeTrustedIssuer(address _issuer) external;

    /**
     * @dev Updates the claim topics of a trusted issuer.
     * @param _issuer The address of the issuer.
     * @param _claimTopics The new claim topics supported by the issuer.
     */
    function updateIssuerClaimTopics(address _issuer, uint256[] calldata _claimTopics) external;

    /**
     * @dev Checks if an issuer is trusted.
     * @param _issuer The address of the issuer to check.
     * @return Whether the issuer is trusted or not.
     */
    function isTrustedIssuer(address _issuer) external view returns (bool);

    /**
     * @dev Gets the claim topics of a trusted issuer.
     * @param _issuer The address of the issuer.
     * @return The claim topics supported by the issuer.
     */
    function getTrustedIssuerClaimTopics(address _issuer) external view returns (uint256[] memory);

    /**
     * @dev Checks if an issuer has a specific claim topic.
     * @param _issuer The address of the issuer.
     * @param _claimTopic The claim topic to check.
     * @return Whether the issuer has the claim topic or not.
     */
    function hasClaimTopic(address _issuer, uint256 _claimTopic) external view returns (bool);

    /**
     * @dev Gets the trusted issuers.
     * @return The addresses of the trusted issuers.
     */
    function getTrustedIssuers() external view returns (address[] memory);
}

/**
 * @title Claim Topics Registry Interface
 * @dev Interface for the Claim Topics Registry required by ERC-3643
 */
interface IClaimTopicsRegistry {
    /**
     * @dev Adds a claim topic to the registry.
     * @param _claimTopic The claim topic to add.
     */
    function addClaimTopic(uint256 _claimTopic) external;

    /**
     * @dev Removes a claim topic from the registry.
     * @param _claimTopic The claim topic to remove.
     */
    function removeClaimTopic(uint256 _claimTopic) external;

    /**
     * @dev Gets the claim topics.
     * @return The claim topics.
     */
    function getClaimTopics() external view returns (uint256[] memory);
} 