// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DuckSecure Subscription Manager
 * @dev Manages subscription payments for DuckSecure Auditor platform
 */
contract SubscriptionManager is Ownable, ReentrancyGuard {
    IERC20 public immutable duckToken;
    
    struct Subscription {
        uint256 expiry;
        bool active;
        uint256 totalPaid;
        uint256 auditsUsed;
    }
    
    mapping(address => Subscription) public subscriptions;
    
    // Pricing in DUCK tokens (with 18 decimals)
    uint256 public subscriptionPrice = 500 * 10**18; // 500 DUCK
    uint256 public oneTimeAuditPrice = 100 * 10**18; // 100 DUCK
    uint256 public subscriptionDuration = 30 days;
    
    // Revenue tracking
    uint256 public totalRevenue;
    address public treasury;
    
    event SubscriptionPurchased(address indexed user, uint256 duration, uint256 expiry, uint256 amount);
    event AuditPurchased(address indexed user, uint256 amount);
    event PricesUpdated(uint256 subscriptionPrice, uint256 oneTimePrice);
    event TreasuryUpdated(address newTreasury);
    
    constructor(address _duckToken, address _treasury) {
        duckToken = IERC20(_duckToken);
        treasury = _treasury;
    }
    
    /**
     * @dev Purchase a subscription with DUCK tokens
     * @param duration Subscription duration in days (minimum 7, maximum 365)
     */
    function purchaseSubscription(uint256 duration) external nonReentrant {
        require(duration >= 7 && duration <= 365, "Invalid duration");
        
        uint256 amount = (subscriptionPrice * duration) / 30; // Pro-rated pricing
        require(duckToken.transferFrom(msg.sender, treasury, amount), "Payment failed");
        
        Subscription storage sub = subscriptions[msg.sender];
        uint256 currentTime = block.timestamp;
        
        // Extend existing subscription or create new one
        if (sub.active && sub.expiry > currentTime) {
            sub.expiry += duration * 1 days;
        } else {
            sub.expiry = currentTime + (duration * 1 days);
            sub.active = true;
        }
        
        sub.totalPaid += amount;
        totalRevenue += amount;
        
        emit SubscriptionPurchased(msg.sender, duration, sub.expiry, amount);
    }
    
    /**
     * @dev Pay for a one-time audit
     */
    function payForAudit() external nonReentrant {
        require(duckToken.transferFrom(msg.sender, treasury, oneTimeAuditPrice), "Payment failed");
        
        totalRevenue += oneTimeAuditPrice;
        
        emit AuditPurchased(msg.sender, oneTimeAuditPrice);
    }
    
    /**
     * @dev Check if user has active subscription
     */
    function hasActiveSubscription(address user) external view returns (bool) {
        Subscription memory sub = subscriptions[user];
        return sub.active && sub.expiry > block.timestamp;
    }
    
    /**
     * @dev Get subscription details
     */
    function getSubscription(address user) external view returns (
        uint256 expiry,
        bool active,
        uint256 totalPaid,
        uint256 auditsUsed,
        uint256 daysRemaining
    ) {
        Subscription memory sub = subscriptions[user];
        
        expiry = sub.expiry;
        active = sub.active && sub.expiry > block.timestamp;
        totalPaid = sub.totalPaid;
        auditsUsed = sub.auditsUsed;
        
        if (active) {
            daysRemaining = (sub.expiry - block.timestamp) / 1 days;
        } else {
            daysRemaining = 0;
        }
    }
    
    /**
     * @dev Record audit usage (only called by authorized auditor contracts)
     */
    function recordAuditUsage(address user) external onlyOwner {
        require(this.hasActiveSubscription(user), "No active subscription");
        subscriptions[user].auditsUsed++;
    }
    
    /**
     * @dev Update pricing (owner only)
     */
    function updatePricing(uint256 _subscriptionPrice, uint256 _oneTimePrice) external onlyOwner {
        subscriptionPrice = _subscriptionPrice;
        oneTimeAuditPrice = _oneTimePrice;
        
        emit PricesUpdated(_subscriptionPrice, _oneTimePrice);
    }
    
    /**
     * @dev Update treasury address (owner only)
     */
    function updateTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        
        emit TreasuryUpdated(_treasury);
    }
    
    /**
     * @dev Emergency function to recover tokens (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Transfer failed");
    }
}
