import axios from 'axios';
import './App.css';
import { useEffect, useState } from 'react';



function App() {
  const key ="aeb6cab69d44bac1f55124b25acb4e10";

  const [city, setCity] = useState();



  

 useEffect(() => {
 
  async function getApi() {
    try {
      const response = await axios.get( 
        `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${key}&units=metric`
        );
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  getApi();
  
 }, []);  // arayn in ici bos ise uygulama ilk calistig zaman render olcak
 
  return (
  <div className="App">
    <div>
      <input onChange={(e) => console.log(e.target.value)} className='border-8 bg-slate-500' type='text'/> 
    </div>
    </div>
    );
  
}

export default App;
