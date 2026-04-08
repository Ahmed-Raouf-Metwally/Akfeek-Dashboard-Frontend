import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import ReviewCard from './ReviewCard';
import RatingStars from '../common/RatingStars';

/**
 * ReviewsList Component
 * Display paginated list of workshop reviews with filters
 */
const ReviewsList = ({ workshopId, isAdmin = false }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    rating: '',
    isVerified: '',
    isApproved: '' // Admin only
  });

  const [showFilters, setShowFilters] = useState(false);

  // Fetch reviews
  const { data, isLoading, error } = useQuery({
    queryKey: ['workshopReviews', workshopId, filters, isAdmin],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') params.append(key, value);
      });

      const endpoint = isAdmin
        ? `/api/workshops/admin/${workshopId}/reviews?${params}`
        : `/api/workshops/${workshopId}/reviews?${params}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
    enabled: !!workshopId
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          {t('workshops.reviews.loadError')}
        </p>
      </div>
    );
  }

  const reviews = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('workshops.reviews.title')} ({pagination.total})
        </h3>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Filter size={18} />
          {t('common.filters')}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('workshops.reviews.filterByRating')}
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                <option value="5">5 {t('workshops.reviews.stars')}</option>
                <option value="4">4 {t('workshops.reviews.stars')}</option>
                <option value="3">3 {t('workshops.reviews.stars')}</option>
                <option value="2">2 {t('workshops.reviews.stars')}</option>
                <option value="1">1 {t('workshops.reviews.star')}</option>
              </select>
            </div>

            {/* Verified Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('workshops.reviews.verifiedOnly')}
              </label>
              <select
                value={filters.isVerified}
                onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                <option value="true">{t('workshops.reviews.verifiedOnly')}</option>
                <option value="false">{t('workshops.reviews.unverified')}</option>
              </select>
            </div>

            {/* Admin: Approval Filter */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('workshops.reviews.approvalStatus')}
                </label>
                <select
                  value={filters.isApproved}
                  onChange={(e) => handleFilterChange('isApproved', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t('common.all')}</option>
                  <option value="true">{t('workshops.reviews.approved')}</option>
                  <option value="false">{t('workshops.reviews.hidden')}</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            {t('workshops.reviews.noReviews')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.showing')} {((pagination.page - 1) * filters.limit) + 1} - {Math.min(pagination.page * filters.limit, pagination.total)} {t('common.of')} {pagination.total}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isArabic ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {pagination.page} / {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isArabic ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
