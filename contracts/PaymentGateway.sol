// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DuckSecure Payment Gateway
 * @dev Handles payments for individual audits and manages access control
 */
contract PaymentGateway is Ownable, ReentrancyGuard {
    IERC20 public immutable duckToken;
    
    struct AuditPayment {
        uint256 amount;
        uint256 timestamp;
        string auditType; // "contract" or "code"
        bool processed;
    }
    
    mapping(address => AuditPayment[]) public userPayments;
    mapping(bytes32 => bool) public auditHashes; // Track processed audits
    
    uint256 public auditPrice = 100 * 10**18; // 100 DUCK tokens
    address public treasury;
    address public subscriptionManager;
    
    // Revenue and usage statistics
    uint256 public totalRevenue;
    uint256 public totalAudits;
    mapping(string => uint256) public auditTypeCount;
    
    event AuditPaymentReceived(address indexed user, uint256 amount, string auditType);
    event AuditProcessed(address indexed user, bytes32 auditHash, string auditType);
    event PriceUpdated(uint256 newPrice);
    event TreasuryUpdated(address newTreasury);
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || msg.sender == subscriptionManager,
            "Not authorized"
        );
        _;
    }
    
    constructor(
        address _duckToken,
        address _treasury,
        address _subscriptionManager
    ) {
        duckToken = IERC20(_duckToken);
        treasury = _treasury;
        subscriptionManager = _subscriptionManager;
    }
    
    /**
     * @dev Pay for a single audit
     * @param auditType Type of audit ("contract" or "code")
     */
    function payForAudit(string memory auditType) external nonReentrant {
        require(
            keccak256(bytes(auditType)) == keccak256(bytes("contract")) ||
            keccak256(bytes(auditType)) == keccak256(bytes("code")),
            "Invalid audit type"
        );
        
        require(
            duckToken.transferFrom(msg.sender, treasury, auditPrice),
            "Payment failed"
        );
        
        // Record payment
        userPayments[msg.sender].push(AuditPayment({
            amount: auditPrice,
            timestamp: block.timestamp,
            auditType: auditType,
            processed: false
        }));
        
        // Update statistics
        totalRevenue += auditPrice;
        totalAudits++;
        auditTypeCount[auditType]++;
        
        emit AuditPaymentReceived(msg.sender, auditPrice, auditType);
    }
    
    /**
     * @dev Check if user can access audit (paid or has subscription)
     */
    function canAccessAudit(address user) external view returns (bool) {
        // Check if user has active subscription
        if (subscriptionManager != address(0)) {
            try ISubscriptionManager(subscriptionManager).hasActiveSubscription(user) returns (bool hasSubscription) {
                if (hasSubscription) return true;
            } catch {}
        }
        
        // Check if user has unprocessed payment
        AuditPayment[] memory payments = userPayments[user];
        for (uint i = payments.length; i > 0; i--) {
            if (!payments[i-1].processed && 
                block.timestamp - payments[i-1].timestamp <= 1 hours) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Mark audit as processed
     * @param user User address
     * @param auditHash Hash of the audit result
     * @param auditType Type of audit
     */
    function processAudit(
        address user,
        bytes32 auditHash,
        string memory auditType
    ) external onlyAuthorized {
        require(!auditHashes[auditHash], "Audit already processed");
        
        // Mark most recent unprocessed payment as processed
        AuditPayment[] storage payments = userPayments[user];
        for (uint i = payments.length; i > 0; i--) {
            if (!payments[i-1].processed &&
                keccak256(bytes(payments[i-1].auditType)) == keccak256(bytes(auditType))) {
                payments[i-1].processed = true;
                break;
            }
        }
        
        auditHashes[auditHash] = true;
        
        emit AuditProcessed(user, auditHash, auditType);
    }
    
    /**
     * @dev Get user's payment history
     */
    function getUserPayments(address user) external view returns (AuditPayment[] memory) {
        return userPayments[user];
    }
    
    /**
     * @dev Get total payments by user
     */
    function getUserTotalPaid(address user) external view returns (uint256) {
        uint256 total = 0;
        AuditPayment[] memory payments = userPayments[user];
        
        for (uint i = 0; i < payments.length; i++) {
            total += payments[i].amount;
        }
        
        return total;
    }
    
    /**
     * @dev Update audit price (owner only)
     */
    function updatePrice(uint256 _newPrice) external onlyOwner {
        auditPrice = _newPrice;
        emit PriceUpdated(_newPrice);
    }
    
    /**
     * @dev Update treasury address (owner only)
     */
    function updateTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }
    
    /**
     * @dev Update subscription manager address (owner only)
     */
    function updateSubscriptionManager(address _subscriptionManager) external onlyOwner {
        subscriptionManager = _subscriptionManager;
    }
    
    /**
     * @dev Get platform statistics
     */
    function getStatistics() external view returns (
        uint256 _totalRevenue,
        uint256 _totalAudits,
        uint256 _contractAudits,
        uint256 _codeAudits,
        uint256 _currentPrice
    ) {
        _totalRevenue = totalRevenue;
        _totalAudits = totalAudits;
        _contractAudits = auditTypeCount["contract"];
        _codeAudits = auditTypeCount["code"];
        _currentPrice = auditPrice;
    }
    
    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Transfer failed");
    }
}

interface ISubscriptionManager {
    function hasActiveSubscription(address user) external view returns (bool);
}
