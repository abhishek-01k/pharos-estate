// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./ONCHAINID.sol";

/**
 * @title ERC3643Token
 * @dev Implementation of a token compliant with the ERC-3643 standard (T-REX)
 */
contract ERC3643Token is
    Initializable,
    ERC20Upgradeable,
    ERC20PausableUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    // Identity Registry
    IIdentityRegistry public identityRegistry;

    // Token details
    string public propertyAddress;
    uint256 public propertyValue;
    uint256 public lastValuationDate;
    string public propertyDocumentURI;
    
    // Dynamic Tokenization metrics
    uint256 public occupancyRate; // in basis points (100% = 10000)
    uint256 public propertyYield; // annual yield in basis points
    
    // Income distribution
    uint256 public totalRentalIncome;
    uint256 public lastDistributionDate;
    mapping(address => uint256) public unclaimedRentalIncome;
    
    // Token recovery
    mapping(address => bool) public recoveryAddresses;
    uint256 public constant RECOVERY_ADDRESS_COUNT = 2;
    mapping(address => mapping(address => bool)) public recoveryRequests;
    
    // Agent roles
    mapping(address => bool) public isAgent;
    
    // Events
    event PropertyValuationUpdated(uint256 newValue, uint256 timestamp);
    event RentalIncomeReceived(uint256 amount, uint256 timestamp);
    event RentalIncomeDistributed(uint256 amount, uint256 timestamp);
    event RecoveryAddressAdded(address recoveryAddress);
    event RecoveryAddressRemoved(address recoveryAddress);
    event RecoveryRequested(address lostAddress, address recoveryAddress);
    event AccountRecovered(address lostAddress, address newAddress);
    event AgentAdded(address agent);
    event AgentRemoved(address agent);
    event IdentityRegistryUpdated(address indexed identityRegistry);
    event OccupancyRateUpdated(uint256 newRate);
    event PropertyYieldUpdated(uint256 newYield);
    
    /**
     * @dev Modifier to allow only verified addresses
     */
    modifier onlyVerified(address _address) {
        require(identityRegistry.isVerified(_address), "ERC3643Token: address is not verified");
        _;
    }
    
    /**
     * @dev Modifier for agent only functions
     */
    modifier onlyAgent() {
        require(isAgent[msg.sender] || msg.sender == owner(), "ERC3643Token: caller is not an agent");
        _;
    }
    
    /**
     * @dev Initializes the contract
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _propertyAddress,
        uint256 _propertyValue,
        string memory _propertyDocumentURI,
        address _identityRegistryAddress
    ) public initializer {
        __ERC20_init(_name, _symbol);
        __ERC20Pausable_init();
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        
        propertyAddress = _propertyAddress;
        propertyValue = _propertyValue;
        lastValuationDate = block.timestamp;
        propertyDocumentURI = _propertyDocumentURI;
        
        // Set the identity registry
        require(_identityRegistryAddress != address(0), "ERC3643Token: identity registry cannot be zero address");
        identityRegistry = IIdentityRegistry(_identityRegistryAddress);
        
        // Default values
        occupancyRate = 10000; // 100%
        propertyYield = 500; // 5%
        
        // Add the contract owner as an agent
        isAgent[msg.sender] = true;
        emit AgentAdded(msg.sender);
    }
    
    /**
     * @dev Updates the property valuation
     * @param newValue The new property value
     */
    function updatePropertyValuation(uint256 newValue) external onlyAgent {
        propertyValue = newValue;
        lastValuationDate = block.timestamp;
        emit PropertyValuationUpdated(newValue, block.timestamp);
    }
    
    /**
     * @dev Mints new tokens - can only mint to verified addresses
     */
    function mint(address to, uint256 amount) external onlyAgent onlyVerified(to) {
        _mint(to, amount);
    }
    
    /**
     * @dev Burns tokens from the sender's account
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Recovers a lost account by transferring its balance to a new account
     * @param lostAddress The address that lost access
     * @param newAddress The new address to transfer the balance to
     */
    function recoverAccount(address lostAddress, address newAddress) external nonReentrant onlyVerified(newAddress) {
        require(recoveryAddresses[msg.sender], "ERC3643Token: caller is not a recovery address");
        require(!recoveryRequests[lostAddress][msg.sender], "ERC3643Token: recovery already requested");
        
        recoveryRequests[lostAddress][msg.sender] = true;
        
        // Count recovery requests
        uint256 requestCount = 0;
        for (uint256 i = 0; i < RECOVERY_ADDRESS_COUNT; i++) {
            address recoveryAddress = address(uint160(uint256(keccak256(abi.encodePacked(i, block.timestamp)))));
            if (recoveryAddresses[recoveryAddress] && recoveryRequests[lostAddress][recoveryAddress]) {
                requestCount++;
            }
        }
        
        // If we have enough requests, perform the recovery
        if (requestCount >= RECOVERY_ADDRESS_COUNT / 2 + 1) {
            uint256 balance = balanceOf(lostAddress);
            _transfer(lostAddress, newAddress, balance);
            
            // Reset recovery requests
            for (uint256 i = 0; i < RECOVERY_ADDRESS_COUNT; i++) {
                address recoveryAddress = address(uint160(uint256(keccak256(abi.encodePacked(i, block.timestamp)))));
                if (recoveryAddresses[recoveryAddress]) {
                    recoveryRequests[lostAddress][recoveryAddress] = false;
                }
            }
            
            emit AccountRecovered(lostAddress, newAddress);
        }
        
        emit RecoveryRequested(lostAddress, msg.sender);
    }
    
    /**
     * @dev Adds a recovery address
     */
    function addRecoveryAddress(address recoveryAddress) external onlyOwner {
        require(!recoveryAddresses[recoveryAddress], "ERC3643Token: already a recovery address");
        
        uint256 recoveryAddressCount = 0;
        for (uint256 i = 0; i < RECOVERY_ADDRESS_COUNT; i++) {
            address addr = address(uint160(uint256(keccak256(abi.encodePacked(i, block.timestamp)))));
            if (recoveryAddresses[addr]) {
                recoveryAddressCount++;
            }
        }
        
        require(recoveryAddressCount < RECOVERY_ADDRESS_COUNT, "ERC3643Token: maximum recovery addresses reached");
        
        recoveryAddresses[recoveryAddress] = true;
        emit RecoveryAddressAdded(recoveryAddress);
    }
    
    /**
     * @dev Removes a recovery address
     */
    function removeRecoveryAddress(address recoveryAddress) external onlyOwner {
        require(recoveryAddresses[recoveryAddress], "ERC3643Token: not a recovery address");
        
        recoveryAddresses[recoveryAddress] = false;
        emit RecoveryAddressRemoved(recoveryAddress);
    }
    
    /**
     * @dev Adds an agent
     */
    function addAgent(address agent) external onlyOwner {
        require(!isAgent[agent], "ERC3643Token: already an agent");
        
        isAgent[agent] = true;
        emit AgentAdded(agent);
    }
    
    /**
     * @dev Removes an agent
     */
    function removeAgent(address agent) external onlyOwner {
        require(isAgent[agent], "ERC3643Token: not an agent");
        
        isAgent[agent] = false;
        emit AgentRemoved(agent);
    }
    
    /**
     * @dev Updates the identity registry
     */
    function setIdentityRegistry(address _identityRegistry) external onlyOwner {
        require(_identityRegistry != address(0), "ERC3643Token: identity registry cannot be zero address");
        
        identityRegistry = IIdentityRegistry(_identityRegistry);
        emit IdentityRegistryUpdated(_identityRegistry);
    }
    
    /**
     * @dev Updates the occupancy rate
     */
    function updateOccupancyRate(uint256 newRate) external onlyAgent {
        require(newRate <= 10000, "ERC3643Token: rate cannot exceed 100%");
        occupancyRate = newRate;
        emit OccupancyRateUpdated(newRate);
    }
    
    /**
     * @dev Updates the property yield
     */
    function updatePropertyYield(uint256 newYield) external onlyAgent {
        propertyYield = newYield;
        emit PropertyYieldUpdated(newYield);
    }
    
    /**
     * @dev Receives rental income for the property
     */
    function receiveRentalIncome() external payable onlyAgent {
        totalRentalIncome += msg.value;
        emit RentalIncomeReceived(msg.value, block.timestamp);
    }
    
    /**
     * @dev Distributes rental income to token holders based on their holdings
     */
    function distributeRentalIncome() external onlyAgent nonReentrant {
        require(totalRentalIncome > 0, "ERC3643Token: no rental income to distribute");
        
        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, "ERC3643Token: no tokens in circulation");
        
        // Store the amount to distribute
        uint256 amountToDistribute = totalRentalIncome;
        totalRentalIncome = 0;
        lastDistributionDate = block.timestamp;
        
        emit RentalIncomeDistributed(amountToDistribute, block.timestamp);
    }
    
    /**
     * @dev Claims rental income for a token holder
     */
    function claimRentalIncome() external nonReentrant {
        uint256 amount = unclaimedRentalIncome[msg.sender];
        require(amount > 0, "ERC3643Token: no rental income to claim");
        
        unclaimedRentalIncome[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ERC3643Token: rental income transfer failed");
    }
    
    /**
     * @dev Pauses token transfers
     */
    function pause() external onlyAgent {
        _pause();
    }
    
    /**
     * @dev Unpauses token transfers
     */
    function unpause() external onlyAgent {
        _unpause();
    }
    
    /**
     * @dev Internal function to update token holders' unclaimed rental income
     */
    function _update(address from, address to, uint256 amount) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) onlyVerified(to) {
        // Skip if it's a mint or burn
        if (from != address(0) && to != address(0)) {
            require(identityRegistry.isVerified(to), "ERC3643Token: receiver is not verified");
        }
        
        super._update(from, to, amount);
    }
} 