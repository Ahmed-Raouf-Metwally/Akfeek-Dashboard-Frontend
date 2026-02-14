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

  async getAllWallets(params) {
    const { data } = await api.get('/admin/finance/wallets', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load wallets');
    return data.data; // { wallets: [], total, pages }
  },

  async getRefunds(params) {
    const { data } = await api.get('/admin/finance/refunds', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load refunds');
    return data.data;
  },

  async creditWallet(payload) {
    const { data } = await api.post('/admin/finance/wallet/credit', payload);
    if (!data.success) throw new Error(data.error || data.message || 'Failed to credit wallet');
    return data.data;
  },

  async debitWallet(payload) {
    const { data } = await api.post('/admin/finance/wallet/debit', payload);
    if (!data.success) throw new Error(data.error || data.message || 'Failed to debit wallet');
    return data.data;
  },

  async getWalletTransactions(walletId, params) {
    const { data } = await api.get(`/admin/finance/wallet/${walletId}/transactions`, { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load wallet transactions');
    return data.data;
  },

  // Points Methods
  async getPointsHistory(params) {
    const { data } = await api.get('/wallets/points/history', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load points history');
    return data;
  },

  async adjustPoints(payload) {
    const { data } = await api.post('/admin/finance/points/adjust', payload);
    if (!data.success) throw new Error(data.error || data.message || 'Failed to adjust points');
    return data.data;
  },

  async getPointsAudit(params) {
    const { data } = await api.get('/admin/finance/points/audit', { params });
    if (!data.success) throw new Error(data.error || data.message || 'Failed to load points audit');
    return data;
  },
};

export default walletService;
