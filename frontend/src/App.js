//usestate is to store result data, from 'react' is just telling javascript where to find it, the react package
import React, {useState} from 'react';
import TripForm from './components/TripForm';
import ResultCard from './components/ResultCard';

//writing the app function
//defining the main component, every component is a function, its name has to start with a capital letter
function App()
{
  //creating the result state
  //result stores our trip calculation result, right now is null cause we have nth to show yet
  //setResult is the function u call to update result
  // useState(null) is just initializing the result 
  const[result, setResult] = useState(null);

  //return statement
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
       <div className="max-w-2xl mx-auto"></div>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Worth the Drive?
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Calculate your real road trip fuel cost
        </p>
        {/* Adding the trip form, renders my tripfrom component, passing the setResult function down to TripForm as a prop
          When the tripform gets a result from the API calls onResult(data)which calls setResult(data) which updates the result state here in App
        */}
        <TripForm onResult={setResult}/>
        {/* && only show ResultCard if result is not null */}
        {result && <ResultCard result = {result}/>}
        </div>
  );

}

//makes app available to be imported by other files. index.js imports App and mounts it to the page.
export default App;