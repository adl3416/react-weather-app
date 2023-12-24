import axios from 'axios';
import './App.css';
import { useEffect, useState } from 'react';
import City from './city';



function App() {
  const key ="aeb6cab69d44bac1f55124b25acb4e10";

  const [city, setCity] = useState(); 
  const [search, setSearch] = useState(""); 



  

 useEffect(() => {
 
  async function getApi() {
    try {
      const response = await axios.get( 
        `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${key}&units=metric`
        );
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  getApi();

  
 }, [search]);  // arayn in ici bos ise uygulama ilk calistig zaman render olcak

 console.log(search)
 
  return (
  <div className="App">
    <div>
      <input 
      onChange={(e) => setSearch(e.target.value)} 
      type="text"
      placeholder='Placeholder'
      className='border-8 bg-slate-500' /> 
      <City city={city}/>
    </div>
    </div>
    );
  
}

export default App;
