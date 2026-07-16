package com.intelsense.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false, unique = true)
    private Review review;

    @Column(nullable = false, length = 30)
    private String sentiment;

    @Column(nullable = false)
    private Double confidence;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "prediction_time")
    private LocalDateTime predictionTime;

    public Prediction() {}

    @PrePersist
    protected void onCreate() {
        predictionTime = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Review getReview() {
        return review;
    }

    public void setReview(Review review) {
        this.review = review;
    }

    public String getSentiment() {
        return sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public LocalDateTime getPredictionTime() {
        return predictionTime;
    }
}
