import React from 'react'
import {WiSunset } from 'react-icons/wi';


const Info = ({info,state}) => {
  return (

     <div>
             { 
             state ? 

      <div className='info'>
          <p id='sehir'>{info.name} , {info.sys.country}</p>
          <div className='genelDeger'>
               <p id='sicaklik'> {info.main.temp} °C </p>  < WiSunset className='fa-c'/>
          </div>

          <p id='havaDurumu'> {info.weather[0].description}</p>
          <div id='his'>
                    <p id='hissedilen'> Hissedilen:  {info.main.feels_like}  °C </p> < WiSunset className='fa-c'/>
            </div>
          </div>  : null
      }
     </div>



  )
}

export default Info