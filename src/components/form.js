import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Form = () => {

     const [city, setCity] = useState("")
     useEffect(() => console.log (city), [city])

     const handleChange=()=>{
          const key ="aeb6cab69d44bac1f55124b25acb4e10";
          const baseURL=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric&lang=tr`
          
          axios(baseURL).then(data => console.log(data));

     }
     

  return (
    <div>

     <h1> Hava Durumu</h1>

     <form onSubmit={(e) =>{ e.preventDefault(); handleChange()}}>
          <div className='form'>
               <input onChange={(e)=> setCity(e.target.value)} className='inputText' type='text' placeholder='Sehri Giriniz'></input>
          </div>

          <div className='btnDiv'>
               <button type='submit' className='btn' > Verileri Getir </button>
          </div>
     </form>


    </div>
  )
}

export default Form