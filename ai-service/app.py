from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="IntelSense AI Service")


class PredictRequest(BaseModel):
    review: str


class PredictResponse(BaseModel):
    sentiment: str
    confidence: float


class InsightRequest(BaseModel):
    reviews: list[str]


class InsightAspect(BaseModel):
    aspect: str
    sentiment: str
    score: int


class InsightResponse(BaseModel):
    summary: str
    recommendation: str
    alert: str
    aspects: list[InsightAspect]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    text = payload.review.lower()
    if any(word in text for word in ["excellent", "good", "great", "love", "amazing", "amazing"]):
        sentiment = "Positive"
        confidence = 0.96
    elif any(word in text for word in ["bad", "poor", "hate", "terrible", "worst", "late", "slow", "issue"]):
        sentiment = "Negative"
        confidence = 0.95
    else:
        sentiment = "Neutral"
        confidence = 0.88
    return PredictResponse(sentiment=sentiment, confidence=confidence)


@app.post("/insights", response_model=InsightResponse)
def insights(payload: InsightRequest):
    reviews = [review.lower() for review in payload.reviews if review]

    aspect_rules = {
        "battery": ["battery", "charge", "drain", "power"],
        "delivery": ["delivery", "late", "shipping", "arrived"],
        "camera": ["camera", "photo", "video", "lens"],
        "price": ["price", "cost", "expensive", "cheap"],
        "support": ["support", "service", "help", "customer"],
        "quality": ["quality", "build", "durable", "design"],
    }

    aspect_scores = {}
    for aspect, keywords in aspect_rules.items():
        positive = 0
        negative = 0
        for review in reviews:
            if any(keyword in review for keyword in keywords):
                if any(word in review for word in ["great", "excellent", "amazing", "good", "love"]):
                    positive += 1
                elif any(word in review for word in ["bad", "poor", "terrible", "worst", "late", "slow", "issue", "hate"]):
                    negative += 1
        aspect_scores[aspect] = {"positive": positive, "negative": negative}

    positive_reviews = sum(1 for review in reviews if any(word in review for word in ["great", "excellent", "amazing", "good", "love"]))
    negative_reviews = sum(1 for review in reviews if any(word in review for word in ["bad", "poor", "terrible", "worst", "late", "slow", "issue", "hate"]))

    if not reviews:
        summary = "No review data available yet."
        recommendation = "Start collecting customer feedback to generate executive insights."
        alert = "No alert triggered."
        aspects = []
    else:
        if negative_reviews > positive_reviews:
            summary = "Customer sentiment is slipping, with delivery and support concerns emerging as the biggest pain points."
            recommendation = "Prioritize logistics and support improvements to reduce churn risk."
            alert = "Early warning: negative feedback is increasing faster than positive feedback."
        else:
            summary = "Customer sentiment remains broadly positive, with strengths in product quality and camera experience."
            recommendation = "Double down on the features customers love and address a few recurring friction points."
            alert = "No critical alert triggered."

        aspects = []
        for aspect, scores in aspect_scores.items():
            if scores["positive"] or scores["negative"]:
                sentiment = "Positive" if scores["positive"] >= scores["negative"] else "Negative"
                score = max(scores["positive"], scores["negative"])
                aspects.append(InsightAspect(aspect=aspect, sentiment=sentiment, score=score))

    return InsightResponse(summary=summary, recommendation=recommendation, alert=alert, aspects=aspects)
