import pytest

from Models.models import Car, Trip, GasEstimate, save_cars, load_cars

#Car tests
def test_car_creating_correctly():
    car = Car("Toyota", "Camry", 2019, 32.0, "regular")
    assert car.make =="Toyota"
    assert car.model == "Camry"
    assert car.year == 2019
    assert car.mpg == 32.0
    assert car.gas_type == "regular"


def test_car_bad_mpg():
    with pytest.raises(ValueError):
        Car("Toyota", "Camry", 2019, -5.0, "regular")

def test_car_zero_mpg():
    with pytest.raises(ValueError):
        Car("Toyota", "Camry", 2019, 0.0, "regular")

def test_car_bad_years_old():
    with pytest.raises(ValueError):
        Car("Toyota", "Camry", 1800, 32.0, "regular")

def test_car_bad_years_future():
    with pytest.raises(ValueError):
        Car("Toyota", "Camry", 3000, 32.0, "regular")

def test_car_bad_gas_type():
    with pytest.raises(ValueError):
        Car("Toyota", "Camry", 2019, 32.0, "water")

def test_car_describe():
    car=Car("Toyota", "Camry", 2019, 32.0, "regular")
    assert "Toyota" in car.describe()
    assert "Camry" in car.describe()
    assert "2019" in car.describe()
    assert "32.0" in car.describe()
    assert "regular" in car.describe()

def test_car_to_dict():
    car=Car("Toyota", "Camry", 2019, 32.0, "regular")
    car_dict = car.to_dict()
    assert car_dict['make'] == "Toyota"
    assert car_dict['model'] == "Camry"
    assert car_dict['year'] == 2019
    assert car_dict['mpg'] == 32.0
    assert car_dict['gas_type'] == "regular"

def test_car_from_dict():
    car_data = {
        'make': "Toyota",
        'model': "Camry",
        'year': 2019,
        'mpg': 32.0,
        'gas_type': "regular"
    }
    car = Car.from_dict(car_data)
    assert car.make == "Toyota"
    assert car.model == "Camry"
    assert car.year == 2019
    assert car.mpg == 32.0
    assert car.gas_type == "regular"

#Trip tests
def test_trip_creating_correctly():
    car = Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    assert trip.start == "Houston, TX"
    assert trip.destination == "Austin, TX"
    assert trip.car == car

def test_trip_empty_start():
    car = Car("Toyota", "Camry", 2019, 32.0, "regular")
    with pytest.raises(ValueError):
        Trip("", "Austin, TX", car)

def test_trip_empty_destination():
    car = Car("Toyota", "Camry", 2019, 32.0, "regular")
    with pytest.raises(ValueError):
        Trip("Houston, TX", "", car)

def test_trip_same_start_and_destination():
    car = Car("Toyota", "Camry", 2019, 32.0, "regular")
    with pytest.raises(ValueError):
        Trip("Houston, TX", "Houston, TX", car)

def test_trip_describe():
    car = Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    description = trip.describe()
    assert "Houston, TX" in description
    assert "Austin, TX" in description
    assert "Toyota" in description
    assert "Camry" in description
    assert "2019" in description
    assert "32.0" in description
    assert "regular" in description

def test_trip_to_dict():
    car = Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    trip_dict = trip.to_dict()
    assert trip_dict['start'] == "Houston, TX"
    assert trip_dict['destination'] == "Austin, TX"
    assert trip_dict['car']['make'] == "Toyota"
    assert trip_dict['car']['model'] == "Camry"
    assert trip_dict['car']['year'] == 2019
    assert trip_dict['car']['mpg'] == 32.0
    assert trip_dict['car']['gas_type'] == "regular"

def test_trip_from_dict():
    trip_data = {
        'start': "Houston, TX",
        'destination': "Austin, TX",
        'car': {
            'make': "Toyota",
            'model': "Camry",
            'year': 2019,
            'mpg': 32.0,
            'gas_type': "regular"
        }
    }
    trip = Trip.from_dict(trip_data)
    assert trip.start == "Houston, TX"
    assert trip.destination == "Austin, TX"
    assert trip.car.make == "Toyota"
    assert trip.car.model == "Camry"
    assert trip.car.year == 2019
    assert trip.car.mpg == 32.0
    assert trip.car.gas_type == "regular"

#GasEstimate Tests
def test_gasestimate_bad_price():
    car= Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    with pytest.raises(ValueError):
        GasEstimate(trip, -3.5, 165) 

def test_gasestimate_bad_distance():
    car= Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    with pytest.raises(ValueError):
        GasEstimate(trip, 3.5, -165)

def test_gasestimate_zero_price():
    car= Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    with pytest.raises(ValueError):
        GasEstimate(trip, 0.0, 165)

def test_gasestimate_zero_distance():
    car= Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    with pytest.raises(ValueError):
        GasEstimate(trip, 3.5, 0.0)

def test_gasestimate_highway():
    car= Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    gas_estimate = GasEstimate(trip, 3.5, 165)
    result = gas_estimate.calculate_gas_cost("highway")
    assert result["total_cost"] == 18.05
    assert result["traffic"] == "highway"

def test_gasestimate_city():
    car= Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    gas_estimate = GasEstimate(trip, 3.5, 165)
    result = gas_estimate.calculate_gas_cost("city")
    assert result["total_cost"] == 22.56
    assert result["traffic"] == "city"

def test_gasestimate_mixed():
    car = Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    estimate = GasEstimate(trip, 3.5, 165.0)
    result = estimate.calculate_gas_cost("mixed")
    assert result["total_cost"] == 20.05
    assert result["traffic"] == "mixed"

def test_gasestimate_default_traffic():
    car = Car("Toyota", "Camry", 2019, 32.0, "regular")
    trip = Trip("Houston, TX", "Austin, TX", car)
    estimate = GasEstimate(trip, 3.5, 165.0)
    result = estimate.calculate_gas_cost()
    assert result["traffic"] == "mixed"

#JSON Tests
# tmp_path is a built in pytest fixture that creates a temporary directory for testing file operations. It ensures that any files created during the test are automatically cleaned up afterward, preventing clutter and potential conflicts with other tests.
def test_save_and_load_cars(tmp_path):
    car = Car("Toyota", "Camry", 2019, 32.0, "regular")
    filepath = str(tmp_path/ "test_cars.json")
    save_cars([car], filepath)
    loaded= load_cars(filepath)
    assert len(loaded) == 1
    assert loaded[0].make == "Toyota"
    assert loaded[0].model == "Camry"
    assert loaded[0].year == 2019
    assert loaded[0].mpg == 32.0
    assert loaded[0].gas_type == "regular"

def test_save_and_load_multiple_cars(tmp_path):
    car1 = Car("Toyota", "Camry", 2019, 32.0, "regular")
    car2 = Car("Honda", "Civic", 2020, 35.0, "midgrade")
    filepath = str(tmp_path/ "test_cars.json")
    save_cars([car1, car2], filepath)
    loaded = load_cars(filepath)
    assert len(loaded) == 2
    assert loaded[0].make == "Toyota"
    assert loaded[1].make == "Honda"
    assert loaded[0].model == "Camry"
    assert loaded[1].model == "Civic"
    assert loaded[0].year == 2019
    assert loaded[1].year == 2020
    assert loaded[0].mpg == 32.0
    assert loaded[1].mpg == 35.0
    assert loaded[0].gas_type == "regular"
    assert loaded[1].gas_type == "midgrade"

def test_load_missing_file(tmp_path):
    filepath= tmp_path / "missing.json"
    result = load_cars(filepath)
    assert result == []