from datetime import datetime
import json

class Car:
    VALID_GAS_TYPES = ["regular","midgrade","premium", "e85","gasoline", "diesel"]
    """Car class"""
    def __init__(self, make: str, model: str, year: int, mpg: float, gas_type: str):
        self.make = make
        self.model = model
        if year < 1886 or year > datetime.now().year:
            raise ValueError ("Your car cannot be older than 1886")
        else:
            self.year = year
        if mpg <= 0:
            raise ValueError ("Your car's mpg cannot be less than 0")
        else:
            self.mpg = mpg
        if  gas_type not in self.VALID_GAS_TYPES:
            raise ValueError ("Your gas type must be valid!")
        else:
            self.gas_type = gas_type


    def __repr__(self)->str:
        return (f"Your Car's representation : {self.year}, {self.make}, {self.model}, {self.gas_type}")


    def describe(self)->str:
        return(f"Your car's Description: {self.year}, {self.make}, {self.model}, {self.mpg}, {self.gas_type}")


    def to_dict(self):
        myCarDictionary = { 
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'mpg': self.mpg,
            'gas_type': self.gas_type
        }
        return myCarDictionary
        


    #to activate my car object from the dictionary, there is no existing car yet so u r using this to create the car object
    #We accept class as a parameter because we don't have any existing car object
    #Data is the dictionary that you are reading from 
    #from dictionary, we get value with the keys and those values are passedon to cls()to create an object
    @classmethod
    def from_dict(cls, car_data):
        return cls(car_data['make'], car_data['model'], car_data['year'], car_data['mpg'], car_data['gas_type'])
    
#Testing the car class
#car = Car("Toyota", "Camry", 2019, 32.0, "regular")
#print(car.describe())
#print(repr(car))
#print(car.to_dict())

# test from_dict round trip
#data = car.to_dict()
#car2 = Car.from_dict(data)
#print(car2.describe())

class Trip:
    """
     TRIP CLASS
    """
    def __init__(self, start:str, destination:str, car:Car):
        if not start:
            raise ValueError("Your starting point cannot be empty")    
        if not destination:
            raise ValueError("Your destination cannot be empty")     
        if start == destination:
            raise ValueError("You are stuck in the past. U need to move on!") 
        self.start = start    
        self.destination = destination     
        self.car= car

    def __repr__(self)->str:
        return f"Your Representation of trip: You start here: {self.start}, You are going to {self.destination}, You are driving {self.car}"

    def describe(self)->str:
         return f"Your Description of trip: You start here: {self.start}, You are going to {self.destination}, You are driving {self.car.describe()}"

    def to_dict(self):
        myTripDictionary = {
        'start' : self.start,
        'destination' : self.destination,
        'car': self.car.to_dict()
        }
        return myTripDictionary
    
    @classmethod
    def from_dict(cls, tripData):
        # you need to rebuild the car with car from dict function
        car = Car.from_dict(tripData['car'])
        return cls(tripData['start'],tripData['destination'],car)

#Tesing the trip class

#car = Car("Toyota", "Camry", 2019, 32.0, "regular")
#trip = Trip("Houston, TX", "Austin, TX", car)
#print(trip.describe())
#print(repr(trip))
#print(trip.to_dict())

# test from_dict round trip
#data = trip.to_dict()
#trip2 = Trip.from_dict(data)
#print(trip2.describe())

class GasEstimate:
    """ GasEstimate class"""
    def __init__ (self, trip:Trip, gas_price:float, distance_miles:float):
        
        if gas_price <=0:
            raise ValueError("Are you sure in this economy?")
        if distance_miles <= 0:
            raise ValueError("Please tell me your distance")
        self.gas_price = gas_price
        self.distance_miles=distance_miles
        self.trip=trip


    def __repr__(self)->str:
        return f"Your Representaion of Trip: {self.trip}, Your Gas Price: {self.gas_price}, Your distance in miles: {self.distance_miles}"

    def describe(self):
        return  f"Your Description of Trip: {self.trip}, Your Gas Price: {self.gas_price}, Your distance in miles: {self.distance_miles}"

    def to_dict(self):
        myGasEstimateDictionary = {
            'trip': self.trip.to_dict(),
            'gas_price': self.gas_price,
            'distance_miles': self.distance_miles
        }
        return myGasEstimateDictionary

    @classmethod 
    def from_dict(cls, gasData):
        trip = Trip.from_dict(gasData["trip"])
        return cls(trip, gasData["gas_price"], gasData["distance_miles"])

    #calculating the gas price based on the mpg, traffic type and gas price
    def calculate_gas_cost(self, traffic= "mixed"):
        factors = {
            "highway": 1.0,
            "mixed": 0.9,
            "city": 0.8
        }

        myCarmpg = self.trip.car.mpg * factors.get(traffic, 0.9)
        gallons_needed = self.distance_miles / myCarmpg
        total_gas_cost = gallons_needed * self.gas_price
        return {
    "total_cost": round(total_gas_cost, 2),
    "gallons_used": round(gallons_needed, 2),
    "adjusted_mpg": round(myCarmpg, 1),
    "distance_miles": self.distance_miles,
    "traffic": traffic
}

#testing the models file     
#car = Car("Toyota", "Camry", 2019, 32.0, "regular")
#trip = Trip("Houston, TX", "Austin, TX", car)
#estimate = GasEstimate(trip, gas_price=3.45, distance_miles=162.0)
#result = estimate.calculate_gas_cost(traffic="mixed")
#print(result)

#using JSON to save and load the data

#this function will turn the list of car objects into a dictionary usig to_dict()
#you have to call to dict() on each individual car inside the cars list
def save_cars(cars, filepath):
        with open(filepath, "w")as file:
            json.dump([car.to_dict() for car in cars], file, indent=2)
        

#reading the file and creeating car objects
def load_cars(filepath):
    try:
        #with automatically closes the file when I am done
        with open(filepath, "r") as file:
            # right now each data is a dictionary
            data= json.load(file)
            # we need to turn each dictionary into a car object
            # d is each loop while looping through data and Car object was created using each dictionary from the data
            return [Car.from_dict(d)for d in data]
    except FileNotFoundError as e:
        return []
    
#testing whether the json file works or not
# create some cars
car1 = Car("Toyota", "Camry", 2019, 32.0, "regular")
car2 = Car("Honda", "Civic", 2020, 36.0, "regular")

# save to file
save_cars([car1, car2], "cars.json")
print("Saved!")

# load back
loaded = load_cars("cars.json")
for car in loaded:
    print(car.describe())