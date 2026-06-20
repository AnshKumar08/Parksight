# ParkSight

## The Issue: Reactive Infrastructure Costs

Infrastructure and traffic control systems in cities have reached their limits due to rapid urbanization. Urban dispatch and parking management have historically been completely reactive; authorities only use resources to resolve traffic jams, collisions, or unauthorized parking **after they have already resulted in cascading delays**.

This reactionary strategy leads to:

- Localized bottleneck sites
- Thousands of lost commuter hours
- Increased carbon emissions from idle vehicles
- Inefficient workforce deployment

---

## Proactive Resource Allocation: Our Approach

**ParkSight** is a B2B predictive command center designed for:

- Smart city dispatchers
- Traffic authorities
- Urban planners
- Parking infrastructure operators

Rather than waiting for congestion to occur, ParkSight uses a prediction engine to:

- Detect high-risk zones
- Forecast parking violations
- Calculate severity-based **Choke Scores**
- Recommend proactive dispatch actions

The platform analyzes historical patterns and real-time signals to identify the **Top 5 Priority Dispatch Zones** through an enterprise-grade command dashboard.

This enables authorities to improve two critical KPIs:

- **Commuter Hours Saved**
- **Carbon Idle Reduction**

---

## Essential Features

### Predictive Forecasting Engine

Produces localized forecasts for specific geohash regions, including:

- Expected parking violations
- Choke Scores
- Time-based hotspot predictions

### Live Dispatch Dashboard

A map-integrated command interface that allows dispatchers to:

- Monitor high-risk zones
- Assess severity levels
- Deploy resources proactively

### Scalable API Gateway

Designed for seamless integration with municipal systems and external data sources, making ParkSight plug-and-play for smart city deployments.

---

## Engineering & Technical Architecture

ParkSight is built as a fully decoupled cloud-native microservice architecture.

This separation ensures that real-time dispatch operations are never blocked by computationally intensive prediction workloads.

### Frontend (The Client)

- React + Vite
- Deployed on Vercel Edge Network
- Low-latency user experience
- Responsive dashboard interface

### Backend (The Dispatcher)

- Java Spring Boot REST API
- Acts as API Gateway and data router
- Dockerized using Eclipse Temurin JRE
- Deployed on Render
- Optimized for cloud portability and memory efficiency

### AI Engine (The Analyst)

- Python FastAPI microservice
- Runs independently from the backend
- Executes machine learning inference
- Supports asynchronous scaling

---

## Impact & Business Viability

ParkSight is designed as a scalable B2B platform for:

- Smart city governments
- Municipal traffic departments
- Parking infrastructure startups

By shifting traffic management from a reactive model to a predictive one, ParkSight delivers measurable ROI through:

- Reduced congestion
- Optimized workforce deployment
- Improved commuter experience
- Lower carbon emissions

---

# ParkSight

### AI-Powered Parking Enforcement Command Center

**Predict · Dispatch · Reduce Congestion**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![CatBoost](https://img.shields.io/badge/CatBoost-1.2.5-FFCC00?style=flat-square)](https://catboost.ai/)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)](https://www.python.org/)

---

## Overview

**ParkSight** is a full-stack urban intelligence platform that uses machine learning to predict illegal parking hotspots across Bengaluru and enables traffic enforcement authorities to dispatch patrol units proactively — before violations occur.

The system uses a trained **CatBoost** regression model that predicts parking violations for hundreds of geohash zones based on the time of day and day of the week, then ranks them by a computed **Choke Score** (_violations × junction penalty_) to surface the highest-priority dispatch targets.

---

## Architecture

```text
┌─────────────────────┐
│ React Frontend      │
│ Vite + Leaflet      │
│ :5173               │
└──────────┬──────────┘
           │ POST /api/v1/dispatch/predict
           ▼
┌─────────────────────┐
│ Spring Boot API     │
│ Gateway :8080       │
└──────────┬──────────┘
           │ POST /predict_hotspots
           ▼
┌─────────────────────┐
│ Python ML Engine    │
│ FastAPI + CatBoost  │
│ :8000               │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ CatBoost Model      │
│ + Geohash Data      │
└─────────────────────┘
```

---

## Features

| Feature             | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| Live Hotspot Map    | Interactive Leaflet map with predicted violation hotspots       |
| Predictive Engine   | CatBoost model predicts violations using cyclical time encoding |
| Choke Score Ranking | Prioritizes zones by impact severity                            |
| Dispatch Table      | Top 5 actionable zones with severity indicators                 |
| One-Click Dispatch  | Simulated patrol dispatch functionality                         |
| Impact Metrics      | Commuter hours saved and carbon reduction estimates             |
| Dark / Light Mode   | Full theme support                                              |
| Resizable Layout    | Adjustable dashboard panels                                     |

---

## Tech Stack

### Frontend

- React 18
- Vite
- React Leaflet
- Leaflet
- Tailwind CSS
- Lucide React
- React Hot Toast

### Backend

- Java 17
- Spring Boot 3.3
- Maven
- Spring Web

### ML Engine

- Python 3.10+
- FastAPI
- CatBoost
- Pandas
- NumPy
- Pydantic

---

## Deployment

| Service   | Platform |
| --------- | -------- |
| Frontend  | Vercel   |
| Backend   | Render   |
| AI Engine | Render   |

---

## Business Value

ParkSight transforms urban traffic management from a **reactive** model into a **predictive** model.

### Benefits

- Reduced traffic congestion
- Faster response times
- Improved resource allocation
- Lower carbon emissions
- Measurable operational ROI
- Scalable smart-city deployment

---
