import api from './api';

const ratingService = {
  getRatings: (params = {}) =>
    api.get('/ratings', { params }).then((r) => r.data),
};

export default ratingService;
