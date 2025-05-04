// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IIdentityRegistry.sol";

/**
 * @title IERC3643
 * @dev Interface for ERC-3643 permissioned token standard for regulated securities
 */
interface IERC3643 is IERC20 {
    // Events
    event IdentityRegistryAdded(address indexed _identityRegistry);
    event ComplianceAdded(address indexed _compliance);
    event RecoverySuccess(address indexed _lostWallet, address indexed _newWallet, address indexed _investorOnchainID);
    event Paused(address indexed caller);
    event Unpaused(address indexed caller);
    event TokensFrozen(address indexed wallet, uint256 amount);
    event TokensUnfrozen(address indexed wallet, uint256 amount);
    event TokensForciblyTransferred(address indexed from, address indexed to, uint256 value, address indexed token);

    /**
     * @dev Returns the identity registry linked to the token
     * @return The identity registry contract address
     */
    function identityRegistry() external view returns (IIdentityRegistry);

    /**
     * @dev Returns the compliance contract linked to the token
     * @return The compliance contract address
     */
    function compliance() external view returns (address);

    /**
     * @dev Sets the identity registry for the token
     * @param _identityRegistry The address of the identity registry
     */
    function setIdentityRegistry(address _identityRegistry) external;

    /**
     * @dev Sets the compliance contract for the token
     * @param _compliance The address of the compliance contract
     */
    function setCompliance(address _compliance) external;

    /**
     * @dev Pauses the token, preventing transfers
     */
    function pause() external;

    /**
     * @dev Unpauses the token, enabling transfers
     */
    function unpause() external;

    /**
     * @dev Returns the paused status of the token
     * @return True if the token is paused, false otherwise
     */
    function paused() external view returns (bool);

    /**
     * @dev Recovers tokens from a lost wallet to a new wallet
     * @param _lostWallet The address of the lost wallet
     * @param _newWallet The address of the new wallet
     * @param _investorOnchainID The identity of the investor
     */
    function recoveryAddress(address _lostWallet, address _newWallet, address _investorOnchainID) external;

    /**
     * @dev Freezes tokens in a wallet
     * @param _userAddress The address of the wallet to freeze tokens in
     * @param _amount The amount of tokens to freeze
     */
    function freezeTokens(address _userAddress, uint256 _amount) external;

    /**
     * @dev Unfreezes tokens in a wallet
     * @param _userAddress The address of the wallet to unfreeze tokens in
     * @param _amount The amount of tokens to unfreeze
     */
    function unfreezeTokens(address _userAddress, uint256 _amount) external;

    /**
     * @dev Returns the amount of frozen tokens for a wallet
     * @param _userAddress The address of the wallet
     * @return The amount of frozen tokens
     */
    function getFrozenTokens(address _userAddress) external view returns (uint256);

    /**
     * @dev Forcibly transfers tokens from one wallet to another
     * @param _from The address to transfer tokens from
     * @param _to The address to transfer tokens to
     * @param _amount The amount of tokens to transfer
     */
    function forcedTransfer(address _from, address _to, uint256 _amount) external returns (bool);

    /**
     * @dev Mint tokens to a wallet
     * @param _to The address to mint tokens to
     * @param _amount The amount of tokens to mint
     */
    function mint(address _to, uint256 _amount) external;

    /**
     * @dev Burns tokens from a wallet
     * @param _userAddress The address to burn tokens from
     * @param _amount The amount of tokens to burn
     */
    function burn(address _userAddress, uint256 _amount) external;

    /**
     * @dev Sets the name of the token
     * @param _name The new name of the token
     */
    function setName(string calldata _name) external;

    /**
     * @dev Sets the symbol of the token
     * @param _symbol The new symbol of the token
     */
    function setSymbol(string calldata _symbol) external;

    /**
     * @dev Checks if a transfer is compliant
     * @param _from The address to transfer tokens from
     * @param _to The address to transfer tokens to
     * @param _amount The amount of tokens to transfer
     * @return True if the transfer is compliant, false otherwise
     */
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
} 