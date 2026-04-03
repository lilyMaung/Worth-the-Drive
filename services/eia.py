import os
import requests
from dotenv import load_dotenv

#THIS WILL READ THE .ENV FILE, OS.GETENV()FETCHES THE VALUE BY NAME
load_dotenv()
#This takes a US State and gas type from the user and returns the current price per gallon from the US Government EIA database

#the code for 50 STATES in US
STATE_CODES = {
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

EIA_API_KEY = os.getenv("EIA_API_KEY")

  #we need the code for gas type because EIA won't understand the string gas_type
GAS_TYPE_CODES = {
    "regular": "EPM0",
    "midgrade": "EPM0M",
    "premium": "EPMP",
    "diesel": "EPD2D",
    "e85": "EPMRU",
    "gasoline": "EPM0"
}



def get_gas_price(state, gas_type):
  
    #creaing gas code
    product_code= GAS_TYPE_CODES.get(gas_type.lower())
    if not product_code:
        raise ValueError(f"Unknown gas type: {gas_type}")
    #getting the code for the state
    area_code = STATE_CODES.get(state.upper(),"NUS") #NUS is the code for national average
    if not area_code:
        raise ValueError(f"Unknown state: {state}")
    #building the url for the EIA API to get the gas price for the specified state and gas type
    url = f"https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key={EIA_API_KEY}&frequency=weekly&data[0]=value&facets[product][]={product_code}&facets[duoarea][]={area_code}&sort[0][column]=period&sort[0][direction]=desc&length=1"
    response = requests.get(url)
    response.raise_for_status() #check if the request was successful
    data=response.json()
    
    #extracting the gas price from the data
    gas_price= float(data["response"]["data"][0]["value"])
    return gas_price








#testing gas and state
#if __name__ == "__main__":
    #price = get_gas_price("TX", "regular")
    #print(f"Current regular gas price: ${price}")
    
    #price2 = get_gas_price("TX", "premium")
    #print(f"Current premium gas price: ${price2}")
    
#tx_price = get_gas_price("TX", "regular")
#print(f"Texas regular: ${tx_price}")

#ca_price = get_gas_price("CA", "regular")
#print(f"California regular: ${ca_price}")
#ny_price = get_gas_price("NY", "premium")
#print(f"New York premium: ${ny_price}")