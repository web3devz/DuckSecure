/**
 * User Audit Tracker Service
 * Manages free audit usage per user using localStorage
 */

export interface UserAuditData {
  freeAuditsUsed: number
  totalAudits: number
  lastAuditDate: string
  walletAddress?: string
}

export class UserAuditTracker {
  private static readonly STORAGE_KEY = 'ducksecure_user_audits'
  private static readonly MAX_FREE_AUDITS = 3

  /**
   * Get user audit data from localStorage
   */
  static getUserAuditData(walletAddress?: string): UserAuditData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return this.getDefaultUserData(walletAddress)
      }

      const data = JSON.parse(stored) as UserAuditData
      
      // If wallet address changed, reset the data
      if (walletAddress && data.walletAddress !== walletAddress) {
        return this.getDefaultUserData(walletAddress)
      }

      return data
    } catch (error) {
      console.error('Error reading user audit data:', error)
      return this.getDefaultUserData(walletAddress)
    }
  }

  /**
   * Save user audit data to localStorage
   */
  static saveUserAuditData(data: UserAuditData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving user audit data:', error)
    }
  }

  /**
   * Check if user has free audits remaining
   */
  static hasFreeAuditsRemaining(walletAddress?: string): boolean {
    const data = this.getUserAuditData(walletAddress)
    return data.freeAuditsUsed < this.MAX_FREE_AUDITS
  }

  /**
   * Get number of free audits remaining
   */
  static getFreeAuditsRemaining(walletAddress?: string): number {
    const data = this.getUserAuditData(walletAddress)
    return Math.max(0, this.MAX_FREE_AUDITS - data.freeAuditsUsed)
  }

  /**
   * Use a free audit (increment counter)
   */
  static useFreeAudit(walletAddress?: string): boolean {
    const data = this.getUserAuditData(walletAddress)
    
    if (data.freeAuditsUsed >= this.MAX_FREE_AUDITS) {
      return false // No free audits remaining
    }

    data.freeAuditsUsed += 1
    data.totalAudits += 1
    data.lastAuditDate = new Date().toISOString()
    
    if (walletAddress) {
      data.walletAddress = walletAddress
    }

    this.saveUserAuditData(data)
    return true
  }

  /**
   * Record a paid audit
   */
  static recordPaidAudit(walletAddress?: string): void {
    const data = this.getUserAuditData(walletAddress)
    
    data.totalAudits += 1
    data.lastAuditDate = new Date().toISOString()
    
    if (walletAddress) {
      data.walletAddress = walletAddress
    }

    this.saveUserAuditData(data)
  }

  /**
   * Reset user audit data (for testing or admin purposes)
   */
  static resetUserAuditData(walletAddress?: string): void {
    const data = this.getDefaultUserData(walletAddress)
    this.saveUserAuditData(data)
  }

  /**
   * Get default user audit data
   */
  private static getDefaultUserData(walletAddress?: string): UserAuditData {
    return {
      freeAuditsUsed: 0,
      totalAudits: 0,
      lastAuditDate: new Date().toISOString(),
      walletAddress
    }
  }

  /**
   * Get maximum number of free audits allowed
   */
  static getMaxFreeAudits(): number {
    return this.MAX_FREE_AUDITS
  }
}

// Create and export a singleton instance
export const userAuditTracker = new UserAuditTracker()

export default UserAuditTracker