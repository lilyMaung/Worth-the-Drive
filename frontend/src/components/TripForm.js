import React, { useState , useEffect} from 'react';
import Select from 'react-select';



//useEffect lets my code run when sth changes
// valid options - must match Flask backend exactly
const GAS_TYPES     = ["regular", "midgrade", "premium", "e85", "diesel"];
const TRAFFIC_TYPES = ["city", "mixed", "highway"];
const STATES= [
  "AL","AK","AZ","AR","CA","CO","CT","FL","GA","HI",
  "ID","IL","IN","IA","KS","KY","LA","ME","MD","MA",
  "MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM",
  "NY","NC","ND","OH","OK","OR","PA","RI","SC","SD",
  "TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
];

// FIX 1: added STATE_NAMES dictionary so each state code maps to its full name
// STATES is an array so STATES[s] doesn't work - we need a dictionary lookup
const STATE_NAMES = {
  "AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas",
  "CA":"California","CO":"Colorado","CT":"Connecticut","FL":"Florida",
  "GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois",
  "IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky",
  "LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts",
  "MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri",
  "MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire",
  "NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina",
  "ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon",
  "PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota",
  "TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont",
  "VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin",
  "WY":"Wyoming","DC":"Washington DC"
};

// FIX 2: renamed to STATE_OPTIONS (not STATES_OPTIONS) and uses STATE_NAMES[s] 
// for the option lists for your STATES array
const STATE_OPTIONS = STATES.map(s => ({
    value: s,
    label: `${STATE_NAMES[s]} (${s})`   // FIX: was STATES[s] which is undefined
}));

// FIX 3: Geoapify key from environment variable instead of hardcoded
// REACT_APP_ prefix is required for React to read env variables
const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_KEY;

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

  //this function will stop the slow suggestions dropdowns whenever the users clicks anything
  useEffect(() => {

    //definding a function and everytime the user clicks anywhere this function runs
    const handleClickOutside = () => {

      setStartSuggestions ([]); //nothing to show on the dropdown
      setDestSuggestions([]);

    };

    // addEventListener attach behavior to DOM events
    document.addEventListener('click', handleClickOutside); //this is the entire webpage , if the user clicks, it will call this function everytime

    // clean up when done
    return () => document.removeEventListener('click', handleClickOutside); //cleanup function to prevent a memory leak

  }, []); //the empty array at the end means to run once and never again

  //this function will call the geonify api directly instead of using flask as a midman to call geonify api, so the wait time can be faster 
  // query is the user's input, setSuggestions is a function so u don't need to repeat the code 
  //async is needed when we need time to call API, if there is async there is also await
  // FIX 4: moved fetchSuggestions INSIDE the function so it can access state
  // also fixed to use GEOAPIFY_KEY variable and state_code (not STATES_OPTIONS)
  const fetchSuggestions = async (query, setSuggestions) => 
  {
    if (query.length < 3)
    {
      setSuggestions([]); return; 
    }

    try 
    {
      const res = await fetch (
        // making HTTP requests, same thing that Postman does but javascript built in function 
        // FIX: use GEOAPIFY_KEY env variable instead of hardcoded key
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&type=city&limit=5&apiKey=${GEOAPIFY_API_KEY}`
      );

      //await pauses execution until the response comes bak
      //extracting the JSON body
      const data = await res.json();

      // data.features is the array of location results from geonify, each one is GeoJSON feature object
      //.map () is one of the most important javascript methods, it could transform every item in an array
      // this function is turning features into strings such as "Houston, TX"
      const suggestions = data.features.map ( f => {
        
        const city = f.properties.city || f.properties.name || '';
        // FIX 5: was f.properties.STATES_OPTIONS which doesn't exist in Geoapify response
        // state_code is the correct field (returns "TX", "CA" etc)
        const state = f.properties.state_code || f.properties.state || '';
        
        //after validating the city and the state then return them
        if( city && state)
        {
          return `${city}, ${state}`;
        }
        else {
          return f.properties.formatted;
        }

      // .filter only keeps items that match condition
      //validating the items that might be empty strings or null after .map() function
      //removing falsy values
      }).filter(Boolean); //Boolean is a function that returns true for truthy values and false for falsy values. Passing it to .filter() keeps only truthy items.

      setSuggestions (suggestions); //updating with the new suggestions array
    
    } catch {
      setSuggestions([]);
    }
  };

  // the effect for the setTimer - start field
  useEffect (() => {

    if (formData.start.length < 3)
    {
      setStartSuggestions([]);
      return;
    }
    //setTimeout waits 250 ms before calling the function 
    const timer = setTimeout (() => {
      // FIX 6: calls fetchSuggestions directly instead of duplicating the fetch code
      fetchSuggestions(formData.start, setStartSuggestions);
    }, 250);
    //clearTimeout cancels a pending timeout
    //this process is debouncing, waiting until user stops doing something
    return () => clearTimeout(timer);
    //this is dependency array and react watches this every time it changes it automatically start again
  }, [formData.start]);

  // FIX 7: destination useEffect now calls fetchSuggestions (Geoapify directly)
  // was calling Flask backend which added an extra round trip - now much faster
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
    const timer = setTimeout(() =>
    {
      // FIX: was calling Flask backend - now calls Geoapify directly via fetchSuggestions
      fetchSuggestions(formData.destination, setDestSuggestions);
    }, 250);

    //cleaning up the function-> cancel the timer if user keeps typing
    // this is called debouncing work
    return () => clearTimeout(timer);

  },  [formData.destination]); //this will run every time start field changes

  //useEffect for make, year changes, year is dependent on models
  useEffect (() => 
  {
    //fetch only if the year is only 4 digits
    if (formData.year.length !== 4)
    {
      setMakes([]);
      // this is to reset to previous state because the year depends on the model
      setFormData(prev => ({ ...prev, make: '', model:''}));
      return;
    }

    const fetchMakes = async () => 
    {
      try{
        const res = await fetch (
          ` https://worth-the-drive-lno9.onrender.com/api/vehicles/makes?year=${formData.year}`
        );
        const data = await res.json();
        setMakes(data);
      }catch 
      {
        setMakes([]);
      }
    };
    fetchMakes();
  }, [formData.year]);

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
          ` https://worth-the-drive-lno9.onrender.com/api/vehicles/models?year=${formData.year}&make=${formData.make}`
        );
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
    setFormData({ ...formData,
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
      const response = await fetch(' https://worth-the-drive-lno9.onrender.com/api/calculate', {
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

  // FIX 8: extracted react-select styles into a variable to keep JSX clean
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      background: 'var(--bg-input)',
      border: state.isFocused
        ? '1px solid var(--border-focus)'
        : '1px solid var(--border)',
      borderRadius: 12,
      padding: '4px',
      boxShadow: state.isFocused
        ? '0 0 0 3px rgba(99,102,241,0.1)'
        : 'none',
      cursor: 'text',
      '&:hover': { borderColor: 'var(--border-focus)' },
    }),
    menu: (base) => ({
      ...base,
      background: '#1e1e2a',
      border: '1px solid var(--border)',
      borderRadius: 12,
      zIndex: 50,
    }),
    menuList: (base) => ({
      ...base,
      padding: 4,
      maxHeight: 220,
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? 'rgba(99,102,241,0.1)' : 'transparent',
      color: 'var(--text-primary)',
      fontSize: 13,
      borderRadius: 8,
      cursor: 'pointer',
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--text-primary)',
    }),
    input: (base) => ({
      ...base,
      color: 'var(--text-primary)',
      opacity: 1,  // FIX: was invisible in dark theme without this
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--text-muted)',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
      ...base,
      color: 'var(--text-muted)',
    }),
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
          }}>📍</span>
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
              // FIX 9: added stopPropagation on the container so clicking inside
              // doesn't trigger the handleClickOutside and close suggestions too early
              <div
                style={suggestionBox}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {startSuggestions.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      ...suggestionItem,
                      borderBottom: i === startSuggestions.length - 1 ? 'none' : '1px solid var(--border)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    // FIX 10: use onMouseDown with e.preventDefault() instead of onClick
                    // mousedown fires BEFORE blur so suggestions don't disappear before selection
                    // e.preventDefault() stops the input from losing focus
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFormData({ ...formData, start: s });
                      setStartSuggestions([]);
                    }}
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
              // FIX 11: same stopPropagation fix as start dropdown
              <div
                style={suggestionBox}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {destSuggestions.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      ...suggestionItem,
                      borderBottom: i === destSuggestions.length - 1 ? 'none' : '1px solid var(--border)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    // FIX 12: removed duplicate handlers and typo (onMounseDown)
                    // FIX 13: was clearing setStartSuggestions - fixed to setDestSuggestions
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFormData({ ...formData, destination: s });
                      setDestSuggestions([]);  // FIX: was setStartSuggestions - wrong!
                    }}
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
          {/* FIX 14: use STATE_OPTIONS (fixed) and selectStyles variable */}
          {/* isSearchable={true} explicitly enables typing to filter */}
          <Select
            options={STATE_OPTIONS}
            onChange={(selected) => setFormData({
              ...formData,
              state: selected ? selected.value : ''
            })}
            placeholder="Search your state..."
            isSearchable={true}
            styles={selectStyles}
          />
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