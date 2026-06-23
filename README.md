
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

**Cold Start Notice:** To conserve free-tier cloud resources, Render automatically spins down our backend containers after 15 minutes of inactivity. **If you are the first evaluator to trigger a prediction in a while, the initial request may take 30–60 seconds to wake the server.** Once awake, all subsequent ML inference and routing will execute in milliseconds.
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
