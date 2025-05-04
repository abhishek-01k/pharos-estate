// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "./PropertyToken.sol";

/**
 * @title PropertyMarketplace
 * @dev Marketplace for buying and selling property tokens
 */
contract PropertyMarketplace is 
    Initializable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable 
{
    // SafeMath is not needed in Solidity 0.8.x as it has built-in overflow checking
    
    // Fee structure
    uint256 public listingFee; // in basis points (1% = 100)
    uint256 public transactionFee; // in basis points
    address public feeRecipient;
    
    // Listing struct
    struct Listing {
        address seller;
        address propertyToken;
        uint256 amount;
        uint256 pricePerToken;
        bool active;
    }
    
    // Offer struct
    struct Offer {
        address buyer;
        address propertyToken;
        uint256 listingId;
        uint256 amount;
        uint256 pricePerToken;
        uint256 expiration;
        bool active;
    }
    
    // Listings and offers
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer) public offers;
    uint256 public nextListingId;
    uint256 public nextOfferId;
    
    // Approved property tokens
    mapping(address => bool) public approvedPropertyTokens;
    
    // Events
    event PropertyTokenApproved(address indexed tokenAddress);
    event PropertyTokenRemoved(address indexed tokenAddress);
    event ListingCreated(uint256 indexed listingId, address indexed seller, address indexed propertyToken, uint256 amount, uint256 pricePerToken);
    event ListingUpdated(uint256 indexed listingId, uint256 amount, uint256 pricePerToken);
    event ListingCancelled(uint256 indexed listingId);
    event ListingPurchased(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalPrice);
    event OfferCreated(uint256 indexed offerId, address indexed buyer, uint256 indexed listingId, uint256 amount, uint256 pricePerToken, uint256 expiration);
    event OfferAccepted(uint256 indexed offerId, address indexed seller);
    event OfferRejected(uint256 indexed offerId);
    event OfferCancelled(uint256 indexed offerId);
    event FeesUpdated(uint256 listingFee, uint256 transactionFee);
    event FeeRecipientUpdated(address feeRecipient);
    
    /**
     * @dev Modifier to check if a property token is approved
     */
    modifier onlyApprovedPropertyToken(address propertyToken) {
        require(approvedPropertyTokens[propertyToken], "PropertyMarketplace: token not approved");
        _;
    }
    
    /**
     * @dev Initializes the contract
     */
    function initialize(
        uint256 _listingFee,
        uint256 _transactionFee,
        address _feeRecipient
    ) public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        
        require(_listingFee <= 1000, "PropertyMarketplace: listing fee too high"); // Max 10%
        require(_transactionFee <= 1000, "PropertyMarketplace: transaction fee too high"); // Max 10%
        require(_feeRecipient != address(0), "PropertyMarketplace: invalid fee recipient");
        
        listingFee = _listingFee;
        transactionFee = _transactionFee;
        feeRecipient = _feeRecipient;
        
        nextListingId = 1;
        nextOfferId = 1;
    }
    
    /**
     * @dev Approves a property token to be listed on the marketplace
     * @param propertyToken Address of the property token contract
     */
    function approvePropertyToken(address propertyToken) external onlyOwner {
        require(propertyToken != address(0), "PropertyMarketplace: invalid address");
        approvedPropertyTokens[propertyToken] = true;
        emit PropertyTokenApproved(propertyToken);
    }
    
    /**
     * @dev Removes a property token from the approved list
     * @param propertyToken Address of the property token contract
     */
    function removePropertyToken(address propertyToken) external onlyOwner {
        require(approvedPropertyTokens[propertyToken], "PropertyMarketplace: token not approved");
        approvedPropertyTokens[propertyToken] = false;
        emit PropertyTokenRemoved(propertyToken);
    }
    
    /**
     * @dev Creates a new listing for property tokens
     * @param propertyToken Address of the property token contract
     * @param amount Amount of tokens to list
     * @param pricePerToken Price per token in wei
     */
    function createListing(
        address propertyToken, 
        uint256 amount, 
        uint256 pricePerToken
    ) external nonReentrant whenNotPaused onlyApprovedPropertyToken(propertyToken) {
        require(amount > 0, "PropertyMarketplace: amount must be greater than 0");
        require(pricePerToken > 0, "PropertyMarketplace: price must be greater than 0");
        
        // Transfer tokens to the marketplace
        PropertyToken token = PropertyToken(propertyToken);
        require(token.transferFrom(msg.sender, address(this), amount), "PropertyMarketplace: transfer failed");
        
        // Create the listing
        listings[nextListingId] = Listing({
            seller: msg.sender,
            propertyToken: propertyToken,
            amount: amount,
            pricePerToken: pricePerToken,
            active: true
        });
        
        emit ListingCreated(nextListingId, msg.sender, propertyToken, amount, pricePerToken);
        nextListingId++;
    }
    
    /**
     * @dev Updates an existing listing
     * @param listingId ID of the listing to update
     * @param newAmount New amount of tokens (must be <= original amount)
     * @param newPricePerToken New price per token
     */
    function updateListing(
        uint256 listingId, 
        uint256 newAmount, 
        uint256 newPricePerToken
    ) external nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "PropertyMarketplace: listing not active");
        require(listing.seller == msg.sender, "PropertyMarketplace: not the seller");
        require(newAmount > 0, "PropertyMarketplace: amount must be greater than 0");
        require(newPricePerToken > 0, "PropertyMarketplace: price must be greater than 0");
        require(newAmount <= listing.amount, "PropertyMarketplace: cannot increase amount");
        
        // If reducing amount, return excess tokens to seller
        if (newAmount < listing.amount) {
            PropertyToken token = PropertyToken(listing.propertyToken);
            require(token.transfer(listing.seller, listing.amount - newAmount), "PropertyMarketplace: transfer failed");
        }
        
        listing.amount = newAmount;
        listing.pricePerToken = newPricePerToken;
        
        emit ListingUpdated(listingId, newAmount, newPricePerToken);
    }
    
    /**
     * @dev Cancels a listing and returns tokens to the seller
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "PropertyMarketplace: listing not active");
        require(listing.seller == msg.sender || msg.sender == owner(), "PropertyMarketplace: not authorized");
        
        listing.active = false;
        
        // Return tokens to seller
        PropertyToken token = PropertyToken(listing.propertyToken);
        require(token.transfer(listing.seller, listing.amount), "PropertyMarketplace: transfer failed");
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @dev Purchase tokens from a listing
     * @param listingId ID of the listing to purchase from
     * @param amount Amount of tokens to purchase
     */
    function purchaseListing(uint256 listingId, uint256 amount) external payable nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "PropertyMarketplace: listing not active");
        require(amount > 0 && amount <= listing.amount, "PropertyMarketplace: invalid amount");
        
        uint256 totalPrice = amount * listing.pricePerToken;
        uint256 fee = totalPrice * transactionFee / 10000;
        uint256 sellerAmount = totalPrice - fee;
        
        require(msg.value >= totalPrice, "PropertyMarketplace: insufficient payment");
        
        // Process fees
        if (fee > 0) {
            (bool feeSuccess, ) = feeRecipient.call{value: fee}("");
            require(feeSuccess, "PropertyMarketplace: fee transfer failed");
        }
        
        // Transfer funds to seller
        (bool sellerSuccess, ) = listing.seller.call{value: sellerAmount}("");
        require(sellerSuccess, "PropertyMarketplace: seller transfer failed");
        
        // Transfer tokens to buyer
        PropertyToken token = PropertyToken(listing.propertyToken);
        require(token.transfer(msg.sender, amount), "PropertyMarketplace: token transfer failed");
        
        // Refund excess payment if any
        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalPrice}("");
            require(refundSuccess, "PropertyMarketplace: refund failed");
        }
        
        // Update listing
        listing.amount = listing.amount - amount;
        if (listing.amount == 0) {
            listing.active = false;
        }
        
        emit ListingPurchased(listingId, msg.sender, amount, totalPrice);
    }
    
    /**
     * @dev Creates an offer for a listing
     * @param listingId ID of the listing to make an offer for
     * @param amount Amount of tokens to offer for
     * @param pricePerToken Price per token offered
     * @param expirationTime Expiration time of the offer (in seconds)
     */
    function createOffer(
        uint256 listingId,
        uint256 amount,
        uint256 pricePerToken, 
        uint256 expirationTime
    ) external payable nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "PropertyMarketplace: listing not active");
        require(amount > 0 && amount <= listing.amount, "PropertyMarketplace: invalid amount");
        require(pricePerToken > 0, "PropertyMarketplace: price must be greater than 0");
        require(expirationTime > block.timestamp, "PropertyMarketplace: expiration in the past");
        
        uint256 totalPrice = amount * pricePerToken;
        require(msg.value >= totalPrice, "PropertyMarketplace: insufficient payment");
        
        // Create the offer
        offers[nextOfferId] = Offer({
            buyer: msg.sender,
            propertyToken: listing.propertyToken,
            listingId: listingId,
            amount: amount,
            pricePerToken: pricePerToken,
            expiration: expirationTime,
            active: true
        });
        
        emit OfferCreated(nextOfferId, msg.sender, listingId, amount, pricePerToken, expirationTime);
        nextOfferId++;
    }
    
    /**
     * @dev Accepts an offer
     * @param offerId ID of the offer to accept
     */
    function acceptOffer(uint256 offerId) external nonReentrant whenNotPaused {
        Offer storage offer = offers[offerId];
        Listing storage listing = listings[offer.listingId];
        
        require(offer.active, "PropertyMarketplace: offer not active");
        require(block.timestamp < offer.expiration, "PropertyMarketplace: offer expired");
        require(listing.active, "PropertyMarketplace: listing not active");
        require(listing.seller == msg.sender, "PropertyMarketplace: not the seller");
        require(offer.amount <= listing.amount, "PropertyMarketplace: offer amount exceeds listing");
        
        // Mark offer as accepted
        offer.active = false;
        
        // Calculate fees
        uint256 totalPrice = offer.amount * offer.pricePerToken;
        uint256 fee = totalPrice * transactionFee / 10000;
        uint256 sellerAmount = totalPrice - fee;
        
        // Transfer fee
        if (fee > 0) {
            (bool feeSuccess, ) = feeRecipient.call{value: fee}("");
            require(feeSuccess, "PropertyMarketplace: fee transfer failed");
        }
        
        // Transfer funds to seller
        (bool sellerSuccess, ) = listing.seller.call{value: sellerAmount}("");
        require(sellerSuccess, "PropertyMarketplace: seller transfer failed");
        
        // Transfer tokens to buyer
        PropertyToken token = PropertyToken(listing.propertyToken);
        require(token.transfer(offer.buyer, offer.amount), "PropertyMarketplace: token transfer failed");
        
        // Update listing
        listing.amount = listing.amount - offer.amount;
        if (listing.amount == 0) {
            listing.active = false;
        }
        
        emit OfferAccepted(offerId, msg.sender);
    }
    
    /**
     * @dev Rejects an offer
     * @param offerId ID of the offer to reject
     */
    function rejectOffer(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        Listing storage listing = listings[offer.listingId];
        
        require(offer.active, "PropertyMarketplace: offer not active");
        require(listing.seller == msg.sender || msg.sender == owner(), "PropertyMarketplace: not authorized");
        
        // Mark offer as rejected
        offer.active = false;
        
        // Refund buyer
        uint256 refundAmount = offer.amount * offer.pricePerToken;
        (bool success, ) = offer.buyer.call{value: refundAmount}("");
        require(success, "PropertyMarketplace: refund failed");
        
        emit OfferRejected(offerId);
    }
    
    /**
     * @dev Cancels an offer (buyer only)
     * @param offerId ID of the offer to cancel
     */
    function cancelOffer(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        
        require(offer.active, "PropertyMarketplace: offer not active");
        require(offer.buyer == msg.sender, "PropertyMarketplace: not the buyer");
        
        // Mark offer as cancelled
        offer.active = false;
        
        // Refund buyer
        uint256 refundAmount = offer.amount * offer.pricePerToken;
        (bool success, ) = offer.buyer.call{value: refundAmount}("");
        require(success, "PropertyMarketplace: refund failed");
        
        emit OfferCancelled(offerId);
    }
    
    /**
     * @dev Updates the fee structure
     * @param newListingFee New listing fee (in basis points)
     * @param newTransactionFee New transaction fee (in basis points)
     */
    function updateFees(uint256 newListingFee, uint256 newTransactionFee) external onlyOwner {
        require(newListingFee <= 1000, "PropertyMarketplace: listing fee too high"); // Max 10%
        require(newTransactionFee <= 1000, "PropertyMarketplace: transaction fee too high"); // Max 10%
        
        listingFee = newListingFee;
        transactionFee = newTransactionFee;
        
        emit FeesUpdated(newListingFee, newTransactionFee);
    }
    
    /**
     * @dev Updates the fee recipient
     * @param newFeeRecipient Address of the new fee recipient
     */
    function updateFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "PropertyMarketplace: invalid address");
        
        feeRecipient = newFeeRecipient;
        
        emit FeeRecipientUpdated(newFeeRecipient);
    }
    
    /**
     * @dev Pauses the marketplace
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses the marketplace
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Recovery function to handle stuck tokens
     * @param tokenAddress Address of the token to recover
     */
    function recoverERC20(address tokenAddress) external onlyOwner {
        PropertyToken token = PropertyToken(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner(), balance), "PropertyMarketplace: recovery failed");
    }
} 