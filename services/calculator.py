from services import osrm
from services import eia  
from services import nhtsa
from Models.models import Car, Trip, GasEstimate

#function that will call the real time information depending on the user inputs
def calculate_trip_cost(start, destination, state, make, model, year, gas_type, traffic="mixed"):
    try:
        real_mpg = nhtsa.get_mpg(year, make, model, gas_type)
    except ValueError as e:
        raise ValueError(f"Could not find MPG for {year} {make} {model} with gas type {gas_type}: {e}")
    try:
        real_gas_price = eia.get_gas_price(state, gas_type)
    except ValueError as e:
        raise ValueError(f"Could not get gas price for {state} and {gas_type}: {e}")
    try:
        real_route = osrm.get_route(start, destination)
    except ValueError as e:
        raise ValueError(f"Could not get route from {start} to {destination}: {e}")
    # creating car from the user input and the real mpg we got from nhtsa
    user_car = Car(make, model, year, real_mpg, gas_type)
    user_trip=Trip(start, destination, user_car)
    user_gas_estimate = GasEstimate(user_trip, real_gas_price, real_route["distance_miles"])
    return user_gas_estimate.calculate_gas_cost(traffic)

#testing 
if __name__== "__main__":
    start="Houston, TX"
    destination="Austin, TX"
    state="TX"
    make="Toyota"
    model="Camry"
    year=2020
    gas_type="regular"
    traffic="mixed"
    print(calculate_trip_cost(start, destination, state, make, model, year, gas_type, traffic))

