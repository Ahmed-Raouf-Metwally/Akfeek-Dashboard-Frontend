import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import RatingStars from '../common/RatingStars';

/**
 * ReviewForm Component
 * Form to submit a new workshop review
 */
const ReviewForm = ({ workshopId, bookingId = null, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    commentAr: ''
  });

  const [errors, setErrors] = useState({});

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workshops/${workshopId}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...data,
            bookingId
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(isArabic ? data.messageAr : data.message);
      
      // Reset form
      setFormData({ rating: 0, comment: '', commentAr: '' });
      setErrors({});
      
      // Invalidate queries
      queryClient.invalidateQueries(['workshopReviews', workshopId]);
      queryClient.invalidateQueries(['workshop', workshopId]);
      
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const validate = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = t('workshops.reviews.ratingRequired');
    }

    if (!formData.comment && !formData.commentAr) {
      newErrors.comment = t('workshops.reviews.commentRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    submitReview.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {t('workshops.reviews.writeReview')}
      </h3>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('workshops.reviews.yourRating')} *
        </label>
        <RatingStars
          rating={formData.rating}
          size={32}
          interactive
          onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
        />
        {errors.rating && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.rating}
          </p>
        )}
      </div>

      {/* Comment (English) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('workshops.reviews.comment')} (English) *
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t('workshops.reviews.commentPlaceholder')}
        />
        {errors.comment && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.comment}
          </p>
        )}
      </div>

      {/* Comment (Arabic) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('workshops.reviews.comment')} (العربية)
        </label>
        <textarea
          value={formData.commentAr}
          onChange={(e) => setFormData(prev => ({ ...prev, commentAr: e.target.value }))}
          rows={4}
          dir="rtl"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t('workshops.reviews.commentPlaceholderAr')}
        />
      </div>

      {/* Verified Badge */}
      {bookingId && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ {t('workshops.reviews.verifiedPurchase')}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitReview.isPending}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitReview.isPending ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            {t('common.submitting')}
          </>
        ) : (
          <>
            <Send size={20} />
            {t('workshops.reviews.submitReview')}
          </>
        )}
      </button>
    </form>
  );
};

export default ReviewForm;
