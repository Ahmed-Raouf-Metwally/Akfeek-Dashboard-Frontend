import api from './api';

/**
 * Wallet API. Get current user's wallet.
 * Backend: GET /api/wallets
 * Returns { success, data: { balance, pendingBalance, currency } }
 */
export const walletService = {
  async getMyWallet() {
    const { data } = await api.get('/wallets');
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load wallet');
    return data.data;
  },
};

export default walletService;
