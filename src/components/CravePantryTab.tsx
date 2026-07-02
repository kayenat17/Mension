import React, { useState, useEffect } from 'react';
import { pantryData } from './CravePantrySection';
import { getDeliveryApps } from '@/utils/deliveryApps';
import FeedbackBanner from "./FeedbackBanner";

export default function CravePantryTab() {
  const [currentPhase, setCurrentPhase] = useState<string>('luteal');
  const [userTz, setUserTz] = useState('');

  useEffect(() => {
    // Determine location by URL (IP geolocation)
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (response.ok) {
          const data = await response.json();
          if (data && data.timezone) {
            setUserTz(data.timezone);
            return;
          }
        }
      } catch (e) {
        console.warn("URL location discovery failed, falling back to local device timezone");
      }
      
      // Fallback if URL location is not traced
      try {
        setUserTz(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
      } catch (e) {
        console.warn("Timezone fallback failed");
      }
    };

    fetchLocation();
    
    const savedPhase = localStorage.getItem('clara-current-phase');
    if (savedPhase && (savedPhase === 'menstrual' || savedPhase === 'follicular' || savedPhase === 'ovulation' || savedPhase === 'luteal')) {
      setCurrentPhase(savedPhase);
    }
  }, []);

  const products = pantryData[currentPhase as keyof typeof pantryData];

  const getPhaseHeader = () => {
    switch(currentPhase) {
      case 'menstrual': return "You're in menstrual phase 🩸 Your body is craving rest and warmth, and that's valid.";
      case 'follicular': return "You're in follicular phase 🌱 Your body is craving fresh energy, and that's valid.";
      case 'ovulation': return "You're in ovulation phase ☀️ Your body is craving vibrant fuel, and that's valid.";
      case 'luteal': 
      default:
        return "You're in luteal phase 🌙 Your body is craving comfort, and that's valid.";
    }
  };

  const getPhaseLabel = () => `${currentPhase.toUpperCase()} PHASE CARE`;

  return (
    <div className="h-full bg-[#fcf9f8] p-4 md:p-8 overflow-y-auto w-full mx-auto animate-fade-in relative z-10 text-[#1c1b1b] font-sans pb-32">
      <div className="max-w-[1440px] mx-auto">
        {/* Hero Section */}
        <section className="mb-12 text-center md:text-left pt-8 md:pt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block py-1 px-3 rounded-full bg-[#b10e6b]/10 text-[#b10e6b] font-bold text-xs tracking-wider mb-3">
                {getPhaseLabel()}
              </span>
              <h1 className="text-4xl md:text-6xl text-[#1c1b1b] mb-4 font-serif italic">Crave Pantry</h1>
              <p className="text-lg md:text-xl text-[#494454] leading-relaxed">
                {getPhaseHeader()}
              </p>
            </div>
          </div>
        </section>

        {/* Magazine Style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Item 1: Index 0 (Wide/Featured) */}
          <div className="md:col-span-8 group">
            <div className="bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(107,56,212,0.04)] rounded-xl p-6 flex flex-col md:flex-row gap-6 transition-all duration-400 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(107,56,212,0.08)]">
              <div className="md:w-1/2 aspect-[4/5] overflow-hidden rounded-xl shadow-lg shrink-0">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={products[0].image} 
                  alt={products[0].name}
                />
              </div>
              <div className="md:w-1/2 flex flex-col justify-center">
                <h3 className="text-3xl font-serif mb-3 flex items-center gap-2">
                  <span className="text-2xl">{products[0].emoji}</span> {products[0].name}
                </h3>
                <p className="text-[#494454] mb-8">{products[0].reason}</p>
                <div className="flex flex-wrap gap-3">
                  {getDeliveryApps(products[0].name, userTz).slice(0, 2).map((app, appIdx) => (
                    <a key={appIdx} href={app.url} target="_blank" rel="noopener noreferrer" className={`flex-1 min-w-[120px] text-center ${app.bgColor} ${app.hoverBgColor} ${app.textColor} font-bold py-3 px-6 rounded-lg transition-opacity hover:opacity-90 flex items-center justify-center gap-2`}>
                      {app.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Item 2: Index 1 */}
          <div className="md:col-span-4 group">
            <div className="bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(107,56,212,0.04)] rounded-xl p-6 h-full flex flex-col transition-all duration-400 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(107,56,212,0.08)]">
              <div className="aspect-[4/5] overflow-hidden rounded-xl mb-6 shadow-md shrink-0">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={products[1].image} 
                  alt={products[1].name}
                />
              </div>
              <h3 className="text-2xl font-serif mb-2 flex items-center gap-2">
                <span className="text-xl">{products[1].emoji}</span> {products[1].name}
              </h3>
              <p className="text-[#494454] mb-6 flex-grow">{products[1].reason}</p>
              <div className="flex flex-col gap-3 mt-auto">
                {getDeliveryApps(products[1].name, userTz).slice(0, 2).map((app, appIdx) => (
                  <a key={appIdx} href={app.url} target="_blank" rel="noopener noreferrer" className={`w-full text-center ${app.bgColor} ${app.hoverBgColor} ${app.textColor} font-bold py-2.5 px-4 rounded-lg transition-colors`}>
                    {app.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Item 3: Index 2 */}
          <div className="md:col-span-5 group">
            <div className="bg-[#e9ddff]/30 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(107,56,212,0.04)] rounded-xl p-6 h-full flex flex-col transition-all duration-400 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(107,56,212,0.08)]">
              <div className="aspect-[4/5] overflow-hidden rounded-xl mb-6 shadow-md shrink-0">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={products[2].image} 
                  alt={products[2].name}
                />
              </div>
              <h3 className="text-2xl font-serif mb-2 flex items-center gap-2">
                <span className="text-xl">{products[2].emoji}</span> {products[2].name}
              </h3>
              <p className="text-[#494454] mb-6 flex-grow">{products[2].reason}</p>
              <div className="flex gap-3 mt-auto">
                {getDeliveryApps(products[2].name, userTz).slice(0, 2).map((app, appIdx) => (
                  <a key={appIdx} href={app.url} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center ${app.bgColor} ${app.hoverBgColor} ${app.textColor} font-bold py-3 px-4 rounded-lg transition-colors`}>
                    {app.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Item 4: Index 3 (Wide/Reverse) */}
          <div className="md:col-span-7 group">
            <div className="bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(107,56,212,0.04)] rounded-xl p-6 flex flex-col md:flex-row-reverse gap-6 transition-all duration-400 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(107,56,212,0.08)] h-full">
              <div className="md:w-1/2 aspect-[4/5] overflow-hidden rounded-xl shadow-lg shrink-0">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={products[3].image} 
                  alt={products[3].name}
                />
              </div>
              <div className="md:w-1/2 flex flex-col justify-center">
                <h3 className="text-3xl font-serif mb-3 flex items-center gap-2">
                  <span className="text-2xl">{products[3].emoji}</span> {products[3].name}
                </h3>
                <p className="text-[#494454] mb-8">{products[3].reason}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {getDeliveryApps(products[3].name, userTz).slice(0, 2).map((app, appIdx) => (
                    <a key={appIdx} href={app.url} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center ${app.bgColor} ${app.hoverBgColor} ${app.textColor} font-bold py-3 px-6 rounded-lg transition-colors`}>
                      {app.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
      <FeedbackBanner />
    </div>
  );
}
