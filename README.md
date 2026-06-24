<div align="center">

# ⛽ Worth the Drive

**Find out if the gas is worth it before you go.**


<img width="1314" height="1102" alt="image" src="https://github.com/user-attachments/assets/c0b7d71a-f16e-438e-ac7c-4e727f99120e" />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://worth-the-drive.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.11-3b82f6?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)

*Before explaining about the project, I will tell you why I decided to build this project. 
As a software engineering student at SJSU, I was looking forward to building my very first own project.
At first, I tried to do the usual way, following tutorials from youtube but it made me feel bored and I couldn't do it.
One day, my friend and I were talking about where to go eat after school. 
She has two things I want most, a driver license and a car.
I have one thing that she wants, a passenger princess treatment.
I was talking about how we should go to Fremont from San Jose to eat a hot pot.
My friend got pissed because it was a rush hour, the horrible traffic and she started telling me about how expensive the gas price was.
I was like "Huh" maybe I should also know how much it cost to go from somewhere to somewhere to see if it worth the drive?
Then I started building this, at first, it was only with python as I was learning python then I wanted to make my project nicer, cleaner and better.
I started to add one after another, the whole learning process was very exciting to me as I was learning to build things that I am actually interested in.
Ofcourse there was debugging moments and vercel telling me about my failed deployments, which make me lose my hair but before, during and after this project is finished, I feel joy and it makes all worth it.
Anyway, this is a little note that I have for my very first own personal full stack project.
I will build more amazing things in the future too so follow along!*

</div>

---

## 🎯 The Problem

Most trip planners tell you **how long** a drive takes. None tell you **how much it'll cost**.

I built Worth the Drive to answer the real question: *"Is this drive actually worth it?"* — by combining three live U.S. government data sources into one real-time fuel cost calculator.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **City Autocomplete** | Instant suggestions as you type via Geoapify |
| 🚘 **Smart Vehicle Lookup** | Year → Make → Model dropdowns auto-populated from NHTSA |
| ⛽ **Live Gas Prices** | This week's actual prices by state from the U.S. Energy Dept (EIA) |
| 🛣️ **Real Routing** | Actual driving miles via OpenStreetMap OSRM engine |
| 🚦 **Traffic Adjustment** | City / Mixed / Highway MPG modes |
| 💾 **Trip History** | Calculations persist to PostgreSQL |
| 📱 **Fully Responsive** | Works on mobile, tablet, and desktop |
| 🌙 **Dark Mode UI** | Custom design tokens, premium dark aesthetic |

---

## 🧠 How It Works

Worth the Drive chains three independent government APIs in a single request:

```
User Input
    │
    ├─── OSRM (OpenStreetMap)     →  Real driving distance (miles)
    ├─── NHTSA / fueleconomy.gov  →  Your car's EPA-rated MPG
    └─── EIA Energy API           →  This week's gas price for your state
              │
              ▼
         Flask Backend
    (Orchestration + Calculation)
              │
              ▼
    Gallons Used × Gas Price = Your Trip Cost  💸
```

**Example:** San Jose → Berkeley

> Distance: 48.2 mi · MPG: 32 (city) · Gas: $4.87/gal → **$7.33 total**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│   Autocomplete · Vehicle Selector · Results UI  │
└──────────────────────┬──────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────┐
│               Flask API Layer                    │
│         Validation · Routing · Errors           │
├─────────────────────────────────────────────────┤
│            Orchestration Layer                   │
│       Coordinates 3 external API calls          │
├──────────────┬──────────────┬───────────────────┤
│ NHTSA Service│  EIA Service │   OSRM Service    │
│  (Car MPG)   │ (Gas Prices) │  (Route Miles)    │
├─────────────────────────────────────────────────┤
│            Domain Layer                          │
│   Cost Calculation · DB Models · Business Logic │
└──────────────────────┬──────────────────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │  (Trip History) │
              └─────────────────┘
```

**Pattern:** Layered Modular Monolith — one file per external service, single responsibility throughout.

---

## 🛠️ Tech Stack

### Backend
| Tool | Role |
|---|---|
| **Python 3.11 + Flask** | REST API, orchestration, business logic |
| **PostgreSQL + Supabase** | Trip history persistence |
| **Render** | Cloud deployment |

### Frontend
| Tool | Role |
|---|---|
| **React 18** | Component-based UI |
| **Vercel** | Static deployment + CDN |

### External APIs
| API | Data |
|---|---|
| [NHTSA / fueleconomy.gov](https://www.fueleconomy.gov/feg/ws/) | EPA-rated MPG by year/make/model |
| [EIA Energy API](https://www.eia.gov/opendata/) | Weekly gas prices by U.S. state |
| [OSRM](http://project-osrm.org/) | Real driving distance + routing |
| [Geoapify](https://www.geoapify.com/) | City name autocomplete |

---

## 📁 Project Structure

```
Worth-the-Drive/
├── app.py                      # Flask entry point
├── routes/
│   └── calculate.py            # API route handlers
├── services/
│   ├── nhtsa_service.py        # Vehicle & MPG lookups
│   ├── eia_service.py          # Gas price by state
│   └── osrm_service.py         # Route distance
├── domain/
│   ├── calculator.py           # Core cost calculation logic
│   └── models.py               # PostgreSQL models
├── frontend/
│   ├── src/
│   │   ├── components/         # React UI components
│   │   └── App.jsx
│   └── package.json
├── requirements.txt
└── docker-compose.yml
```

---

## 🚀 Run Locally

### Prerequisites
- Python 3.9+
- Node.js 18+
- Free API keys: [EIA](https://www.eia.gov/opendata/) · [Geoapify](https://www.geoapify.com/)

### Option A — Docker (recommended)

```bash
git clone https://github.com/lilyMaung/Worth-the-Drive.git
cd Worth-the-Drive
cp .env.example .env        # fill in your API keys
docker compose up --build
```

Backend → http://localhost:8080

### Option B — Manual

```bash
# Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 app.py

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env        # add your Geoapify key
npm start
```

Frontend → http://localhost:3000

---

## 🔑 Environment Variables

```env
# Backend (.env)
EIA_API_KEY=your_key_here
DATABASE_URL=your_supabase_connection_string

# Frontend (.env)
REACT_APP_GEOAPIFY_KEY=your_key_here
REACT_APP_API_URL=http://localhost:8080
```

---

## 💡 What I Learned

This was my **first personal full-stack project**, and I built it to solve a real problem I had. Key lessons:

- **API orchestration** — chaining three independent services with different response shapes, error modes, and rate limits
- **Layered architecture** — separating concerns so each layer has a single job
- **Database connectivity** — debugging Supabase IPv4/IPv6 routing through the connection pooler
- **Deployment pipelines** — tracing Vercel + Render failures to environment config and uncommitted changes
- **UI/UX iteration** — multiple redesign passes to reach a dark premium aesthetic that felt polished

---

## 🗺️ Roadmap

- [ ] Redis caching for repeated API calls (reduce latency + API usage)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] EV cost comparison mode
- [ ] Share trip link functionality

---

## 👩‍💻 Author

**Lily Maung** — Software Engineering student @ San Jose State University

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/lily-maung)
[![GitHub](https://img.shields.io/badge/GitHub-@lilyMaung-181717?style=flat-square&logo=github)](https://github.com/lilyMaung)

---

<div align="center">
  <sub>Built with curiosity, debugging tears, and a very strong opinion about gas prices as a person without a car, Lily.</sub>
</div>








