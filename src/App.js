import { useEffect, useState } from "react";
import Form from "./components/form.js";
import Info from "./components/info.js";
import "./components/style.css";

function App() {
  const [info, setInfo] = useState(null);
  const [state, setState] = useState(false);

  useEffect(() => {
    console.log(info);
  }, [info]);

  return (
    <div>
      <Form setInfo={setInfo} setState={setState} />
      {info != null && <Info info={info} state={state} />}
    </div>
  );
}

export default App;

/* import axios from 'axios'; 
import './App.css';
import { useEffect, useState } from 'react';
import City from './components/city';



function App() {
  const key ="aeb6cab69d44bac1f55124b25acb4e10";

  const [search, setSearch] = useState(""); 
  const [city, setCity] = useState(); 
 



  

 useEffect(() => {
 
  async function getApi() {
    try {
      const response = await axios.get( 
        `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${key}&units=metric`
        );
      console.log(response);
      setCity(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  getApi();

  
 }, [search]);  // arayn in ici bos ise uygulama ilk calistig zaman render olcak dolu ise dolu olan render olur

 console.log(search)
 
  return (
  <div className="App">
    <div>
    <input
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Hava durumunu istediginiz Sehri giriniz"
          className=" my-5 px-3 w-[270px] py-3 placeholder-blueGray-300 text-blueGray-600   bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring "
        />

     { city && < City city={city}/>}

    </div>
    </div>
    );
  
}

export default App;
 */
