import os
import requests
from dotenv import load_dotenv

#THIS WILL READ THE .ENV FILE, OS.GETENV()FETCHES THE VALUE BY NAME
load_dotenv()

EIA_API_KEY = os.getenv("EIA_API_KEY")
