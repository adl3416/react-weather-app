import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [city, setCity] = useState('');  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);  const [weatherAlerts, setWeatherAlerts] = useState([]);  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState('');

  // Sayfa yüklendiğinde otomatik konum al
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(false);  const [currentAudio, setCurrentAudio] = useState(null);

  // Gerçek zamanlı saat güncellemesi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Saatlik tahmin oluşturma fonksiyonu
  const generateHourlyForecast = (baseWeather) => {
    if (!baseWeather) return [];
    
    const hourlyData = [];
    const currentHour = new Date().getHours();
    
    for (let i = 1; i <= 24; i++) {
      const futureHour = (currentHour + i) % 24;
      const tempVariation = (Math.random() - 0.5) * 8; // ±4°C varyasyon
      const precipitationChance = Math.floor(Math.random() * 100);
      const windVariation = (Math.random() - 0.5) * 20; // ±10 km/h varyasyon
      const humidityVariation = (Math.random() - 0.5) * 20; // ±10% varyasyon
      
      // Gece/gündüz durumuna göre sıcaklık ayarlaması
      let tempAdjustment = 0;
      if (futureHour >= 2 && futureHour <= 6) tempAdjustment = -3; // En soğuk saatler
      if (futureHour >= 12 && futureHour <= 16) tempAdjustment = 3; // En sıcak saatler
      
      hourlyData.push({
        label: `${futureHour.toString().padStart(2, '0')}:00`,
        temp: Math.round(baseWeather.temp + tempVariation + tempAdjustment),
        description: baseWeather.description,
        icon: baseWeather.icon,
        precipitation: Math.min(100, Math.max(0, precipitationChance)),
        windSpeed: Math.round(Math.max(0, baseWeather.windSpeed + windVariation)),
        humidity: Math.round(Math.min(100, Math.max(0, baseWeather.humidity + humidityVariation)))
      });
    }
    
    return hourlyData;
  };

  const searchCity = () => {
    if (!city.trim()) return;
    
    setLoading(true);    // Simüle edilmiş API çağrısı
    setTimeout(() => {
      const aqiValue = Math.floor(Math.random() * 100) + 1;
      const uvValue = Math.floor(Math.random() * 11) + 1;
      const tempValue = Math.floor(Math.random() * 25) + 10;
      const windValue = Math.floor(Math.random() * 60) + 5; // 5-65 km/h arası
      const humidityValue = Math.floor(Math.random() * 60) + 30; // 30-90 arası
      const visibilityValue = Math.floor(Math.random() * 15) + 2; // 2-17 km arası
      
      const newWeather = {
        name: city,
        temp: tempValue,
        description: ['Güneşli', 'Bulutlu', 'Yağmurlu', 'Az Bulutlu'][Math.floor(Math.random() * 4)],
        humidity: humidityValue,
        pressure: Math.floor(Math.random() * 50) + 1000,
        windSpeed: windValue,
        feelsLike: tempValue + Math.floor(Math.random() * 6) - 3,
        icon: ['sunny', 'cloudy', 'rainy', 'partly-cloudy'][Math.floor(Math.random() * 4)],
        // Yeni sağlık verileri
        aqi: aqiValue,
        aqiLevel: getAQILevel(aqiValue),
        uvIndex: uvValue,
        uvLevel: getUVLevel(uvValue),
        visibility: visibilityValue,
        dewPoint: Math.floor(Math.random() * 20) + 5
      };
      
      setCurrentWeather(newWeather);
      
      // Saatlik tahmini güncelle
      const newHourlyForecast = generateHourlyForecast(newWeather);
      setHourlyForecast(newHourlyForecast);
      
      // Uyarıları güncelle
      const alerts = generateWeatherAlerts(newWeather);
      setWeatherAlerts(alerts);
      
      setLoading(false);
      setCity('');
    }, 1000);
  };const getWeatherIcon = (iconType) => {
    const icons = {
      'sunny': '☀️',
      'cloudy': '☁️', 
      'rainy': '🌧️',
      'snowy': '❄️',
      'partly-cloudy': '⛅'
    };
    return icons[iconType] || '🌤️';
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return 'İyi';
    if (aqi <= 100) return 'Orta';
    if (aqi <= 150) return 'Hassas';
    if (aqi <= 200) return 'Sağlıksız';
    if (aqi <= 300) return 'Çok Sağlıksız';
    return 'Tehlikeli';
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-800';
  };

  const getUVLevel = (uv) => {
    if (uv <= 2) return 'Düşük';
    if (uv <= 5) return 'Orta';
    if (uv <= 7) return 'Yüksek';
    if (uv <= 10) return 'Çok Yüksek';
    return 'Ekstrem';
  };
  const getUVColor = (uv) => {
    if (uv <= 2) return 'bg-green-500';
    if (uv <= 5) return 'bg-yellow-500';
    if (uv <= 7) return 'bg-orange-500';
    if (uv <= 10) return 'bg-red-500';
    return 'bg-purple-500';
  };

  // Meteorolojik uyarı oluşturma fonksiyonu
  const generateWeatherAlerts = (weather) => {
    const alerts = [];
    
    // Sıcaklık uyarıları
    if (weather.temp >= 35) {
      alerts.push({
        id: 'extreme_heat',
        type: 'warning',
        level: 'high',
        title: 'Aşırı Sıcaklık Uyarısı',
        message: 'Sıcaklık 35°C üzerinde. Güneş çarpması riski yüksek.',
        icon: '🔥',
        color: 'bg-red-500',
        recommendations: ['Bol su için', 'Güneş çarpmasından korunmak için şapka takın', 'Açık renkli kıyafet giyin']
      });
    } else if (weather.temp <= 0) {
      alerts.push({
        id: 'extreme_cold',
        type: 'warning',
        level: 'medium',
        title: 'Donma Uyarısı',
        message: 'Sıcaklık donma noktasında. Buz oluşumu beklenir.',
        icon: '🧊',
        color: 'bg-blue-500',
        recommendations: ['Sıcak giyinin', 'Araç lastiklerinizi kontrol edin', 'Boru donmasına dikkat']
      });
    }

    // Rüzgar uyarıları
    if (weather.windSpeed >= 50) {
      alerts.push({
        id: 'strong_wind',
        type: 'warning',
        level: 'high',
        title: 'Şiddetli Rüzgar Uyarısı',
        message: `Rüzgar hızı ${weather.windSpeed} km/h. Fırtına riski var.`,
        icon: '💨',
        color: 'bg-orange-500',
        recommendations: ['Dış aktiviteleri erteleyin', 'Loose nesneleri sabitleyin', 'Ağaç altında durmayın']
      });
    }

    // Nem uyarıları
    if (weather.humidity >= 90) {
      alerts.push({
        id: 'high_humidity',
        type: 'info',
        level: 'low',
        title: 'Yüksek Nem Uyarısı',
        message: 'Nem oranı %90 üzerinde. Bunaltıcı hava beklenir.',
        icon: '💧',
        color: 'bg-blue-400',
        recommendations: ['Bol su için', 'Klimayı kullanın', 'Hafif aktiviteler yapın']
      });
    }

    // UV uyarıları
    if (weather.uvIndex >= 8) {
      alerts.push({
        id: 'high_uv',
        type: 'warning',
        level: 'medium',
        title: 'Yüksek UV Uyarısı',
        message: 'UV indeksi çok yüksek. Güneş yanığı riski var.',
        icon: '☀️',
        color: 'bg-yellow-500',
        recommendations: ['SPF 50+ güneş kremi', 'Şapka ve güneş gözlüğü', '10-16 arası gölgede kalın']
      });
    }

    // Hava kalitesi uyarıları
    if (weather.aqi >= 150) {
      alerts.push({
        id: 'air_quality',
        type: 'warning',
        level: 'high',
        title: 'Hava Kalitesi Uyarısı',
        message: 'Hava kalitesi sağlıksız seviyede. Nefes alma güçlüğü olabilir.',
        icon: '🏭',
        color: 'bg-red-400',
        recommendations: ['Dış aktiviteleri sınırlayın', 'Maske takın', 'Pencereleri kapalı tutun']
      });
    }

    // Görüş mesafesi uyarıları
    if (weather.visibility <= 5) {
      alerts.push({
        id: 'low_visibility',
        type: 'warning',
        level: 'medium',
        title: 'Düşük Görüş Mesafesi',
        message: 'Sis veya toz nedeniyle görüş mesafesi düşük.',
        icon: '🌫️',
        color: 'bg-gray-500',
        recommendations: ['Araç kullanırken dikkatli olun', 'Farları açın', 'Hızınızı düşürün']
      });
    }    return alerts;
  };
  
  // Koordinatlara göre şehir adı alma (geliştirilmiş reverse geocoding simulation)
  const getCityFromCoords = async (lat, lon) => {
    try {
      // OpenWeatherMap Reverse Geocoding API kullan
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=b8f89b64bf5b8f0c1b6ddff5c47e0c4f`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const location = data[0];
          // Şehir, eyalet/bölge ve ülke bilgisini birleştir
          let cityName = location.name;
          if (location.state && location.country !== 'TR') {
            cityName += `, ${location.state}`;
          }
          if (location.country) {
            const countryNames = {
              'TR': 'Türkiye',
              'US': 'ABD',
              'GB': 'İngiltere',
              'DE': 'Almanya',
              'FR': 'Fransa',
              'IT': 'İtalya',
              'ES': 'İspanya',
              'RU': 'Rusya',
              'CN': 'Çin',
              'JP': 'Japonya',
              'IN': 'Hindistan',
              'AU': 'Avustralya'
            };
            const countryName = countryNames[location.country] || location.country;
            if (location.country !== 'TR') {
              cityName += `, ${countryName}`;
            }
          }
          return cityName;
        }
      }    } catch (error) {
      console.error('Reverse geocoding hatası:', error);
    }
    
    // API başarısız olursa daha genel konum belirleme
    // Major dünya şehirleri için koordinat aralıkları
      // Almanya şehirleri (daha doğru koordinatlar)
    if (lat >= 51.2 && lat <= 51.4 && lon >= 7.0 && lon <= 7.1) return 'Velbert, Almanya';
    if (lat >= 51.4 && lat <= 51.6 && lon >= 7.0 && lon <= 7.3) return 'Wuppertal, Almanya';
    if (lat >= 51.5 && lat <= 51.6 && lon >= 7.0 && lon <= 7.2) return 'Essen, Almanya';
    if (lat >= 52.4 && lat <= 52.6 && lon >= 13.3 && lon <= 13.5) return 'Berlin, Almanya';
    if (lat >= 53.5 && lat <= 53.6 && lon >= 9.9 && lon <= 10.1) return 'Hamburg, Almanya';
    if (lat >= 48.1 && lat <= 48.2 && lon >= 11.5 && lon <= 11.6) return 'München, Almanya';
    if (lat >= 50.1 && lat <= 50.2 && lon >= 8.6 && lon <= 8.7) return 'Frankfurt, Almanya';
    if (lat >= 51.0 && lat <= 51.1 && lon >= 6.9 && lon <= 7.0) return 'Düsseldorf, Almanya';
    if (lat >= 50.9 && lat <= 51.0 && lon >= 6.9 && lon <= 7.0) return 'Köln, Almanya';
    if (lat >= 48.7 && lat <= 48.8 && lon >= 9.1 && lon <= 9.2) return 'Stuttgart, Almanya';
    
    // Türkiye şehirleri
    if (lat >= 40.9 && lat <= 41.2 && lon >= 28.8 && lon <= 29.2) return 'İstanbul (Avrupa), Türkiye';
    if (lat >= 40.9 && lat <= 41.2 && lon >= 29.0 && lon <= 29.4) return 'İstanbul (Asya), Türkiye';
    if (lat >= 39.8 && lat <= 40.0 && lon >= 32.7 && lon <= 33.0) return 'Ankara, Türkiye';
    if (lat >= 38.3 && lat <= 38.5 && lon >= 27.0 && lon <= 27.3) return 'İzmir, Türkiye';
    if (lat >= 36.8 && lat <= 37.1 && lon >= 30.6 && lon <= 30.8) return 'Antalya, Türkiye';
    
    // Diğer Avrupa şehirleri
    if (lat >= 51.4 && lat <= 51.6 && lon >= -0.2 && lon <= 0.1) return 'Londra, İngiltere';
    if (lat >= 48.8 && lat <= 48.9 && lon >= 2.3 && lon <= 2.4) return 'Paris, Fransa';
    if (lat >= 52.3 && lat <= 52.4 && lon >= 4.8 && lon <= 4.9) return 'Amsterdam, Hollanda';
    if (lat >= 41.8 && lat <= 41.9 && lon >= 12.4 && lon <= 12.5) return 'Roma, İtalya';
    if (lat >= 40.4 && lat <= 40.5 && lon >= -3.8 && lon <= -3.6) return 'Madrid, İspanya';
    
    // ABD şehirleri
    if (lat >= 40.6 && lat <= 40.9 && lon >= -74.1 && lon <= -73.9) return 'New York, ABD';
    if (lat >= 34.0 && lat <= 34.1 && lon >= -118.3 && lon <= -118.2) return 'Los Angeles, ABD';
    if (lat >= 41.8 && lat <= 41.9 && lon >= -87.7 && lon <= -87.6) return 'Chicago, ABD';
    
    // Asya şehirleri
    if (lat >= 35.6 && lat <= 35.7 && lon >= 139.6 && lon <= 139.8) return 'Tokyo, Japonya';
    if (lat >= 39.9 && lat <= 40.0 && lon >= 116.3 && lon <= 116.5) return 'Pekin, Çin';
    if (lat >= 1.2 && lat <= 1.4 && lon >= 103.7 && lon <= 103.9) return 'Singapur';
    
    // Genel bölge belirlemeleri (son çare)
    if (lat >= 47 && lat <= 55 && lon >= 5 && lon <= 15) return 'Almanya Bölgesi';
    if (lat >= 35 && lat <= 43 && lon >= 25 && lon <= 45) return 'Türkiye Bölgesi';
    if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 50) return 'Avrupa Bölgesi';
    if (lat >= 35 && lat <= 70 && lon >= 25 && lon <= 180) return 'Asya Bölgesi';
    if (lat >= 25 && lat <= 50 && lon >= -130 && lon <= -60) return 'Kuzey Amerika Bölgesi';
    
    // En son çare - koordinat gösterimi
    const latDir = lat >= 0 ? 'K' : 'G';
    const lonDir = lon >= 0 ? 'D' : 'B';
    return `${Math.abs(lat).toFixed(1)}°${latDir} ${Math.abs(lon).toFixed(1)}°${lonDir}`;
  };
  // Otomatik konum alma ve hava durumu getirme
  const getCurrentLocationWeather = useCallback(() => {
    setLocationLoading(true);
    setLocationError('');
      if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum desteği vermiyor');
      setLocationLoading(false);
      
      // Varsayılan hava durumu yükle
      const defaultWeather = {
        name: 'İstanbul (Varsayılan)',
        temp: 25,
        description: 'Az Bulutlu',
        humidity: 65,
        pressure: 1013,
        windSpeed: 12,
        feelsLike: 27,
        icon: 'partly-cloudy',
        aqi: 45,
        aqiLevel: 'İyi',
        uvIndex: 5,
        uvLevel: 'Orta',
        visibility: 10,
        dewPoint: 15,
        coords: { lat: 41.0082, lon: 28.9784 }
      };
      
      setCurrentWeather(defaultWeather);
      
      // Saatlik tahmini güncelle
      const newHourlyForecast = generateHourlyForecast(defaultWeather);
      setHourlyForecast(newHourlyForecast);
      
      // Uyarıları oluştur
      const alerts = generateWeatherAlerts(defaultWeather);
      setWeatherAlerts(alerts);
      
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = await getCityFromCoords(latitude, longitude);
        
        // Gerçek koordinatlara göre hava durumu oluştur
        const locationWeather = {
          name: cityName,
          coords: { lat: latitude, lon: longitude },          temp: Math.floor(Math.random() * 25) + 10,
          description: ['Güneşli', 'Bulutlu', 'Yağmurlu', 'Az Bulutlu'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 40) + 40,
          pressure: Math.floor(Math.random() * 50) + 1000,
          windSpeed: Math.floor(Math.random() * 30) + 5,
          feelsLike: Math.floor(Math.random() * 25) + 12,
          icon: ['sunny', 'cloudy', 'rainy', 'partly-cloudy'][Math.floor(Math.random() * 4)],
          aqi: Math.floor(Math.random() * 100) + 1,
          aqiLevel: '',
          uvIndex: Math.floor(Math.random() * 11) + 1,
          uvLevel: '',
          visibility: Math.floor(Math.random() * 15) + 5,
          dewPoint: Math.floor(Math.random() * 20) + 5
        };
        
        // Seviye hesaplamaları
        locationWeather.aqiLevel = getAQILevel(locationWeather.aqi);
        locationWeather.uvLevel = getUVLevel(locationWeather.uvIndex);
          setCurrentWeather(locationWeather);
        
        // Saatlik tahmini güncelle
        const newHourlyForecast = generateHourlyForecast(locationWeather);
        setHourlyForecast(newHourlyForecast);
        
        // Uyarıları oluştur
        const alerts = generateWeatherAlerts(locationWeather);
        setWeatherAlerts(alerts);
        
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Konum izni reddedildi';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Konum bilgisi mevcut değil';
            break;
          case error.TIMEOUT:
            errorMessage = 'Konum alma zaman aşımı';
            break;
          default:
            errorMessage = 'Konum alınamadı';
            break;
        }        setLocationError(errorMessage);
        setLocationLoading(false);
        
        // Varsayılan hava durumu yükle
        const defaultWeather = {
          name: 'İstanbul (Varsayılan)',
          temp: 25,
          description: 'Az Bulutlu',
          humidity: 65,
          pressure: 1013,
          windSpeed: 12,
          feelsLike: 27,
          icon: 'partly-cloudy',
          aqi: 45,
          aqiLevel: 'İyi',
          uvIndex: 5,
          uvLevel: 'Orta',
          visibility: 10,
          dewPoint: 15,
          coords: { lat: 41.0082, lon: 28.9784 }
        };
        
        setCurrentWeather(defaultWeather);
        
        // Saatlik tahmini güncelle
        const newHourlyForecast = generateHourlyForecast(defaultWeather);
        setHourlyForecast(newHourlyForecast);
        
        // Uyarıları oluştur
        const alerts = generateWeatherAlerts(defaultWeather);
        setWeatherAlerts(alerts);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 dakika cache
      }
    );
  }, []);  // Uygulama başlangıcında çalıştır
  useEffect(() => {
    getCurrentLocationWeather();
    // 10 günlük demo tahmin
    const demoForecast = [];
    for (let i = 0; i < 10; i++) {
      demoForecast.push({
        day: getDateForForecast(i),
        temp: Math.floor(Math.random() * 15) + 15,
        icon: ['sunny', 'cloudy', 'rainy', 'snowy', 'partly-cloudy'][Math.floor(Math.random() * 5)],
        description: ['Güneşli', 'Bulutlu', 'Yağmurlu', 'Karlı', 'Az Bulutlu'][Math.floor(Math.random() * 5)]
      });
    }
    setForecast(demoForecast);
  }, [getCurrentLocationWeather]);

  // Dinamik arkaplan ve atmosfer efektleri
  const getDynamicBackground = (weather) => {
    if (!weather) return 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500';
    
    const currentHour = new Date().getHours();
    const isNight = currentHour < 6 || currentHour > 19;
    const isEvening = currentHour >= 17 && currentHour <= 19;
    const isMorning = currentHour >= 6 && currentHour <= 9;
    
    // Hava durumuna ve zamana göre arkaplan
    switch (weather.icon) {
      case 'sunny':
        if (isNight) return 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900';
        if (isEvening) return 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600';
        if (isMorning) return 'bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-400';
        return 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500';
        
      case 'cloudy':
        if (isNight) return 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900';
        if (isEvening) return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-700';
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600';
          case 'rainy':
        if (isNight) return 'bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900';
        return 'bg-gradient-to-br from-slate-400 via-slate-600 to-blue-700';
        
      case 'snowy':
        if (isNight) return 'bg-gradient-to-br from-blue-900 via-indigo-900 to-white';
        return 'bg-gradient-to-br from-blue-200 via-blue-300 to-white';
        
      case 'partly-cloudy':
        if (isNight) return 'bg-gradient-to-br from-blue-800 via-indigo-800 to-purple-800';
        if (isEvening) return 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500';
        return 'bg-gradient-to-br from-blue-300 via-blue-500 to-purple-600';
        
      default:
        return 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500';
    }
  };
    const getWeatherParticles = (weather) => {
    if (!weather) return null;
    
    const currentHour = new Date().getHours();
    const isNight = currentHour < 6 || currentHour > 19;
    
    switch (weather.icon) {
      case 'rainy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Yağmur damlaları */}
            {Array.from({ length: 150 }).map((_, i) => (
              <div
                key={`rain-${i}`}
                className="absolute w-0.5 bg-gradient-to-b from-blue-200 to-blue-400 opacity-70 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  height: `${15 + Math.random() * 20}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  transform: `rotate(${-10 + Math.random() * 20}deg)`,
                  animation: `fall ${0.5 + Math.random() * 1}s linear infinite`
                }}
              />
            ))}
            
            {/* Zemin üzerinde su birikintileri efekti */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-blue-300/30 to-transparent"></div>
            
            <style jsx>{`
              @keyframes fall {
                to {
                  transform: translateY(100vh) rotate(${-10 + Math.random() * 20}deg);
                }
              }
            `}</style>
          </div>        );
        
      case 'snowy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Kar taneleri */}
            {Array.from({ length: 200 }).map((_, i) => (
              <div
                key={`snow-${i}`}
                className="absolute bg-white rounded-full opacity-80 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  animation: `snowfall ${3 + Math.random() * 2}s linear infinite`
                }}
              />
            ))}
            
            {/* Zemin üzerinde kar birikintileri */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/40 to-transparent"></div>
            
            {/* Kar rüzgarı efekti */}
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={`snow-wind-${i}`}
                className="absolute w-8 h-0.5 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                  animation: `wind ${2 + Math.random() * 3}s ease-in-out infinite`
                }}
              />
            ))}
            
            <style jsx>{`
              @keyframes snowfall {
                to {
                  transform: translateY(100vh) translateX(${-20 + Math.random() * 40}px);
                }
              }
              @keyframes wind {
                0%, 100% { transform: translateX(0px) opacity: 0.3; }
                50% { transform: translateX(30px) opacity: 0.7; }
              }
            `}</style>
          </div>
        );
        
      case 'sunny':
        if (isNight) {
          // Yıldızlar ve Ay gece için
          return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Ay */}
              <div className="absolute top-10 right-10 w-16 h-16 bg-yellow-100 rounded-full opacity-90 shadow-lg shadow-yellow-200/50 animate-pulse"></div>
              
              {/* Yıldızlar */}
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={`star-${i}`}
                  className="absolute bg-white rounded-full opacity-80 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 80}%`,
                    width: `${1 + Math.random() * 3}px`,
                    height: `${1 + Math.random() * 3}px`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
              
              {/* Geceleri parlayan bulutlar */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`night-cloud-${i}`}
                  className="absolute bg-white/10 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 60}%`,
                    width: `${60 + Math.random() * 40}px`,
                    height: `${20 + Math.random() * 15}px`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${4 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          );
        }
        
        // Güneş ışınları ve parıltılar gündüz için
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Güneş */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full opacity-80 shadow-lg shadow-yellow-400/60 animate-pulse"></div>
            
            {/* Güneş ışınları */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`sunray-${i}`}
                className="absolute top-10 right-10 w-1 h-16 bg-yellow-200 opacity-60 origin-bottom animate-pulse"
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-40px)`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '3s'
                }}
              />
            ))}
            
            {/* Parıltı efektleri */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute w-1 h-1 bg-yellow-100 rounded-full opacity-70 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        );
        
      case 'cloudy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Hareket eden bulutlar */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`cloud-${i}`}
                className="absolute bg-white opacity-20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 120 - 10}%`,
                  top: `${Math.random() * 80}%`,
                  width: `${80 + Math.random() * 60}px`,
                  height: `${30 + Math.random() * 20}px`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${6 + Math.random() * 4}s`,
                  animation: `float ${8 + Math.random() * 4}s ease-in-out infinite`
                }}
              />
            ))}
            
            {/* Bulut gölgeleri */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`cloud-shadow-${i}`}
                className="absolute bg-gray-400 opacity-10 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${40 + Math.random() * 30}px`,
                  height: `${15 + Math.random() * 10}px`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 3}s`
                }}
              />
            ))}
            
            <style jsx>{`
              @keyframes float {
                0%, 100% { transform: translateX(0px) translateY(0px); }
                25% { transform: translateX(10px) translateY(-5px); }
                50% { transform: translateX(-5px) translateY(-10px); }
                75% { transform: translateX(-10px) translateY(5px); }
              }
            `}</style>
          </div>
        );
        
      case 'partly-cloudy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Güneş */}
            <div className="absolute top-10 right-10 w-16 h-16 bg-yellow-300 rounded-full opacity-70 shadow-lg shadow-yellow-400/50 animate-pulse"></div>
            
            {/* Parçalı bulutlar */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`partial-cloud-${i}`}
                className="absolute bg-white opacity-30 rounded-full animate-pulse"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${10 + Math.random() * 40}%`,
                  width: `${60 + Math.random() * 40}px`,
                  height: `${25 + Math.random() * 15}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${5 + Math.random() * 3}s`
                }}
              />
            ))}
            
            {/* Güneş ışığı efekti */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`light-${i}`}
                className="absolute w-0.5 h-0.5 bg-yellow-200 rounded-full opacity-60 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };
    
  // Tarih ve zaman fonksiyonları
  const getCurrentDate = () => {
    const now = currentTime; // Gerçek zamanlı saat kullan
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    return {
      dayName,
      fullDate: `${day} ${month} ${year}`,
      time: now.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };
  };

  const getDateForForecast = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    if (daysAhead === 0) return 'Bugün';
    if (daysAhead === 1) return 'Yarın';
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${dayName}, ${day} ${month}`;
  };
  // Ses efektleri sistemi
  // Web Audio API ile ses oluşturma
  const createWeatherSound = (weatherType) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const sounds = {
      'rainy': () => {
        // Yağmur sesi - beyaz gürültü + filt
        const bufferSize = audioContext.sampleRate * 2;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.3;
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { source: whiteNoise, gain: gainNode, start: () => whiteNoise.start() };
      },
      
      'sunny': () => {
        // Kuş cıvıltısı - sinüs dalgalar
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.1;
        gainNode.connect(audioContext.destination);
        
        const playBirdChirp = () => {
          const oscillator = audioContext.createOscillator();
          oscillator.type = 'sine';
          
          const frequency = 800 + Math.random() * 1200;
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, audioContext.currentTime + 0.1);
          oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, audioContext.currentTime + 0.2);
          
          const envelope = audioContext.createGain();
          envelope.gain.setValueAtTime(0, audioContext.currentTime);
          envelope.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
          envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
          
          oscillator.connect(envelope);
          envelope.connect(gainNode);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
          
          // Rastgele aralıklarla tekrar çal
          setTimeout(playBirdChirp, Math.random() * 3000 + 1000);
        };
        
        playBirdChirp();
        return { source: null, gain: gainNode, start: () => {} };
      },
      
      'cloudy': () => {
        // Rüzgar sesi - düşük frekanslı gürültü
        const bufferSize = audioContext.sampleRate * 3;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.05;
        }
        
        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.15;
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { source: whiteNoise, gain: gainNode, start: () => whiteNoise.start() };
      },
      
      'snowy': () => {
        // Kar rüzgarı - çok düşük frekanslı sürekli ses
        const bufferSize = audioContext.sampleRate * 4;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.03;
        }
        
        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.2;
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { source: whiteNoise, gain: gainNode, start: () => whiteNoise.start() };
      }
    };
    
    return sounds[weatherType] ? sounds[weatherType]() : null;
  };

  // Ses çalma/durdurma fonksiyonları
  const playWeatherSound = (weatherIcon) => {
    if (!soundEnabled || !weatherIcon) return;
    
    // Önceki sesi durdur
    if (currentAudio) {
      try {
        if (currentAudio.source && currentAudio.source.stop) {
          currentAudio.source.stop();
        }
        if (currentAudio.gain) {
          currentAudio.gain.disconnect();
        }
      } catch (error) {
        console.log('Ses durdurma hatası:', error);
      }
    }
    
    try {
      const newAudio = createWeatherSound(weatherIcon);
      if (newAudio) {
        newAudio.start();
        setCurrentAudio(newAudio);
      }
    } catch (error) {
      console.log('Ses çalma hatası:', error);
    }
  };

  const stopWeatherSound = () => {
    if (currentAudio) {
      try {
        if (currentAudio.source && currentAudio.source.stop) {
          currentAudio.source.stop();
        }
        if (currentAudio.gain) {
          currentAudio.gain.disconnect();
        }
      } catch (error) {
        console.log('Ses durdurma hatası:', error);
      }
      setCurrentAudio(null);
    }
  };

  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    
    if (newSoundState && currentWeather) {
      playWeatherSound(currentWeather.icon);
    } else {
      stopWeatherSound();
    }
  };
  // Hava durumu değiştiğinde ses çal
  useEffect(() => {
    if (soundEnabled && currentWeather && currentWeather.icon) {
      playWeatherSound(currentWeather.icon);
    }
    
    return () => {
      if (!soundEnabled) {
        stopWeatherSound();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeather?.icon, soundEnabled]);
  return (
    <div className={`min-h-screen transition-all duration-1000 ${getDynamicBackground(currentWeather)} relative overflow-hidden`}>
      {/* Atmosfer Efektleri */}
      {getWeatherParticles(currentWeather)}
      
      {/* Modern Header - Sadece Uygulama Adı */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
              🌤️ Hava Durumu App
            </h1>
            <div className="text-white/70 text-sm mt-2">
              {getCurrentDate().dayName}, {getCurrentDate().fullDate} • {getCurrentDate().time}
            </div>
          </div>
          
          {/* Ses Kontrolü - Sağ Üst Köşe */}
          <div className="absolute top-4 right-6">
            <button
              onClick={toggleSound}
              className={`p-3 rounded-full transition-all duration-300 ${
                soundEnabled 
                  ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              title={soundEnabled ? 'Sesleri Kapat' : 'Sesleri Aç'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>      </header>

      {/* Ana İçerik - Optimize Edilmiş Düzen */}
      <main className="container mx-auto px-6 py-8">
          {/* 1. ŞEHİR ARAMA ALANI - Modern ve Sade */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-xl mx-auto">
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Modern Glassmorphism Container */}
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                {/* Başlık */}
                <motion.div 
                  className="text-center mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                    � Şehir Seçin
                  </h2>
                  <p className="text-white/70 text-sm">Hava durumu bilgilerini öğrenmek istediğiniz şehri yazın</p>
                </motion.div>
                
                {/* Modern Arama Input */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <motion.div
                      animate={{ rotate: loading ? 360 : 0 }}
                      transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                      className="text-2xl"
                    >
                      🔍
                    </motion.div>
                  </div>
                  <input
                    type="text"
                    placeholder="Şehir adı yazın... (örn: İstanbul, Berlin, Tokyo)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchCity()}
                    className="w-full pl-16 pr-6 py-4 bg-white/15 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 rounded-2xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400/50 outline-none transition-all duration-300 text-lg font-medium shadow-inner hover:bg-white/20"
                    disabled={loading}
                  />
                  
                  {/* Modern Loading Indicator */}
                  {loading && (
                    <motion.div 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    >
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </motion.div>
                  )}
                </div>
                
                {/* Modern Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    onClick={searchCity}
                    disabled={loading || !city.trim()}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-500/80 to-purple-600/80 backdrop-blur-sm text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                    whileHover={{ scale: loading || !city.trim() ? 1 : 1.05 }}
                    whileTap={{ scale: loading || !city.trim() ? 1 : 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className="flex items-center justify-center gap-3"
                      initial={false}
                      animate={{ opacity: loading ? 0.7 : 1 }}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="text-xl"
                          >
                            ⏳
                          </motion.div>
                          <span>Aranıyor...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🌤️</span>
                          <span>Hava Durumunu Göster</span>
                        </>
                      )}
                    </motion.div>
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  </motion.button>
                  
                  <motion.button
                    onClick={getCurrentLocationWeather}
                    disabled={locationLoading}
                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-500/80 to-teal-600/80 backdrop-blur-sm text-white py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 border border-white/20"
                    whileHover={{ scale: locationLoading ? 1 : 1.05 }}
                    whileTap={{ scale: locationLoading ? 1 : 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className="flex items-center justify-center gap-2"
                      initial={false}
                      animate={{ opacity: locationLoading ? 0.7 : 1 }}
                    >
                      {locationLoading ? (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-lg"
                          >
                            📍
                          </motion.div>
                          <span className="text-sm">Konum Alınıyor...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">📍</span>
                          <span className="text-sm">Konumumu Kullan</span>
                        </>
                      )}
                    </motion.div>
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  </motion.button>
                </div>

                {/* Status Messages */}
                <AnimatePresence>
                  {locationError && (
                    <motion.div 
                      className="mt-4 bg-red-500/20 backdrop-blur-sm rounded-2xl p-4 border border-red-500/30 shadow-lg"
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <p className="text-red-200 font-medium">Konum Hatası</p>
                          <p className="text-red-300/80 text-sm">{locationError}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {currentWeather && currentWeather.coords && (
                    <motion.div 
                      className="mt-4 bg-emerald-500/20 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/30 shadow-lg"
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                          <p className="text-emerald-200 font-medium">Konum Başarılı</p>
                          <p className="text-emerald-300/80 text-sm">
                            📍 {currentWeather.coords.lat.toFixed(4)}°N, {currentWeather.coords.lon.toFixed(4)}°E
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Soft Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
            </motion.div>
          </div>
        </motion.div>        {/* 2. ANA HAVA DURUMU KARTI - Modern Slider */}
        {currentWeather && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="max-w-2xl mx-auto">
              <motion.div 
                className="relative group overflow-hidden"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Modern Glassmorphism Card */}
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/20 to-pink-500/20 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <motion.div 
                      className="text-center mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.h2 
                        className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent"
                        animate={{ backgroundPosition: ['0%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                      >
                        📍 {currentWeather.name}
                      </motion.h2>
                      <div className="text-white/70 text-sm font-medium">
                        {getCurrentDate().dayName}, {getCurrentDate().fullDate} • {getCurrentDate().time}
                      </div>
                    </motion.div>
                    
                    {/* Weather Icon */}
                    <motion.div 
                      className="flex items-center justify-center mb-8"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
                    >
                      <motion.div 
                        className="text-9xl filter drop-shadow-2xl"
                        animate={{ 
                          y: [0, -10, 0],
                          rotateY: [0, 10, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {getWeatherIcon(currentWeather.icon)}
                      </motion.div>
                    </motion.div>
                    
                    {/* Temperature */}
                    <motion.div 
                      className="text-center mb-8"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                    >
                      <motion.div 
                        className="text-8xl font-bold bg-gradient-to-br from-orange-200 via-white to-blue-200 bg-clip-text text-transparent mb-2"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {currentWeather.temp}°C
                      </motion.div>
                      <motion.p 
                        className="text-2xl text-white/90 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                      >
                        {currentWeather.description}
                      </motion.p>
                    </motion.div>
                    
                    {/* Weather Details Grid */}
                    <motion.div 
                      className="grid grid-cols-2 gap-4"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1 }}
                    >
                      {[
                        { label: 'Hissedilen', value: `${currentWeather.feelsLike}°C`, icon: '🌡️' },
                        { label: 'Nem', value: `${currentWeather.humidity}%`, icon: '💧' },
                        { label: 'Rüzgar', value: `${currentWeather.windSpeed} km/h`, icon: '💨' },
                        { label: 'Basınç', value: `${currentWeather.pressure} hPa`, icon: '🌪️' }
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                          initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                              {item.icon}
                            </span>
                            <div>
                              <div className="text-white/70 text-sm font-medium">{item.label}</div>
                              <div className="text-white text-xl font-bold">{item.value}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
                
                {/* Enhanced Glow Effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-orange-500/30 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
              </motion.div>
            </div>
          </motion.div>
        )}        {/* 3. SAATLİK TAHMİN - Modern Slider */}
        {hourlyForecast.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.h3 
                className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                🕐 24 Saatlik Tahmin
              </motion.h3>
              
              {/* Modern Scrollable Container */}
              <div className="relative">
                {/* Gradient Fade Edges */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none"></div>
                
                <div className="overflow-x-auto pb-4 px-4 scrollbar-hide">
                  <motion.div 
                    className="flex gap-4 min-w-max"
                    initial={{ x: -100 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  >
                    {hourlyForecast.map((hour, index) => (
                      <motion.div
                        key={index}
                        className="flex-shrink-0 group"
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 1 + index * 0.05,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          scale: 1.05, 
                          y: -8,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {/* Modern Glassmorphism Card */}
                        <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 rounded-2xl p-5 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 w-36">
                          
                          {/* Decorative Glow */}
                          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-orange-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                          
                          {/* Content */}
                          <div className="relative z-10 text-center text-white">
                            {/* Time */}
                            <motion.div 
                              className="text-sm font-bold mb-3 text-blue-200"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.2 + index * 0.05 }}
                            >
                              {hour.label}
                            </motion.div>
                            
                            {/* Weather Icon */}
                            <motion.div 
                              className="text-4xl mb-3 filter drop-shadow-lg"
                              animate={{ 
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                duration: 3 + index * 0.2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {getWeatherIcon(hour.icon)}
                            </motion.div>
                            
                            {/* Temperature */}
                            <motion.div 
                              className="text-xl font-bold mb-2 bg-gradient-to-r from-orange-200 to-blue-200 bg-clip-text text-transparent"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 1.4 + index * 0.05, type: "spring" }}
                            >
                              {hour.temp}°C
                            </motion.div>
                            
                            {/* Description */}
                            <motion.div 
                              className="text-xs text-white/80 mb-3 font-medium"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.6 + index * 0.05 }}
                            >
                              {hour.description}
                            </motion.div>
                            
                            {/* Weather Details */}
                            <motion.div 
                              className="space-y-2 text-xs"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1.8 + index * 0.05 }}
                            >
                              <div className="flex justify-between items-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                                <span className="flex items-center gap-1">
                                  <span>💧</span>
                                  <span className="text-white/70">Yağış</span>
                                </span>
                                <span className="font-bold text-blue-200">{hour.precipitation}%</span>
                              </div>
                              <div className="flex justify-between items-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                                <span className="flex items-center gap-1">
                                  <span>💨</span>
                                  <span className="text-white/70">Rüzgar</span>
                                </span>
                                <span className="font-bold text-green-200">{hour.windSpeed}km/h</span>
                              </div>
                              <div className="flex justify-between items-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                                <span className="flex items-center gap-1">
                                  <span>💧</span>
                                  <span className="text-white/70">Nem</span>
                                </span>
                                <span className="font-bold text-purple-200">{hour.humidity}%</span>
                              </div>
                            </motion.div>
                          </div>
                          
                          {/* Hover Border Effect */}
                          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 transition-all duration-300"></div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
              
              {/* Scroll Hint */}
              <motion.div 
                className="text-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <p className="text-white/60 text-sm font-medium">
                  ← Daha fazla saat için kaydırın →
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}        {/* 4. 10 GÜNLÜK TAHMİN - Modern Slider */}
        {forecast.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.h3 
                className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-orange-200 via-white to-blue-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                📅 10 Günlük Tahmin
              </motion.h3>
              
              {/* Modern Scrollable Container */}
              <div className="relative">
                {/* Gradient Fade Edges */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none"></div>
                
                <div className="overflow-x-auto pb-6 px-4 scrollbar-hide">
                  <motion.div 
                    className="flex gap-6 min-w-max"
                    initial={{ x: -100 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 1.2, delay: 1 }}
                  >
                    {forecast.map((day, index) => (
                      <motion.div
                        key={index}
                        className="flex-shrink-0 group"
                        initial={{ opacity: 0, y: 40, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.6, 
                          delay: 1.2 + index * 0.1,
                          type: "spring",
                          stiffness: 80
                        }}
                        whileHover={{ 
                          scale: 1.08, 
                          y: -12,
                          rotateY: 5,
                          transition: { duration: 0.3 }
                        }}
                      >
                        {/* Modern Glassmorphism Card */}
                        <div className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 rounded-3xl p-6 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 w-48">
                          
                          {/* Decorative Elements */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-2xl"></div>
                          <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-orange-400/30 to-pink-500/30 rounded-full blur-xl"></div>
                          
                          {/* Enhanced Glow Effect */}
                          <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
                          
                          {/* Content */}
                          <div className="relative z-10 text-center text-white">
                            {/* Day */}
                            <motion.div 
                              className="text-sm font-bold mb-2 text-blue-200"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.4 + index * 0.1 }}
                            >
                              {day.day}
                            </motion.div>
                            
                            {/* Day Label */}
                            <motion.div 
                              className="text-xs mb-4 font-medium"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.6 + index * 0.1 }}
                            >
                              {index === 0 ? (
                                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-bold">Bugün</span>
                              ) : index === 1 ? (
                                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">Yarın</span>
                              ) : (
                                <span className="text-white/60">{index} gün sonra</span>
                              )}
                            </motion.div>
                            
                            {/* Weather Icon */}
                            <motion.div 
                              className="text-5xl mb-4 filter drop-shadow-2xl"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ 
                                delay: 1.8 + index * 0.1, 
                                type: "spring",
                                stiffness: 120
                              }}
                              whileHover={{
                                rotate: [0, -10, 10, 0],
                                scale: [1, 1.2, 1],
                                transition: { duration: 0.5 }
                              }}
                            >
                              {getWeatherIcon(day.icon)}
                            </motion.div>
                            
                            {/* Temperature */}
                            <motion.div 
                              className="text-3xl font-bold mb-3"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ 
                                delay: 2 + index * 0.1, 
                                type: "spring",
                                stiffness: 200
                              }}
                            >
                              <span className="bg-gradient-to-r from-orange-200 via-yellow-200 to-blue-200 bg-clip-text text-transparent">
                                {day.temp}°C
                              </span>
                            </motion.div>
                            
                            {/* Description */}
                            <motion.div 
                              className="text-sm text-white/80 font-medium px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 2.2 + index * 0.1 }}
                            >
                              {day.description}
                            </motion.div>
                          </div>
                          
                          {/* Hover Border Effect */}
                          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/40 transition-all duration-500"></div>
                          
                          {/* Special Effects for Today and Tomorrow */}
                          {index === 0 && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                          )}
                          {index === 1 && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
              
              {/* Scroll Hint */}
              <motion.div 
                className="text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                <p className="text-white/60 text-sm font-medium">
                  ← 10 günlük tahmin için kaydırın →
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}        {/* YAN PANELLER - Sağlık ve Uyarılar */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {/* Sol Panel - Sağlık Bilgileri */}
          {currentWeather && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {/* Sağlık Bilgileri Kartı */}
              <motion.div 
                className="relative group overflow-hidden"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/30 to-blue-500/30 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-400/30 to-pink-500/30 rounded-full blur-xl"></div>
                  
                  <div className="relative z-10">
                    <motion.h3 
                      className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 bg-clip-text text-transparent flex items-center gap-3"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                    >
                      <motion.span 
                        className="text-3xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🏥
                      </motion.span>
                      Sağlık Bilgileri
                    </motion.h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          title: 'Hava Kalitesi',
                          value: currentWeather.aqi,
                          unit: 'AQI Index',
                          level: currentWeather.aqiLevel,
                          color: getAQIColor(currentWeather.aqi),
                          icon: '🌬️',
                          gradient: 'from-green-400/20 to-blue-500/20'
                        },
                        {
                          title: 'UV Index',
                          value: currentWeather.uvIndex,
                          unit: 'Güneş Işını',
                          level: currentWeather.uvLevel,
                          color: getUVColor(currentWeather.uvIndex),
                          icon: '☀️',
                          gradient: 'from-yellow-400/20 to-orange-500/20'
                        },
                        {
                          title: 'Görüş Mesafesi',
                          value: currentWeather.visibility,
                          unit: 'km',
                          icon: '👁️',
                          gradient: 'from-purple-400/20 to-blue-500/20'
                        },
                        {
                          title: 'Çiy Noktası',
                          value: currentWeather.dewPoint,
                          unit: '°C',
                          icon: '💧',
                          gradient: 'from-blue-400/20 to-cyan-500/20'
                        }
                      ].map((item, index) => (
                        <motion.div
                          key={item.title}
                          className={`relative group overflow-hidden backdrop-blur-xl bg-gradient-to-br ${item.gradient} rounded-2xl p-5 border border-white/20 hover:border-white/40 transition-all duration-300`}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 1.4 + index * 0.1,
                            type: "spring",
                            stiffness: 100
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            y: -5,
                            transition: { duration: 0.2 }
                          }}
                        >
                          {/* Mini Glow Effect */}
                          <div className="absolute -inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-2xl blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-white/80 font-medium flex items-center gap-2">
                                <motion.span 
                                  className="text-lg"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                                >
                                  {item.icon}
                                </motion.span>
                                {item.title}
                              </span>
                              {item.level && (
                                <motion.div 
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${item.color} text-white backdrop-blur-sm`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 1.6 + index * 0.1, type: "spring" }}
                                >
                                  {item.level}
                                </motion.div>
                              )}
                            </div>
                            <motion.div 
                              className="text-3xl font-bold text-white mb-1"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 1.8 + index * 0.1, type: "spring", stiffness: 200 }}
                            >
                              {item.value}
                            </motion.div>
                            <div className="text-xs text-white/70 font-medium">{item.unit}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Glow Effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
              </motion.div>
              
              {/* Sağlık Önerileri Kartı */}
              <motion.div 
                className="relative group overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-green-400/30 to-blue-500/30 rounded-full blur-xl"></div>
                  
                  <div className="relative z-10">
                    <motion.h3 
                      className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200 bg-clip-text text-transparent flex items-center gap-3"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.7 }}
                    >
                      <motion.span 
                        className="text-3xl"
                        animate={{ 
                          rotate: [0, 15, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        💡
                      </motion.span>
                      Sağlık Önerileri
                    </motion.h3>
                    
                    <div className="space-y-4">
                      {[
                        currentWeather.aqi > 100 && {
                          icon: '⚠️',
                          text: 'Hava kalitesi kötü - Dışarıda zaman geçirmeyi sınırlayın',
                          bgColor: 'bg-yellow-500/20',
                          borderColor: 'border-yellow-500/30',
                          iconColor: 'text-yellow-300'
                        },
                        currentWeather.uvIndex > 6 && {
                          icon: '☀️',
                          text: 'Yüksek UV - Güneş kremi kullanın ve gölgede kalın',
                          bgColor: 'bg-orange-500/20',
                          borderColor: 'border-orange-500/30',
                          iconColor: 'text-orange-300'
                        },
                        currentWeather.temp > 30 && {
                          icon: '🔥',
                          text: 'Çok sıcak - Bol su için ve serin yerlerde kalın',
                          bgColor: 'bg-red-500/20',
                          borderColor: 'border-red-500/30',
                          iconColor: 'text-red-300'
                        },
                        currentWeather.humidity > 80 && {
                          icon: '💧',
                          text: 'Yüksek nem - Nefes alabilen giysiler tercih edin',
                          bgColor: 'bg-blue-500/20',
                          borderColor: 'border-blue-500/30',
                          iconColor: 'text-blue-300'
                        },
                        {
                          icon: '💚',
                          text: `Bugün için genel olarak ${currentWeather.temp > 35 ? 'dikkatli olun' : currentWeather.temp < 0 ? 'üşümeyin' : 'keyifli vakit geçirin'}!`,
                          bgColor: 'bg-green-500/20',
                          borderColor: 'border-green-500/30',
                          iconColor: 'text-green-300'
                        }
                      ].filter(Boolean).map((recommendation, index) => (
                        <motion.div
                          key={index}
                          className={`${recommendation.bgColor} backdrop-blur-sm rounded-2xl p-4 border ${recommendation.borderColor} hover:scale-[1.02] transition-all duration-300 group`}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 1.9 + index * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-center gap-3">
                            <motion.span 
                              className={`text-2xl ${recommendation.iconColor} group-hover:scale-110 transition-transform duration-300`}
                              animate={{ 
                                rotate: [0, 10, -10, 0] 
                              }}
                              transition={{ 
                                duration: 2 + index * 0.5, 
                                repeat: Infinity,
                                delay: index * 0.3
                              }}
                            >
                              {recommendation.icon}
                            </motion.span>
                            <span className="text-white text-sm font-medium leading-relaxed">
                              {recommendation.text}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Glow Effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/20 via-green-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
              </motion.div>
            </motion.div>
          )}          
          {/* Sağ Panel - Meteorolojik Uyarılar ve Testler */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >            {weatherAlerts.length > 0 && (
              <motion.div 
                className="relative group overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                whileHover={{ y: -5 }}
              >
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/30 to-orange-500/30 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-400/30 to-red-500/30 rounded-full blur-xl"></div>
                  
                  <div className="relative z-10">
                    <motion.h3 
                      className="text-2xl font-bold mb-6 bg-gradient-to-r from-red-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent flex items-center gap-3"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6 }}
                    >
                      <motion.span 
                        className="text-3xl"
                        animate={{ 
                          rotate: [0, 15, -15, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🚨
                      </motion.span>
                      Meteorolojik Uyarılar
                    </motion.h3>
                    
                    <div className="space-y-4">
                      {weatherAlerts.map((alert, index) => (
                        <motion.div 
                          key={alert.id} 
                          className={`${alert.color} bg-opacity-20 backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/50 transition-all duration-300 group relative overflow-hidden`}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: -5 }}
                        >
                          {/* Mini Glow Effect */}
                          <div className="absolute -inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-2xl blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                          
                          <div className="flex items-start gap-4 relative z-10">
                            <motion.div 
                              className="text-3xl flex-shrink-0"
                              animate={{ 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                duration: 2 + index * 0.5, 
                                repeat: Infinity,
                                delay: index * 0.2
                              }}
                            >
                              {alert.icon}
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <motion.h4 
                                  className="font-bold text-white text-lg"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 2 + index * 0.1 }}
                                >
                                  {alert.title}
                                </motion.h4>
                                <motion.div 
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${alert.color} text-white backdrop-blur-sm`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 2.2 + index * 0.1, type: "spring" }}
                                >
                                  {alert.level === 'high' ? 'Yüksek' : alert.level === 'medium' ? 'Orta' : 'Düşük'} Risk
                                </motion.div>
                              </div>
                              <motion.p 
                                className="text-white text-sm mb-4 opacity-90 leading-relaxed"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2.4 + index * 0.1 }}
                              >
                                {alert.message}
                              </motion.p>
                              <div className="space-y-2">
                                <motion.h5 
                                  className="text-xs font-bold text-white flex items-center gap-2"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 2.6 + index * 0.1 }}
                                >
                                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                  Öneriler:
                                </motion.h5>
                                {alert.recommendations.map((rec, idx) => (
                                  <motion.div 
                                    key={idx} 
                                    className="flex items-center gap-3 text-xs text-white opacity-80 bg-white/10 rounded-lg p-2 backdrop-blur-sm"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 2.8 + index * 0.1 + idx * 0.05 }}
                                  >
                                    <span className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0 animate-pulse"></span>
                                    <span>{rec}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Glow Effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
              </motion.div>
            )}
            
            {/* Test Butonları */}
            <motion.div 
              className="relative group overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              whileHover={{ y: -5 }}
            >
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-400/30 to-purple-500/30 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <motion.h3 
                    className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent flex items-center justify-center gap-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                  >
                    <motion.span 
                      className="text-3xl"
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      🧪
                    </motion.span>
                    Test Senaryoları
                  </motion.h3>
                  
                  <div className="space-y-6 mb-8">
                    <motion.h4 
                      className="text-lg font-bold text-white flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2 }}
                    >
                      <motion.span 
                        animate={{ rotate: [0, 20, -20, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ⚠️
                      </motion.span>
                      Uyarı Testleri:
                    </motion.h4>
                    <motion.div 
                      className="grid grid-cols-2 gap-3 text-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.2 }}
                    >
                      {[
                        {
                          icon: '🔥',
                          label: 'Aşırı Sıcaklık',
                          onClick: () => { 
                            const extremeHeat = { ...currentWeather, temp: 38, uvIndex: 10, aqi: 180, icon: 'sunny' }; 
                            setCurrentWeather(extremeHeat); 
                            setHourlyForecast(generateHourlyForecast(extremeHeat)); 
                            setWeatherAlerts(generateWeatherAlerts(extremeHeat)); 
                          },
                          gradient: 'from-red-500/20 to-orange-500/20',
                          hoverGradient: 'hover:from-red-500/30 hover:to-orange-500/30'
                        },
                        {
                          icon: '💨',
                          label: 'Fırtına',
                          onClick: () => { 
                            const storm = { ...currentWeather, windSpeed: 65, visibility: 3, humidity: 95, icon: 'rainy' }; 
                            setCurrentWeather(storm); 
                            setHourlyForecast(generateHourlyForecast(storm)); 
                            setWeatherAlerts(generateWeatherAlerts(storm)); 
                          },
                          gradient: 'from-orange-500/20 to-yellow-500/20',
                          hoverGradient: 'hover:from-orange-500/30 hover:to-yellow-500/30'
                        },
                        {
                          icon: '🧊',
                          label: 'Donma',
                          onClick: () => { 
                            const freezing = { ...currentWeather, temp: -5, windSpeed: 35, icon: 'snowy' }; 
                            setCurrentWeather(freezing); 
                            setHourlyForecast(generateHourlyForecast(freezing)); 
                            setWeatherAlerts(generateWeatherAlerts(freezing)); 
                          },
                          gradient: 'from-blue-500/20 to-cyan-500/20',
                          hoverGradient: 'hover:from-blue-500/30 hover:to-cyan-500/30'
                        },
                        {
                          icon: '🏭',
                          label: 'Kirlilik',
                          onClick: () => { 
                            const pollution = { ...currentWeather, aqi: 200, visibility: 2, icon: 'cloudy' }; 
                            setCurrentWeather(pollution); 
                            setHourlyForecast(generateHourlyForecast(pollution)); 
                            setWeatherAlerts(generateWeatherAlerts(pollution)); 
                          },
                          gradient: 'from-gray-500/20 to-slate-500/20',
                          hoverGradient: 'hover:from-gray-500/30 hover:to-slate-500/30'
                        }
                      ].map((button, index) => (
                        <motion.button
                          key={button.label}
                          onClick={button.onClick}
                          className={`bg-gradient-to-r ${button.gradient} ${button.hoverGradient} backdrop-blur-sm text-white py-3 px-4 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg group relative overflow-hidden`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 2.4 + index * 0.1, type: "spring" }}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="flex items-center gap-2 relative z-10">
                            <motion.span 
                              className="text-xl"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2 + index * 0.3, repeat: Infinity }}
                            >
                              {button.icon}
                            </motion.span>
                            <span className="font-medium">{button.label}</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>
                  
                  <div className="space-y-6">
                    <motion.h4 
                      className="text-lg font-bold text-white flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.6 }}
                    >
                      <motion.span 
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.3, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        🎨
                      </motion.span>
                      Atmosfer Testleri:
                    </motion.h4>
                    <motion.div 
                      className="grid grid-cols-2 gap-3 text-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.8 }}
                    >
                      {[
                        {
                          icon: '☀️',
                          label: 'Güneşli',
                          subtitle: '🐦 Kuş sesi',
                          onClick: () => { 
                            const sunny = { ...currentWeather, icon: 'sunny', temp: 28, description: 'Güneşli' }; 
                            setCurrentWeather(sunny); 
                            setHourlyForecast(generateHourlyForecast(sunny)); 
                          },
                          gradient: 'from-yellow-500/20 to-orange-500/20',
                          hoverGradient: 'hover:from-yellow-500/30 hover:to-orange-500/30'
                        },
                        {
                          icon: '🌧️',
                          label: 'Yağmurlu',
                          subtitle: '💧 Yağmur sesi',
                          onClick: () => { 
                            const rainy = { ...currentWeather, icon: 'rainy', temp: 18, description: 'Yağmurlu' }; 
                            setCurrentWeather(rainy); 
                            setHourlyForecast(generateHourlyForecast(rainy)); 
                          },
                          gradient: 'from-blue-500/20 to-indigo-500/20',
                          hoverGradient: 'hover:from-blue-500/30 hover:to-indigo-500/30'
                        },
                        {
                          icon: '❄️',
                          label: 'Karlı',
                          subtitle: '🌬️ Kar rüzgarı',
                          onClick: () => { 
                            const snowy = { ...currentWeather, icon: 'snowy', temp: -2, description: 'Karlı' }; 
                            setCurrentWeather(snowy); 
                            setHourlyForecast(generateHourlyForecast(snowy)); 
                          },
                          gradient: 'from-indigo-500/20 to-purple-500/20',
                          hoverGradient: 'hover:from-indigo-500/30 hover:to-purple-500/30'
                        },
                        {
                          icon: '☁️',
                          label: 'Bulutlu',
                          subtitle: '💨 Rüzgar sesi',
                          onClick: () => { 
                            const cloudy = { ...currentWeather, icon: 'cloudy', temp: 20, description: 'Bulutlu' }; 
                            setCurrentWeather(cloudy); 
                            setHourlyForecast(generateHourlyForecast(cloudy)); 
                          },
                          gradient: 'from-gray-600/20 to-slate-600/20',
                          hoverGradient: 'hover:from-gray-600/30 hover:to-slate-600/30'
                        }
                      ].map((button, index) => (
                        <motion.button
                          key={button.label}
                          onClick={button.onClick}
                          className={`bg-gradient-to-r ${button.gradient} ${button.hoverGradient} backdrop-blur-sm text-white py-4 px-4 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg group relative overflow-hidden`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 3 + index * 0.1, type: "spring" }}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                              <motion.span 
                                className="text-xl"
                                animate={{ 
                                  rotate: [0, 15, -15, 0],
                                  scale: [1, 1.2, 1]
                                }}
                                transition={{ duration: 2.5 + index * 0.3, repeat: Infinity }}
                              >
                                {button.icon}
                              </motion.span>
                              <span className="font-medium">{button.label}</span>
                            </div>
                            <div className="text-xs opacity-70">{button.subtitle}</div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="mt-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5 }}
                  >
                    <div className="text-sm text-white/60 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                      {soundEnabled ? (
                        <motion.span 
                          className="text-green-300 flex items-center justify-center gap-2"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <span className="animate-pulse">🔊</span>
                          Sesler açık - Atmosfer sesleri çalıyor
                        </motion.span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>🔇</span>
                          Sesler kapalı - Header'daki butona tıklayarak açabilirsiniz
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Enhanced Glow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
            </motion.div>          </motion.div>
        </motion.div>
      </main>
      {/* Atmosferik Efektler */}
      {currentWeather && (
        <div className="absolute inset-0 pointer-events-none">
          {getWeatherParticles(currentWeather)}
          {/* Gece için ekstra yıldız efekti */}
          {currentWeather.icon === 'sunny' && new Date().getHours() < 6 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="absolute w-1 h-1 bg-white rounded-full opacity-50 animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 2}s` }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
