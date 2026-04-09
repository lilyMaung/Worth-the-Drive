#asking my computer what is stored in my env setting
import os
#to receive requests, accept, converts
from flask import Flask, request, jsonify
# so that browsers could talk to each other
from flask_cors import CORS
#import the function that reads .env file & loads everything into my environment
from dotenv import load_dotenv
from services.calculator import calculate_trip_cost
#to validate the year 
import datetime

#The very first thing to call than everything else, this is loading the environment variables from .env
load_dotenv()
#every flask has this flask application object

# __name__ the name of the current python module
app = Flask(__name__)

#Enabling the CORS, telling browsers it's okay requests from other browsers
#To do- to make sure, it only accept requests from your front-end browser, put origins = ["my frontend"]
CORS(app)


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
    required = ["start","destination","state","make","model","year","gas_type","traffic"]

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
    return jsonify ({"status":"ok"}), 200

# routing to calculate
@app.route("/api/health", methods=["GET"])
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
        return jsonify(result), 200
    except Exception as e:
        #for debugging
        print(f"Error: {e}")
        #error message for the front end 
        return jsonify({
        "error": "Something went wrong. Please try again."
    }), 500


if __name__== "__main__":
    # u have to include FLASK_DEBUG=true in your .env file in order for this to work
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() =="true"
    app.run(debug=debug_mode, port=8000)

    