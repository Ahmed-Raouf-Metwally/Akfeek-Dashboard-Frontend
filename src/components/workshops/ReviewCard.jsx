import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, MessageSquare } from 'lucide-react';
import RatingStars from '../common/RatingStars';

/**
 * ReviewCard Component
 * Display individual workshop review
 */
const ReviewCard = ({ review, showWorkshopResponse = true }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const userName = review.user?.profile
    ? `${review.user.profile.firstName} ${review.user.profile.lastName}`
    : t('workshops.reviews.anonymous');

  const comment = isArabic ? review.commentAr || review.comment : review.comment;
  const response = isArabic ? review.responseAr || review.response : review.response;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
          
          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {userName}
              </h4>
              {review.isVerified && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-xs font-medium">
                    {t('workshops.reviews.verified')}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Rating */}
        <RatingStars rating={review.rating} size={18} />
      </div>

      {/* Comment */}
      {comment && (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {comment}
        </p>
      )}

      {/* Workshop Response */}
      {showWorkshopResponse && response && (
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-start gap-2">
            <MessageSquare size={18} className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {t('workshops.reviews.workshopResponse')}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {response}
              </p>
              {review.respondedAt && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {formatDate(review.respondedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
