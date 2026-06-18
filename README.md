Worth the Drive

<img width="1314" height="1102" alt="image" src="https://github.com/user-attachments/assets/c0b7d71a-f16e-438e-ac7c-4e727f99120e" />

Before explaining about the project, I will tell you why I decided to build this project. 
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
I will build more amazing things in the future too so follow along!


Worth the Drive 

Most trip planners tell you how long a drive takes but not how much fuel gonna cost.

Worth the Drive solves this by combining three live US government data sources.

This is where you will put your destination, your car information and the road.

<img width="1438" height="1348" alt="image" src="https://github.com/user-attachments/assets/33150582-cc1f-4d97-a0d7-ea871928443a" />


How far is the drive?

That will be taken care by an API named OSRM(aka OpenStreetMap) which will do the real routing of your start and destination.

How efficient is my car?

It's also important to know what car you are driving, and that will be helped by an API called NHTSA fueleconomy.gov with real EPA ratings.(Your car's MPG)
The MPG will be calculated automatically depending on your car model, years and make.

How much is gas right now??

The real purpose of this project, after getting information on your destination, car and your road, our project python backend will calculate with data fetched from EIA Energy API with the real gas price.
And after all these factors were executed, your gas price for the trip, your car's MPG,  and how many gallons you are using for this trip will be calculated as below.

For this example, I chose from San Jost to Berkeley!

<img width="1522" height="1290" alt="image" src="https://github.com/user-attachments/assets/57ce6daa-65cf-42db-a1b9-505059757151" />


Features

🔍 City Autocomplete — type a city, see suggestions instantly (Geoapify)
🚘 Smart Vehicle Lookup — type your year, make/model dropdowns auto-populate from NHTSA
⛽ Live Gas Prices — this week's actual price for your state from US Energy Dept
🛣️ Real Routing — actual driving miles via OpenStreetMap OSRM engine
🚦 Traffic Adjustment — adjusts MPG for city, mixed, or highway conditions
💾 Trip History — calculations persist to PostgreSQL
📱 Fully Responsive — works on mobile, tablet, and desktop
🌙 Dark Mode UI — elegant dark theme with custom design tokens

Architecture of Worth the Drive

  <img width="924" height="1028" alt="image" src="https://github.com/user-attachments/assets/e06ca662-9dfd-4772-af74-e6904f143579" />

Architecture Pattern: Layered Modular Monolith

API Layer — HTTP routing, validation, error responses
Orchestration Layer — coordinates 3 external services
Service Layer — one file per external API, single responsibility
Domain Layer — business logic, cost calculation, database models

🛠️ Tech Stack

Backend

Technology                          Purpose 

Python 3.9                          Language
Flask 3.1                           Web Framework
Flask SQLAlchemy                    ORM for PostgreSQL
Flask CORS                          Cross origin resources sharing
Gunicorn                            Production WSGI Server
Python dotenv                       Environment variable management
xmltodict                           XML --> Python dict parsing

Frontend

React 18                            UI Framework with hooks
Tailwind CSS                        Utility first styling
React select                        Searchable state dropdown
JavaScript ES6+                     Language

Database & Infrastructure

PostgreSQL                          Trip history persistence
Supabase                            Managed PostgreSQL hosting
Docker                              Containerization (backend + frontend)
Render                              Backend hosting (free tier)
Vercel                              Frontend hosting + CDN (free tier)

External APIs

API                      Data                         Provider

fueleconomy.gov          Vehicle MPG ratings          US Dept of Transportation
EIA API                  Weekly gas prices by state   US Energy Information Administration
OSRM                     Driving distances + routing  OpenStreetMap
Nominatim                Geocoding                    OpenStreetMap
Geoapify                 City autocomplete            Geoapify


🚀 Run Locally

Prerequisites

Python 3.9+
Node.js 18+
Docker Desktop (optional, for containerized run)
Free API keys (instructions below)

Option A — Run with Docker (recommended)

git clone https://github.com/lilyMaung/Worth-the-Drive.git
cd Worth-the-Drive
cp .env.example .env   # fill in your API keys
docker compose up --build

Backend available at http://localhost:8080

Option B — Run manually

Backend:

bashpython3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your API keys
python3 app.py

Frontend:

bashcd frontend
npm install
cp .env.example .env   # add your Geoapify key
npm start

Open http://localhost:3000

Worth the Drive Structure

<img width="1106" height="1024" alt="image" src="https://github.com/user-attachments/assets/f9fecf80-44b5-4756-a7bf-b8dfc107fe5d" />


I will try to come back do the Redis caching and CI/CD pipeline.

Lily Maung









