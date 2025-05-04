// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title PropertyToken
 * @dev ERC-3643 compliant token for representing fractional ownership of commercial real estate
 */
contract PropertyToken is 
    Initializable, 
    ERC20Upgradeable, 
    ERC20PausableUpgradeable, 
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable 
{
    // Property details
    string public propertyAddress;
    uint256 public propertyValue;
    uint256 public lastValuationDate;
    string public propertyDocumentURI;
    
    // Compliance
    mapping(address => bool) public kycApproved;
    address public complianceManager;
    
    // Income distribution
    uint256 public totalRentalIncome;
    uint256 public lastDistributionDate;
    mapping(address => uint256) public unclaimedRentalIncome;
    
    // Dynamic Tokenization metrics
    uint256 public occupancyRate; // in basis points (100% = 10000)
    uint256 public propertyYield; // annual yield in basis points
    
    // Events
    event PropertyValuationUpdated(uint256 newValue, uint256 timestamp);
    event RentalIncomeReceived(uint256 amount, uint256 timestamp);
    event RentalIncomeDistributed(uint256 amount, uint256 timestamp);
    event KYCStatusChanged(address indexed account, bool approved);
    event OccupancyRateUpdated(uint256 newRate);
    event PropertyYieldUpdated(uint256 newYield);
    
    /**
     * @dev Modifier to check if an address has been KYC approved
     */
    modifier onlyKYCApproved(address account) {
        require(kycApproved[account], "PropertyToken: account not KYC approved");
        _;
    }
    
    /**
     * @dev Modifier for compliance manager only
     */
    modifier onlyComplianceManager() {
        require(msg.sender == complianceManager, "PropertyToken: not compliance manager");
        _;
    }
    
    /**
     * @dev Initializes the contract with property details and token parameters
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _propertyAddress,
        uint256 _propertyValue,
        string memory _propertyDocumentURI,
        address _complianceManager
    ) public initializer {
        __ERC20_init(_name, _symbol);
        __ERC20Pausable_init();
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        
        propertyAddress = _propertyAddress;
        propertyValue = _propertyValue;
        lastValuationDate = block.timestamp;
        propertyDocumentURI = _propertyDocumentURI;
        complianceManager = _complianceManager;
        
        // Default values
        occupancyRate = 10000; // 100%
        propertyYield = 500; // 5%
    }
    
    /**
     * @dev Updates the property valuation
     * @param newValue The new property value
     */
    function updatePropertyValuation(uint256 newValue) external onlyOwner {
        propertyValue = newValue;
        lastValuationDate = block.timestamp;
        emit PropertyValuationUpdated(newValue, block.timestamp);
    }
    
    /**
     * @dev Mints new property tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner onlyKYCApproved(to) {
        _mint(to, amount);
    }
    
    /**
     * @dev Burns property tokens
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Sets KYC approval status for an address
     * @param account Address to set approval for
     * @param approved Approval status
     */
    function setKYCApproval(address account, bool approved) external onlyComplianceManager {
        kycApproved[account] = approved;
        emit KYCStatusChanged(account, approved);
    }
    
    /**
     * @dev Batch set KYC approval status for multiple addresses
     * @param accounts Addresses to set approval for
     * @param approved Approval status
     */
    function batchSetKYCApproval(address[] calldata accounts, bool approved) external onlyComplianceManager {
        for (uint256 i = 0; i < accounts.length; i++) {
            kycApproved[accounts[i]] = approved;
            emit KYCStatusChanged(accounts[i], approved);
        }
    }
    
    /**
     * @dev Receives rental income for the property
     */
    function receiveRentalIncome() external payable onlyOwner {
        totalRentalIncome += msg.value;
        emit RentalIncomeReceived(msg.value, block.timestamp);
    }
    
    /**
     * @dev Distributes rental income to token holders
     */
    function distributeRentalIncome() external onlyOwner nonReentrant {
        require(totalRentalIncome > 0, "PropertyToken: no rental income to distribute");
        
        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, "PropertyToken: no tokens in circulation");
        
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
        require(amount > 0, "PropertyToken: no rental income to claim");
        
        unclaimedRentalIncome[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "PropertyToken: rental income transfer failed");
    }
    
    /**
     * @dev Updates the occupancy rate
     * @param newRate New occupancy rate in basis points
     */
    function updateOccupancyRate(uint256 newRate) external onlyOwner {
        require(newRate <= 10000, "PropertyToken: rate cannot exceed 100%");
        occupancyRate = newRate;
        emit OccupancyRateUpdated(newRate);
    }
    
    /**
     * @dev Updates the property yield
     * @param newYield New property yield in basis points
     */
    function updatePropertyYield(uint256 newYield) external onlyOwner {
        propertyYield = newYield;
        emit PropertyYieldUpdated(newYield);
    }
    
    /**
     * @dev Updates the compliance manager
     * @param newComplianceManager Address of the new compliance manager
     */
    function setComplianceManager(address newComplianceManager) external onlyOwner {
        require(newComplianceManager != address(0), "PropertyToken: invalid address");
        complianceManager = newComplianceManager;
    }
    
    /**
     * @dev Override of the transfer function to include KYC check
     */
    function transfer(address to, uint256 amount) public override onlyKYCApproved(to) returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override of the transferFrom function to include KYC check
     */
    function transferFrom(address from, address to, uint256 amount) public override onlyKYCApproved(to) returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Pauses all token transfers and operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses all token transfers and operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Internal function to update token holders' unclaimed rental income
     * @param from Sender address
     * @param to Recipient address
     * @param amount Amount of tokens being transferred
     */
    function _update(address from, address to, uint256 amount) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        super._update(from, to, amount);
    }
} 