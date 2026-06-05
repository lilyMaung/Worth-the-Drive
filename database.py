from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# we are creating database object, aka initializing the database, but we are not connecting it to the flask app yet.
# this will attached to flask app in app.py

lilydb = SQLAlchemy()

#this is my database table
# each attribute is one column in the table. 

class TripHistory(lilydb.Model):
# creating a table
    __tablename__='trip_history'
    # if you put the primary key to true, it means it can be empty but if it's false, then it means it cannot be empty
    # database.Interger means the data type of this column is integer, and database.String(100) means the data type of this column is string with a maximum length of 100 characters.
    id = lilydb.Column(lilydb.Integer, primary_key=True)
    start = lilydb.Column(lilydb.String(100), nullable=False)
    destination=lilydb.Column(lilydb.String(100), nullable=False)
    # the string is 2 cause it's the state initials
    state = lilydb.Column(lilydb.String(2), nullable=False)
    make = lilydb.Column(lilydb.String(100), nullable=False)
    model= lilydb.Column(lilydb.String(100), nullable=False)
    year= lilydb.Column(lilydb.Integer, nullable=False)
    gas_type= lilydb.Column(lilydb.String(50), nullable=False)
    traffic= lilydb.Column(lilydb.String(50), nullable=False)
    total_cost= lilydb.Column(lilydb.Float, nullable=False)
    distance = lilydb.Column(lilydb.Float, nullable=False)
    gallons = lilydb.Column(lilydb.Float, nullable=False)
    # created at is the time when you saved the data or create
    # this will automatically save the time when you create a new record, and it will never be empty because of the default value.
    create_at = lilydb.Column(lilydb.DateTime, default=datetime.utcnow)

# this is a method to convert the data in the database to a dictionary, so that we can easily convert it to json format when we want to send it to the frontend.
def to_dict(self):
    return {
        "id": self.id,
        "start": self.start,
        "destination": self.destination,
        "state": self.state,
        "make": self.make,
        "model": self.model,
        "year": self.year,
        "gas_type": self.gas_type,
        "traffic": self.traffic,
        "total_cost": self.total_cost,
        "distance": self.distance,
        "gallons": self.gallons,
        "created_at": self.create_at.isoformat()
    }
