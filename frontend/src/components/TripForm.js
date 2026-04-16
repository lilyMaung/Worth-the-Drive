import React, { useState , useEffect} from 'react';




//useEffect lets my code run when sth changes
// valid options - must match Flask backend exactly
const GAS_TYPES     = ["regular", "midgrade", "premium", "e85", "diesel"];
const TRAFFIC_TYPES = ["city", "mixed", "highway"];
const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","FL","GA","HI",
  "ID","IL","IN","IA","KS","KY","LA","ME","MD","MA",
  "MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM",
  "NY","NC","ND","OH","OK","OR","PA","RI","SC","SD",
  "TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
];

// onResult is a function passed down from App.js
// when we get a result we call onResult(data) to send it back up
function TripForm({ onResult }) 
{


  // is the API call in progress?
  const [loading, setLoading] = useState(false);

  // any error message to show the user?
  const [error, setError] = useState(null);

//addding suggestions for city autocomplete
const [startSuggestions, setStartSuggestions] = useState([])
const [destSuggestions, setDestSuggestions] = useState([])

//vehicle dropdowns 
const [makes, setMakes] = useState([])
const [models, setModels] = useState([])

// all form field values stored in one state object
  const [formData, setFormData] = useState({
    start: '',
    destination: '',
    state: '',
    make: '',
    model: '',
    year: '',
    gas_type: 'regular',
    traffic: 'mixed'
  });




useEffect(() =>
{
//don't call API if less than 3 characters

if(formData.start.length <3)
{
    setStartSuggestions([]);
    return;
}
// timer for the user
//if the user stops typing , wait for 300ms and give suggestions
//to prevent calling API on every single keystroke
const timer = setTimeout(async()=>
{
  try
  {
    const res = await fetch (
      `http://localhost:8080/api/autocomplete?q=${formData.start}`
    );
    
    const data = await res.json();
    setStartSuggestions(data);
  }
  catch
  {

    setStartSuggestions([]);

  }

}, 300);

//cleaning up the function-> cancel the timer if user keeps typing
// this is called debouncing work
  return() => clearTimeout(timer);


},  [formData.start]); //this will run every time start field changes

//this is for destination autocomplete effect
useEffect(() =>
{
//don't call API if less than 3 characters

if(formData.destination.length <3)
{
    setDestSuggestions([]);
    return;
}
// timer for the user
//if the user stops typing , wait for 300ms and give suggestions
//to prevent calling API on every single keystroke
const timer = setTimeout(async()=>
{
  try
  {
    const res = await fetch (
      `http://localhost:8080/api/autocomplete?q=${formData.destination}`
    );
    
    const data = await res.json();
    setDestSuggestions(data);
  }
  catch
  {

    setDestSuggestions([]);

  }

}, 300);

//cleaning up the function-> cancel the timer if user keeps typing
// this is called debouncing work
  return() => clearTimeout(timer);


},  [formData.destination]); //this will run every time start field changes

//useEffect for make, year changes, year is dependent on models
useEffect (() => 
{

  //fetch only if the year is only 4 digits
  if (formData.year.length !== 4)
  {
    setMakes([]);
    // this is to reset to previous state because the year depends on the model
    setFormData (prev => ({... prev, make: '', model:''}));
    return;
  }

  const fetchMakes = async () => 
  {

    try{

      const res = await fetch (
        `http://localhost:8080/api/vehicles/makes?year=${formData.year}`
      );

      const data = await res.json();

      setMakes(data);

    }catch 
    {

      setMakes([]);

    }

  };
  fetchMakes();
}
, [formData.year]);

// useEffect for models when make changes
useEffect (() => 
{
 // both year and make have to work in order for models to work

 if(!formData.year || !formData.make)
{
  setModels([]);
  return;
}
const fetchModels = async () =>
{

try {

const res = await fetch (

   `http://localhost:8080/api/vehicles/models?year=${formData.year}&make=${formData.make}`);
  


const data = await res.json();

setModels(data);

}
catch{

setModels([]);
}

};

fetchModels();

}, [formData.make, formData.year]); //will run if make OR year changes, this is also a dependency array



  //handlers
  // one function handles ALL input changes
  // e.target.name tells us which field changed
  // e.target.value tells us what the user typed
  const handleChange = (e) => {
    setFormData({
      ...formData,                    // keep all existing values
      [e.target.name]: e.target.value // update only the changed field
    });
  };

  // called when user clicks Calculate
  const handleSubmit = async (e) => {
    e.preventDefault();    // stop page refresh
    setLoading(true);      // show Calculating... on button
    setError(null);        // clear any previous error

    try {
      // call Flask API
      const response = await fetch('http://localhost:8080/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year) // convert year string to number
        })
      });

      // read the JSON response
      const data = await response.json();

      if (!response.ok) {
        // 400 or 500 - show error to user
        setError(data.error);
      } else {
        // 200 - pass result up to App.js
        onResult(data);
      }

    } catch (err) {
      // network error - Flask probably not running
      setError('Could not connect to server. Is Flask running?');
    } finally {
      // always stop loading whether success or error
      setLoading(false);
    }
  };

  // ── STYLES ───────────────────────────────────────────
  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50";

  // ── JSX ──────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8">

      {/* ROUTE SECTION */}
      <h2 className="font-bold text-gray-700 text-lg mb-4">📍 Route</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* start with autocomplete */}
        <div className="relative">
          <label className="text-xs font-medium text-gray-500 mb-1 block">From</label>
          <input
            name="start"
            value={formData.start}
            onChange={handleChange}
            placeholder="Houston, TX"
            className={inputClass}
            required
            autoComplete="off"
          />
          {startSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1">
              {startSuggestions.map((s, i) => (
                <div
                  key={i}
                  className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                  onClick={() => {
                    setFormData({ ...formData, start: s });
                    setStartSuggestions([]);
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* destination with autocomplete */}
        <div className="relative">
          <label className="text-xs font-medium text-gray-500 mb-1 block">To</label>
          <input
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Austin, TX"
            className={inputClass}
            required
            autoComplete="off"
          />
          {destSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1">
              {destSuggestions.map((s, i) => (
                <div
                  key={i}
                  className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                  onClick={() => {
                    setFormData({ ...formData, destination: s });
                    setDestSuggestions([]);
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* STATE */}
      <div className="mb-6">
        <label className="text-xs font-medium text-gray-500 mb-1 block">State (for gas price)</label>
        <select name="state" value={formData.state} onChange={handleChange} className={inputClass} required>
          <option value="">Select your state</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* CAR SECTION */}
      <h2 className="font-bold text-gray-700 text-lg mb-4">🚘 Your Car</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">

        {/* year first */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Year</label>
          <input
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="2020"
            className={inputClass}
            required
          />
        </div>

        {/* make - dropdown when loaded, text input otherwise */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Make</label>
          {makes.length > 0 ? (
            <select name="make" value={formData.make} onChange={handleChange} className={inputClass} required>
              <option value="">Select make</option>
              {makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          ) : (
            <input name="make" value={formData.make} onChange={handleChange} placeholder="Toyota" className={inputClass} required />
          )}
        </div>

        {/* model - dropdown when loaded, text input otherwise */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Model</label>
          {models.length > 0 ? (
            <select name="model" value={formData.model} onChange={handleChange} className={inputClass} required>
              <option value="">Select model</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          ) : (
            <input name="model" value={formData.model} onChange={handleChange} placeholder="Camry" className={inputClass} required />
          )}
        </div>

      </div>

      {/* GAS TYPE AND TRAFFIC */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Gas Type</label>
          <select name="gas_type" value={formData.gas_type} onChange={handleChange} className={inputClass}>
            {GAS_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Traffic</label>
          <select name="traffic" value={formData.traffic} onChange={handleChange} className={inputClass}>
            {TRAFFIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 text-lg"
      >
        {loading ? '⏳ Calculating...' : '⚡ Calculate Trip Cost'}
      </button>

    </form>
  );
}

export default TripForm;