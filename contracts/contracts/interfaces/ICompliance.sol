// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICompliance
 * @dev Interface for the Compliance component of ERC-3643 tokens
 */
interface ICompliance {
    // Events
    event TokenAgentAdded(address indexed agent);
    event TokenAgentRemoved(address indexed agent);
    event TokenBound(address indexed token);
    event TokenUnbound(address indexed token);

    /**
     * @dev Checks if a transfer is compliant
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _amount The amount to transfer
     * @return true if the transfer is compliant, false otherwise
     */
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);

    /**
     * @dev Called after a transfer to execute compliance-related operations
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _amount The amount that was transferred
     */
    function transferred(address _from, address _to, uint256 _amount) external;

    /**
     * @dev Called after a mint to execute compliance-related operations
     * @param _to The address that received minted tokens
     * @param _amount The amount that was minted
     */
    function created(address _to, uint256 _amount) external;

    /**
     * @dev Called after a burn to execute compliance-related operations
     * @param _from The address whose tokens were burned
     * @param _amount The amount that was burned
     */
    function destroyed(address _from, uint256 _amount) external;

    /**
     * @dev Checks if an address is an agent of the Compliance
     * @param _agent The address to check
     * @return true if the address is an agent, false otherwise
     */
    function isTokenAgent(address _agent) external view returns (bool);

    /**
     * @dev Adds a token agent
     * @param _agent The address to add as an agent
     */
    function addTokenAgent(address _agent) external;

    /**
     * @dev Removes a token agent
     * @param _agent The address to remove as an agent
     */
    function removeTokenAgent(address _agent) external;

    /**
     * @dev Binds a token to the compliance
     * @param _token The address of the token to bind
     */
    function bindToken(address _token) external;

    /**
     * @dev Unbinds a token from the compliance
     * @param _token The address of the token to unbind
     */
    function unbindToken(address _token) external;
} 