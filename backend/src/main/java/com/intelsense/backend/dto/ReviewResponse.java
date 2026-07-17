package com.intelsense.backend.dto;

import java.time.LocalDateTime;

public class ReviewResponse {
    private Long id;
    private String productName;
    private String reviewText;
    private Integer rating;
    private String email;
    private LocalDateTime createdAt;

    public ReviewResponse() {}

    public ReviewResponse(Long id, String productName, String reviewText, Integer rating, String email, LocalDateTime createdAt) {
        this.id = id;
        this.productName = productName;
        this.reviewText = reviewText;
        this.rating = rating;
        this.email = email;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getProductName() {
        return productName;
    }

    public String getReviewText() {
        return reviewText;
    }

    public Integer getRating() {
        return rating;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
