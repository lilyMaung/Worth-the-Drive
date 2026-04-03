import requests


OSRM_URL = "http://router.project-osrm.org/route/v1/driving" 

def get_coordinates(location):
    #creating the url for the nominatim api to get the coordinates of the location
    url1 = f"https://nominatim.openstreetmap.org/search?q={location}&format=json&limit=1"
    #calling the api and storing the response
    response = requests.get(url1, headers={
        #we put this to tell Nominatim who is calling them
        "User-Agent": "WorthTheDrive/1.0"
    })
    #converting the response to python data
    #we use .json() for HTTP responses instead of json.load()
    data = response.json()
    #checking if the python list data is empty or not
    if not data:
        raise ValueError(f"Location not found: {location}")
    #extracting the latitude and longitude from the data
    # we have to change it to float because they came back as strings
    lat = float(data[0]["lat"])
    lon = float(data[0]["lon"])
    return (lat, lon) #return as a tuple

def get_route(origin, destination):
    #get lat and lon of each location and store them
    lat1, lon1 = get_coordinates(origin)
    lat2, lon2 =get_coordinates(destination)
    #building the OSRM url
    url2 = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
    response = requests.get(url2)
    data = response.json()
    # you got the python data list now u have to extract distance from each
    #routes is a list of possible routes, we want the first one, then legs is a list of legs of the route, we want the first one, then distance and duration are the values we want to extract
    distance_meters = data["routes"][0]["legs"][0]["distance"]
    duration_seconds = data["routes"][0]["legs"][0]["duration"]
    #convert distance to miles and duration to hours
    distance_miles = distance_meters * 0.000621371
    duration_hours = duration_seconds /3600
    #returning a dictionary with rounded distance
    return {
        "distance_miles":round(distance_miles,1),
        "duration_hours":round(duration_hours,1)
    }

#testing
#if __name__ == "__main__":
    # test get_coordinates
    #coords = get_coordinates("Houston, TX")
    #print(f"Houston coordinates: {coords}")
    
    # test get_route
    #route = get_route("Houston, TX", "Austin, TX")
    #print(f"Route result: {route}")