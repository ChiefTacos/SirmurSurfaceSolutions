// src/components/GoogleReviewsBox.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GoogleReviewsBox = ({ placeId, apiKey }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch place details including reviews
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
        );

        if (response.data.status === 'OK') {
          setReviews(response.data.result.reviews || []);
        } else {
          setError('Failed to fetch reviews');
        }
      } catch (err) {
        setError('Error fetching reviews');
        console.error('API Error:', err.response || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [placeId, apiKey]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto my-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Google Reviews</h2>
      {loading && <p className="text-gray-500">Loading reviews...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && reviews.length === 0 && (
        <p className="text-gray-500">No reviews available.</p>
      )}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="border-b pb-4">
            <div className="flex items-center mb-2">
              <img
                src={review.profile_photo_url}
                alt={review.author_name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium text-gray-800">{review.author_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(review.time * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.31 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-600">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoogleReviewsBox;