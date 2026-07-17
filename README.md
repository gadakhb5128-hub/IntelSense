# IntelSense

## AI Customer Sentiment Analysis & Business Intelligence Platform

### Project Type

**Artificial Intelligence + Full Stack Web Application + Business Intelligence Dashboard**

---

# 1. Project Overview

## What is IntelSense?

IntelSense is an AI-powered Customer Sentiment Analysis platform that helps businesses understand what customers think about their products and services.

Instead of manually reading thousands of reviews, the system automatically analyzes each review using Artificial Intelligence (BERT), classifies it as **Positive**, **Negative**, or **Neutral**, stores the results, and presents meaningful business insights through an interactive dashboard.

The project combines:

- Artificial Intelligence
- Natural Language Processing (NLP)
- Spring Boot Backend
- React Frontend
- MySQL Database
- Business Analytics

---

# 2. Problem Statement

Today's businesses receive customer feedback from many sources:

- Amazon
- Flipkart
- Meesho
- Snapdeal
- Google Reviews
- Company websites
- Customer support tickets
- Social media

Large companies may receive thousands of reviews every day.

Reading every review manually is:

- Time-consuming
- Expensive
- Prone to human error
- Difficult to monitor trends
- Hard to identify recurring issues

Because of this, companies often fail to detect customer dissatisfaction early.

---

# 3. Proposed Solution

IntelSense automates this entire process using Artificial Intelligence.

Instead of humans reading reviews:

Customer writes review

↓

System cleans the text

↓

AI understands the meaning

↓

Predicts sentiment

↓

Stores the result

↓

Shows interactive business analytics

↓

Business takes action

---

# 4. Objectives

The main objective is to develop an intelligent application capable of automatically understanding customer opinions and providing real-time business insights.

### Specific Objectives

- Build a secure web application.
- Accept customer reviews.
- Automatically classify sentiments.
- Generate business analytics.
- Display visual reports.
- Improve decision making.
- Reduce manual effort.
- Demonstrate AI integration in enterprise software.

---

# 5. Target Users

## Administrator

Responsible for managing the entire platform.

Can:

- Login
- View Dashboard
- Manage Users
- View Reviews
- Delete Reviews
- View Analytics
- Export Reports

---

## Customer/User

Can:

- Register
- Login
- Submit Reviews
- Edit Own Reviews
- Delete Own Reviews
- View Previous Reviews

---

# 6. Core Modules

## Module 1 – Authentication

Purpose:

Secure access.

Features:

- Register
- Login
- JWT Authentication
- Password Encryption
- Role Management
- Session Security

Technology

Spring Security

JWT

BCrypt

---

## Module 2 – User Management

Purpose

Manage all users.

Features

- Create User
- Update User
- Delete User
- View Profile
- User Status
- Role Assignment

---

## Module 3 – Review Management

Purpose

Store customer feedback.

Features

- Submit Review
- Edit Review
- Delete Review
- Search Reviews
- Filter Reviews
- Pagination

---

## Module 4 – AI Sentiment Engine

This is the heart of IntelSense.

Responsibilities

- Text Cleaning
- Tokenization
- Stop Word Removal
- BERT Prediction
- Confidence Score
- Return Sentiment

Input

```
"The delivery was very late but the product quality is excellent."
```

Output

```
Sentiment : Neutral

Confidence : 92.4%
```

---

## Module 5 – AI Communication

Spring Boot sends review text to FastAPI.

FastAPI loads the BERT model.

FastAPI returns

```
{
  "sentiment":"Positive",
  "confidence":0.987
}
```

Spring Boot stores it inside MySQL.

---

## Module 6 – Dashboard

The dashboard gives management an overview of customer feedback.

Shows

- Total Reviews
- Total Users
- Positive Reviews
- Negative Reviews
- Neutral Reviews
- Average Rating
- AI Accuracy
- Recent Reviews

---

## Module 7 – Analytics

The analytics module converts raw data into business insights.

Charts

- Pie Chart
- Line Chart
- Bar Chart
- Area Chart

Statistics

- Monthly Trends
- Daily Trends
- Weekly Trends
- Product-wise Sentiment
- Category-wise Analysis

---

## Module 8 – Reports

Generate

- CSV
- Excel
- PDF

Management can download reports for meetings.

---

# 7. AI Workflow

```
Customer Review
        │
        ▼
Text Cleaning
        │
        ▼
Tokenization
        │
        ▼
BERT Transformer
        │
        ▼
Sentiment Prediction
        │
        ▼
Confidence Score
        │
        ▼
Spring Boot
        │
        ▼
MySQL Database
        │
        ▼
Dashboard
```

---

# 8. System Architecture

```
                    React Frontend
                           │
                    REST API (Axios)
                           │
                           ▼
              Spring Boot Backend (Java)
     ┌────────────────────────────────────────┐
     │ Authentication                         │
     │ User Management                        │
     │ Review Management                      │
     │ Analytics                              │
     │ AI Integration                         │
     └────────────────────────────────────────┘
               │                     │
               ▼                     ▼
          MySQL Database      FastAPI AI Service
                                     │
                           Hugging Face BERT
```

---

# 9. Database Design

Main Tables

- Roles
- Users
- Reviews
- Predictions

Relationships

- One Role → Many Users
- One User → Many Reviews
- One Review → One Prediction

---

# 10. Technologies

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT
- Maven

---

## Frontend

- React.js
- Vite
- Axios
- React Router
- Recharts

---

## AI

- Python
- FastAPI
- Hugging Face Transformers
- BERT
- PyTorch
- NLTK
- spaCy

---

## Database

- MySQL

---

## Tools

- VS Code
- GitHub Codespaces
- GitHub
- Postman
- MySQL Workbench

---

## Run Locally

### Backend
```bash
cd backend
mvn spring-boot:run
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker Compose
```bash
docker compose up --build
```

---

# 11. Future Enhancements

Once the core system is complete, we can add advanced features such as:

- Multi-language sentiment analysis (English, Hindi, Marathi)
- Aspect-Based Sentiment Analysis (e.g., delivery, price, quality)
- Fake review detection
- Email alerts for sudden spikes in negative reviews
- Real-time streaming analytics
- AI-powered review summarization
- Product comparison dashboards
- Cloud deployment with Docker and Kubernetes

---

# 12. Expected Outcomes

By the end of the project, IntelSense will provide:

- A secure full-stack web application for customer feedback management.
- AI-powered sentiment classification using a BERT model.
- Automatic storage and management of review data.
- Interactive dashboards with charts and trends.
- Business reports that support decision-making.
- A scalable architecture that separates the frontend, backend, AI service, and database.