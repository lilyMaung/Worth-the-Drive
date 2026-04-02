from models import Car, Trip, GasEstimate, save_cars, load_cars

Car1=Car("MY CAr", "Camry", 2019, 32.0, "regular")
Trip1=Trip("Houston, TX", "Austin, TX", Car1)
GasEstimate1=GasEstimate(Trip1, 3.5, 165)
GasEstimate1.calculate_gas_cost("highway")
print(GasEstimate1.calculate_gas_cost("highway")) 

save_cars([Car1], "cars.json")
loaded = load_cars("cars.json")
print(loaded[0].describe())