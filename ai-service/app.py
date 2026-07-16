from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="IntelSense AI Service")

class PredictRequest(BaseModel):
    review: str

class PredictResponse(BaseModel):
    sentiment: str
    confidence: float

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    text = payload.review.lower()
    if any(word in text for word in ["excellent", "good", "great", "love", "amazing"]):
        sentiment = "Positive"
        confidence = 0.96
    elif any(word in text for word in ["bad", "poor", "hate", "terrible", "worst"]):
        sentiment = "Negative"
        confidence = 0.95
    else:
        sentiment = "Neutral"
        confidence = 0.88
    return PredictResponse(sentiment=sentiment, confidence=confidence)
