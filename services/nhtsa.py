import requests
import xmltodict
from Models.models import Car


# this function will call the options end point with year, make and model
#parse the xml response 
#return a list of vehicles IDs
def get_vehicle_id(make, model, year):
    try:
        url = f"https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year={year}&make={make}&model={model}"
        response = requests.get(url)
        response.raise_for_status() #check if the request was successful
    #   parsing the xml response to get the vehicle IDs
        data=xmltodict.parse(response.text)
        carList=data["menuItems"]["menuItem"]
    #if the car List is dictionary, then we have to put it in the list
        if not isinstance(carList, list):
            carList = [carList]
    #looping through the list and saving the IDs
        myCarIDs = []
        for car in carList:
            myCarIDs.append(car["value"])
            return myCarIDs
    except requests.RequestException as e:
        print(f"An error occurred while fetching vehicle IDs: {e}")
    return []

#getting the vehicle data 
def get_vehicle_data(vehicle_id):
    try:
        url = f"https://www.fueleconomy.gov/ws/rest/vehicle/{vehicle_id}"
        response= requests.get(url)
        response.raise_for_status() #check if the request was successful
        data = xmltodict.parse(response.text)
        vehicle_info = data["vehicle"]
        return vehicle_info
    except requests.RequestException as e:
        print(f"An error occurred while fetching vehicle data: {e}")
        return None

#this is confirming the gas type, if the user typed unrecognized text like "    Regular.  " 
#it's a way of validating the user input and making sure it matches the valid gas types we have in our car class
def normalize_gas_type(gas_type):
    gas_type= gas_type.strip().lower()
    if gas_type in Car.VALID_GAS_TYPES:
        return gas_type
    else:
        raise ValueError(f"Unknown gas type: {gas_type}")
    
#getting the mpg of the car based on the id and data of the vehicle ,make , year, model and gas type
def get_mpg(year, make, model, gas_type):
    try:
    # validating the gas type and normalizing it
        gas_type = normalize_gas_type(gas_type)
        vehicle_id = get_vehicle_id(make, model, year)
        #if the vehicle ID list is empty, we return None
        if not vehicle_id:
            raise ValueError(f"No vehicle found for {year} {make} {model}")
        for id in vehicle_id:
            vehicle_data= get_vehicle_data(id)
            if vehicle_data is None:
                continue
            #instead of comparing the gas type u have to check whether the word is inside
            if gas_type in vehicle_data["fuelType1"].strip().lower():
                mpg = vehicle_data["comb08"]
                return int(mpg)
        return None
    except ValueError as e:
        print(e)
        return None
    
#testing


#commad line should be this to test nhtsa.py 
# python3 -m services.nhtsa


#if __name__ == "__main__":
    #year = "2020"
    #make = "Toyota"
    #model = "Camry"
    #gas_type = "regular"
    
    #print(f"Testing get_vehicle_id...")
    #ids = get_vehicle_id(make, model, year)
    #print(f"Vehicle IDs: {ids}")
    
    #print(f"\nTesting get_vehicle_data...")
    #if ids:
        #data = get_vehicle_data(ids[0])
        #print(f"Vehicle Data: {data}")
    
    #print(f"\nTesting get_mpg...")
    #mpg = get_mpg(year, make, model, gas_type)
    #print(f"MPG: {mpg}")