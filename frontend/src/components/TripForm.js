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
      
      `https://worth-the-drive-lily.onrender.com/api/autocomplete?q=${formData.start}`
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
      `https://worth-the-drive-lily.onrender.com/api/autocomplete?q=${formData.destination}`
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
    setFormData(prev => ({...prev, make: '', model:''}));
    return;
  }

  const fetchMakes = async () => 
  {

    try{

      const res = await fetch (
        `https://worth-the-drive-lily.onrender.com/api/vehicles/makes?year=${formData.year}`
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

   `https://worth-the-drive-lily.onrender.com/api/vehicles/models?year=${formData.year}&make=${formData.make}`);
  


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
      const response = await fetch('https://worth-the-drive-lily.onrender.com/api/calculate', {
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

  // ── Shared styles ────────────────────────────────────
  const card = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '24px',
    marginBottom: 12,
  };
 
  const inputStyle = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 14,
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: 'var(--font-body)',
  };
 
  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 8,
  };
 
  const sectionTitle = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };
 
  const suggestionBox = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 30,
    background: '#1e1e2a',
    border: '1px solid var(--border)',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
  };
 
  const suggestionItem = {
    padding: '11px 16px',
    fontSize: 13,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'background 0.1s, color 0.1s',
  };
 
  // ── JSX ──────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit}>
 
      {/* ── ROUTE SECTION ── */}
      <div style={card} className="fade-up fade-up-delay-1">
        <p style={sectionTitle}>
          <span style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 8, padding: '3px 8px',
            color: 'var(--accent-light)', fontSize: 16,
          }}></span>
          Choose Your Route
        </p>
 
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
 
          {/* Start with autocomplete */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>From</label>
            <input
              name="start"
              value={formData.start}
              onChange={handleChange}
              placeholder="City, State"
              style={inputStyle}
              required
              autoComplete="off"
              onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
            {startSuggestions.length > 0 && (
              <div style={suggestionBox}>
                {startSuggestions.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      ...suggestionItem,
                      borderBottom: i === startSuggestions.length - 1 ? 'none' : '1px solid var(--border)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    onClick={() => { setFormData({ ...formData, start: s }); setStartSuggestions([]); }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>📍</span>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
 
          {/* Destination with autocomplete */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>To</label>
            <input
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="City, State"
              style={inputStyle}
              required
              autoComplete="off"
              onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
            {destSuggestions.length > 0 && (
              <div style={suggestionBox}>
                {destSuggestions.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      ...suggestionItem,
                      borderBottom: i === destSuggestions.length - 1 ? 'none' : '1px solid var(--border)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    onClick={() => { setFormData({ ...formData, destination: s }); setDestSuggestions([]); }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>📍</span>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
 
        </div>
 
        {/* State */}
        <div>
          <label style={labelStyle}>State (for gas price)</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            style={inputStyle}
            required
            onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
            onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          >
            <option value="">Select your state</option>
            {STATES.map(s => (
              <option key={s} value={s}>{STATES[s]} ({s})</option>
            ))}
          </select>
        </div>
      </div>
 
      {/* ── CAR SECTION ── */}
      <div style={card} className="fade-up fade-up-delay-2">
        <p style={sectionTitle}>
          <span style={{
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 8, padding: '3px 8px',
            color: '#fbbf24', fontSize: 15,
          }}>🚘</span>
          Your Car
        </p>
 
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
 
          {/* Year first */}
          <div>
            <label style={labelStyle}>Year</label>
            <input
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="2020"
              maxLength={4}
              style={inputStyle}
              required
              onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
 
          {/* Make - dropdown when loaded */}
          <div>
            <label style={labelStyle}>
              Make
              {formData.year.length === 4 && makes.length === 0 && (
                <span style={{ color: 'var(--accent-light)', marginLeft: 6, fontWeight: 400 }}>loading…</span>
              )}
            </label>
            {makes.length > 0 ? (
              <select
                name="make"
                value={formData.make}
                onChange={handleChange}
                style={inputStyle}
                required
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">Select make</option>
                {makes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder={formData.year.length === 4 ? '...' : 'Enter year first'}
                style={{ ...inputStyle, opacity: formData.year.length !== 4 ? 0.5 : 1 }}
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            )}
          </div>
 
          {/* Model - dropdown when loaded */}
          <div>
            <label style={labelStyle}>
              Model
              {formData.make && models.length === 0 && (
                <span style={{ color: 'var(--accent-light)', marginLeft: 6, fontWeight: 400 }}>loading…</span>
              )}
            </label>
            {models.length > 0 ? (
              <select
                name="model"
                value={formData.model}
                onChange={handleChange}
                style={inputStyle}
                required
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">Select model</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder={formData.make ? '...' : 'Select make first'}
                style={{ ...inputStyle, opacity: !formData.make ? 0.5 : 1 }}
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            )}
          </div>
 
        </div>
 
        {/* Gas type and traffic */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Fuel Type</label>
            <select
              name="gas_type"
              value={formData.gas_type}
              onChange={handleChange}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            >
              {GAS_TYPES.map(g => (
                <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Expected Traffic</label>
            <select
              name="traffic"
              value={formData.traffic}
              onChange={handleChange}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            >
              {TRAFFIC_TYPES.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
 
      {/* ── ERROR ── */}
      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }} className="fade-up">
          <span style={{ fontSize: 16, marginTop: 1 }}>⚠️</span>
          <div>
            <p style={{ color: 'var(--error)', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
              Something went wrong
            </p>
            <p style={{ color: 'rgba(248,113,113,0.7)', fontSize: 13 }}>{error}</p>
          </div>
        </div>
      )}
 
      {/* ── SUBMIT BUTTON ── */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          background: loading
            ? 'rgba(99,102,241,0.5)'
            : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          border: 'none',
          borderRadius: 16,
          padding: '16px 24px',
          fontSize: 15,
          fontWeight: 600,
          color: 'white',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'all 0.2s',
          boxShadow: loading ? 'none' : '0 8px 32px rgba(99,102,241,0.3)',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.4)'; }}}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 32px rgba(99,102,241,0.3)'; }}
        onMouseDown={e  => { if (!loading) e.currentTarget.style.transform = 'translateY(0) scale(0.99)'; }}
        onMouseUp={e    => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Calculating your trip...
          </>
        ) : (
          <>
            Calculate Trip Cost
            <span style={{ fontSize: 16 }}>→</span>
          </>
        )}
      </button>
 
    </form>
  );
}
 export default TripForm;