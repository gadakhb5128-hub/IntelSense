package com.intelsense.backend.service;

import com.intelsense.backend.dto.ReviewRequest;
import com.intelsense.backend.dto.ReviewResponse;
import com.intelsense.backend.entity.Review;
import com.intelsense.backend.entity.User;
import com.intelsense.backend.repository.ReviewRepository;
import com.intelsense.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    public ReviewResponse createReview(String email, ReviewRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = new Review();
        review.setProductName(request.getProductName());
        review.setReviewText(request.getReviewText());
        review.setRating(request.getRating());
        review.setUser(user);
        Review saved = reviewRepository.save(review);

        return new ReviewResponse(saved.getId(), saved.getProductName(), saved.getReviewText(), saved.getRating(), user.getEmail(), saved.getCreatedAt());
    }

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(review -> new ReviewResponse(review.getId(), review.getProductName(), review.getReviewText(), review.getRating(), review.getUser().getEmail(), review.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return reviewRepository.findByUserId(user.getId()).stream()
                .map(review -> new ReviewResponse(review.getId(), review.getProductName(), review.getReviewText(), review.getRating(), review.getUser().getEmail(), review.getCreatedAt()))
                .collect(Collectors.toList());
    }
}
