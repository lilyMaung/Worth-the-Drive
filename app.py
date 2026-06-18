#asking my computer what is stored in my env setting
import os
#to receive requests, accept, converts
from flask import Flask, request, jsonify
# so that browsers could talk to each other
from flask_cors import CORS
#import the function that reads .env file & loads everything into my environment
from dotenv import load_dotenv
from services.calculator import calculate_trip_cost
# importing database and the table model, so that we can save the trip history to the database after we calculate the trip cost
from database import lilydb, TripHistory
import datetime
# for autocomplete function
import requests

import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


#The very first thing to call than everything else, this is loading the environment variables from .env
load_dotenv()
#every flask has this flask application object

# __name__ the name of the current python module
app = Flask(__name__)

#Enabling the CORS, telling browsers it's okay requests from other browsers
#To do- to make sure, it only accept requests from your front-end browser, put origins = ["my frontend"]
# Configure CORS origins. Use FRONTEND_ORIGIN env var to allow the deployed
# frontend (set this in Render or your hosting provider). We always allow
# localhost:3000 for local development.


CORS(app)

# connecting the database to flask
# configuring the database url
# reading the database url from my .env file
database_url = os.getenv("DATABASE_URL")

#to fix our postgres:// to postgresql:// for SQLAlchemy
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://",1)

if not database_url:
    database_url= "sqlite:///trips.db"
    print("Warning: no DATABASE_URL")
# SQLALCHEMY_DATABASE_URI is the key that SQLAlchemy looks for to know where the database is
app.config["SQLALCHEMY_DATABASE_URI"] = database_url

#disabling the feature that uses extra memory
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

#connecting the database to my flask app
lilydb.init_app(app)

#create the tables if they are not existed yet
with app.app_context():
    try:
        lilydb.create_all()
        print("Worth the drive database's tables are ready")
    except Exception as e:
        print(f"Having trouble in creating worth the drive database: {e}")

# option lists, CONSTANT VALUES 

VALID_GAS_TYPES = ["regular", "midgrade", "premium", "e85", "diesel"]
VALID_TRAFFIC   = ["city", "mixed", "highway"]
STATE_CODES ={
    "AL": "SAL", "AK": "SAK", "AZ": "SAZ", "AR": "SAR",
    "CA": "SCA", "CO": "SCO", "CT": "SCT", "FL": "SFL",
    "GA": "SGA", "HI": "SHI", "ID": "SID", "IL": "SIL",
    "IN": "SIN", "IA": "SIA", "KS": "SKS", "KY": "SKY",
    "LA": "SLA", "ME": "SME", "MD": "SMD", "MA": "SMA",
    "MI": "SMI", "MN": "SMN", "MS": "SMS", "MO": "SMO",
    "MT": "SMT", "NE": "SNE", "NV": "SNV", "NH": "SNH",
    "NJ": "SNJ", "NM": "SNM", "NY": "SNY", "NC": "SNC",
    "ND": "SND", "OH": "SOH", "OK": "SOK", "OR": "SOR",
    "PA": "SPA", "RI": "SRI", "SC": "SSC", "SD": "SSD",
    "TN": "STN", "TX": "STX", "UT": "SUT", "VT": "SVT",
    "VA": "SVA", "WA": "SWA", "WV": "SWV", "WI": "SWI",
    "WY": "SWY", "DC": "SDC"
}

#validating the front end input for the API to not receive the bad data

def validate_inputs(data):
    # starting from the required input
    required = ["start","destination","state","make","model","year","gas_type"]

    for field in required:
        if field not in data:
            return (f"Missing field: {field}")
        if not str(data[field]).strip():
            return(f"{field} cannot be empty")
        
    if len(data["start"].strip())<3:
        return "Start location is too short, please enter a full city!"
    
    if len(data["destination"].strip())<3:
        return "Destination location is too short, please enter a full city!"
    try:
        year = int(data["year"])
        if year < 1886 or year> datetime.datetime.now().year:
            return "Your car's year should be between 1886 and current year."
    except ValueError:
        return ("Year must be a number!")

    #validating the gas type 
    if data ["gas_type"].lower() not in VALID_GAS_TYPES:
        return ("Your gas type is not found!")

    #checking states 
    if data ["state"].upper() not in STATE_CODES:
        return("Your state cannot be found!")

    #validating the traffic
    if "traffic" in data and data["traffic"] not in VALID_TRAFFIC:
        return("Your traffic is not found!")
    return None

#checking health?
@app.route("/api/health", methods=["GET"])
def health():
    #if successful
    return jsonify ({"status":"ok", "version":"test123"}), 200

# routing to calculate
@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400
    error = validate_inputs(data)
    if error:
        # if not found
        return jsonify({"error": error}), 400
    #extracting the values 
    start = data["start"].strip()
    destination=data["destination"].strip()
    state=data["state"].upper()
    year=int(data["year"])
    make=data["make"].strip()
    model=data["model"].strip()
    gas_type=data["gas_type"].lower()
    #in order to prevent crashing if the key is missing
    traffic=data.get("traffic", "mixed")
    #try block in case if the API Callings failed
    try:
        result=calculate_trip_cost(start,destination,state, make, model, year, gas_type, traffic)
    #if the vehicle wasn't found in NHTSA database, 404-not found
        if result is None:
            return jsonify({"error": "Could not calculate trip. Check your vehicle details."}), 404
        try:
            trip = TripHistory(
                start=start,
                destination=destination,
                state=state,
                make=make,
                model=model,
                year=year,
                gas_type=gas_type,
                traffic=traffic,
                total_cost=result["total_cost"],
                distance=result["distance_miles"],
                gallons=result["gallons_used"]
            )
            lilydb.session.add(trip)
            lilydb.session.commit()
        except Exception as e:
            print(f"Could not save the trip: {e}")
            
        return jsonify(result), 200
    except Exception as e:
        #for debugging
        print(f"Error: {e}")
        #error message for the front end 
        return jsonify({
        "error": "Something went wrong. Please try again."
    }), 500
    
#autocomplete functions for location
@app.route("/api/autocomplete", methods=["GET"])
def autocomplete():
    #we need a search query string for whatever the user typed
    # read the search query from URL like /api/autocomplete
    # reads ?a=Los from the URL 
    query = request.args.get("q", "")

    #to not call the API over short queries
    if len(query)<3:
        return jsonify([]), 200
    
    #getting api geonify key from the .env
    geo_api_key = os.getenv("GEOAPIFY_API_KEY")

    #building the geonify url

    geo_url = f"https://api.geoapify.com/v1/geocode/autocomplete?text={query}&type=city&limit=5&apiKey={geo_api_key}"

    try:
        response = requests.get(geo_url, verify=False)
        data = response.json()
    
    
        # extract just the city names from the response
        suggestions =[]

        for feature in data.get("features",[]):
            suggestions.append(feature["properties"]["formatted"])
            print(f"API key: {geo_api_key}")  
            print(f"Query: {query}")   
        return jsonify (suggestions), 200
    except Exception as e:
        print(f"Autocomplete failed: {e}")
        return jsonify([]), 200

# this will return car makes for that year
# POST has data in body 
# GET has data in url
@app.route("/api/vehicles/makes", methods=["GET"])
#input will be year 
def get_makes():
    # read year from URL 
    year = request.args.get("year", "")

    #validating the year it has to be four digit
    if len(year) != 4:
        return jsonify([]), 200
    
    try:
        import xmltodict

        # same API from NHTSA.py 
        url = f"https://www.fueleconomy.gov/ws/rest/vehicle/menu/make?year={year}"
        response = requests.get(url, verify=False)

        # parsing XML to dict
        data = xmltodict.parse(response.text)
        items = data["menuItems"]["menuItem"]

        #handling single result vs list 
        if not isinstance (items, list):
            items =[items]

        # extracting the text value (make name) from each
        makes = [item["text"]for item in items]
        return jsonify(makes), 200
    
    except Exception as e:
        print(f"Makes error: {e}")
        return jsonify([]), 200

# this will return in a drop down if the user calls year from react and other will be in a drop down
# input- both year AND make to find models
# output- a list of model strings 
@app.route("/api/vehicles/models", methods=["GET"])
def get_models():
    year = request.args.get("year","")
    make = request.args.get("make","")

    #both are requried
    if not year or not make:
        return jsonify([]), 200
    try:
        import xmltodict

        url = f"https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year={year}&make={make}"
        response = requests.get(url, verify=False)

        #parsing through the data 
        data = xmltodict.parse(response.text)

        items = data["menuItems"]["menuItem"]
        
        if not isinstance (items, list):
            items =[items]

        models = [item["text"] for item in items]

        return jsonify(models), 200

    except Exception as e:
        print(f"Models error: {e}")
        return jsonify([]), 200

# a new end point for saving the trip
# GET because we are trying to fetch data  
@app.route("/api/trips/history", methods=["GET"])
def trip_history():
    try:
        trips = TripHistory.query\
            .order_by(TripHistory.created_at.desc())\
            .limit(10)\
            .all()
        return jsonify([t.to_dict() for t in trips]), 200
    except Exception as e:
        print(f"The database history cannot be fetched: {e}")
        return jsonify([]), 200





if __name__== "__main__":
    # u have to include FLASK_DEBUG=true in your .env file in order for this to work
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() =="true"
    app.run(debug=debug_mode, port=8080)

    