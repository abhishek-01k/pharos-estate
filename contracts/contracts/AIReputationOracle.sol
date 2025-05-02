// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./TrustID.sol";

/**
 * @title AIReputationOracle
 * @dev Oracle contract that updates reputation scores based on AI analysis
 */
contract AIReputationOracle is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    TrustID public trustId;
    
    // Mapping to track the last time a DID was evaluated
    mapping(string => uint256) public lastEvaluationTime;
    
    // Minimum time between evaluations (default: 1 day)
    uint256 public minEvaluationPeriod = 1 days;
    
    // Events
    event ReputationUpdateRequested(string did, address requester);
    event ReputationUpdated(string did, uint256 newScore, string category, uint256 categoryScore);
    
    constructor(address trustIdAddress) {
        trustId = TrustID(trustIdAddress);
        
        // Grant the contract deployer the default admin role and oracle role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }
    
    /**
     * @dev Request a reputation update for a DID
     * @param did The DID to update
     */
    function requestReputationUpdate(string calldata did) external {
        // Check if enough time has passed since the last evaluation
        require(
            block.timestamp >= lastEvaluationTime[did] + minEvaluationPeriod,
            "Evaluation requested too soon"
        );
        
        // Update the last evaluation time
        lastEvaluationTime[did] = block.timestamp;
        
        emit ReputationUpdateRequested(did, msg.sender);
    }
    
    /**
     * @dev Update reputation score based on AI analysis (only callable by oracles)
     * @param did The DID to update
     * @param newScore New overall reputation score
     * @param categories Array of reputation categories
     * @param categoryScores Array of category-specific scores
     */
    function updateReputation(
        string calldata did,
        uint256 newScore,
        string[] calldata categories,
        uint256[] calldata categoryScores
    ) external onlyRole(ORACLE_ROLE) {
        require(categories.length == categoryScores.length, "Arrays length mismatch");
        
        // Update the overall score
        trustId.updateReputation(did, newScore, "", 0);
        
        // Update each category score
        for (uint256 i = 0; i < categories.length; i++) {
            trustId.updateReputation(did, newScore, categories[i], categoryScores[i]);
            emit ReputationUpdated(did, newScore, categories[i], categoryScores[i]);
        }
    }
    
    /**
     * @dev Set the minimum time between evaluations
     * @param period New minimum period in seconds
     */
    function setMinEvaluationPeriod(uint256 period) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minEvaluationPeriod = period;
    }
    
    /**
     * @dev Add a new oracle that can update reputation scores
     * @param oracle Address to add as an oracle
     */
    function addOracle(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ORACLE_ROLE, oracle);
    }
    
    /**
     * @dev Remove an oracle
     * @param oracle Address to remove
     */
    function removeOracle(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ORACLE_ROLE, oracle);
    }
} 