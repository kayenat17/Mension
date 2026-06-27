import React, { useState, useEffect } from 'react';
import { getDeliveryApps } from '@/utils/deliveryApps';

export const pantryData = {
  menstrual: [
    { emoji: '☕', name: 'Ginger Tea', reason: 'Warmth helps soothe cramping and reduces inflammation.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIS8cR1-RzqDp6ULRoxBWYgwiqWRgxxKM_m-APEmKHQuRcHq8kOr3EMzE2wJlR3v6VluLGq5n7Qb67dF-SsD1utX1WBzCQyTeJD6lPHhoA-68yNVgrS_5YRkfQ_m1ZJs-h9fE281gZMjrmHvv6KY7vDOHIMbwU7MBEZIcNTX23A0d3x82tzPpj9DHKG_wG3I9d222iWD5NDYhBFsjtvO9yi418si1WKjtHYOIzG0xzeTIJCCrexw6h2VlRw44oiW21U9p0R10FIhE' },
    { emoji: '🍫', name: 'Dark Chocolate 70%', reason: 'Rich in magnesium to ease cramps and boost your mood.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQDuXsff1TVuExwtPvTH_MlAVXukRtlIWe9-clURTPBnhqONJ5DzS0l6WYgPcorvWlgXxBkpEtw0uKlVGryboBKOV70rP3WkGaaFcME-eZhBLX-eZVWm6eLDD1rLhreoGgVUPG2Pw7RctPmna5bGPK7SccEtUbCMlBYUT0D9NJx6MlSM5vqdaeja-_nCdhGCmIIm5qBTA_FwpNZH_4O5LzrdKFLpZ0Mo8_wSlXYP4i6ZpZOFyOuIKqlfMOLG6mSMGf0EBZDPnnwS0' },
    { emoji: '🔥', name: 'Heating Pad', reason: 'Direct warmth provides immediate relief for uterine contractions.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_hkzB_rRFEm91qUiJkf8SWmHui5jrNiXNiJt3JP1wgFauYM3vxKrYRWQMC9QFmwep7GauUqmaNUsEhVUbSVp6TspO8kFhEgqFCvZjk60nD3KbZKdUmGG62cHekbUu0tqN4Bbr0Rklo0t4lPvsuDk3TlrgSAJX-z4VIV3NmqIR6F_A7qdTNOTfrKUjWIhGiuwCenMooFeth6M5Sk9SUYZXt_ooESlo7pGW1jkjJw2dTJ0LkXKTlYTi6N89FDPPiukaykoN-27sEXE' },
    { emoji: '🥜', name: 'Iron Rich Snacks', reason: 'Replenishes the iron you are naturally losing right now.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGdQayts7veFg_pFNdijQd7q-wdkG63cDeL5mpT8kX55lNyqve04e2BaY_w5GDyNMQmLxJC6e7-_ANI4M4vJQR1o6qIWjovPjJoYes3imOh4QvZLjcwjzct1eFKv9DjArkff_6Pm9SM2S0emO9ts8ZDssKLlkctmhZHrEDBTbszL-2yLAP25TaoY0jJIJdr50A1KtjPPZIBD-_ao8nARra4nd40D9LhZDTdUpxIQccPTf_vMfeJDOOALduW2_XWnQu9D2bGby67mA' }
  ],
  follicular: [
    { emoji: '🍓', name: 'Fresh Fruit Box', reason: 'Light, hydrating energy to match your rising estrogen.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGdQayts7veFg_pFNdijQd7q-wdkG63cDeL5mpT8kX55lNyqve04e2BaY_w5GDyNMQmLxJC6e7-_ANI4M4vJQR1o6qIWjovPjJoYes3imOh4QvZLjcwjzct1eFKv9DjArkff_6Pm9SM2S0emO9ts8ZDssKLlkctmhZHrEDBTbszL-2yLAP25TaoY0jJIJdr50A1KtjPPZIBD-_ao8nARra4nd40D9LhZDTdUpxIQccPTf_vMfeJDOOALduW2_XWnQu9D2bGby67mA' },
    { emoji: '🥚', name: 'Protein Snacks', reason: 'Supports the rebuilding of your uterine lining and sustained energy.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_hkzB_rRFEm91qUiJkf8SWmHui5jrNiXNiJt3JP1wgFauYM3vxKrYRWQMC9QFmwep7GauUqmaNUsEhVUbSVp6TspO8kFhEgqFCvZjk60nD3KbZKdUmGG62cHekbUu0tqN4Bbr0Rklo0t4lPvsuDk3TlrgSAJX-z4VIV3NmqIR6F_A7qdTNOTfrKUjWIhGiuwCenMooFeth6M5Sk9SUYZXt_ooESlo7pGW1jkjJw2dTJ0LkXKTlYTi6N89FDPPiukaykoN-27sEXE' },
    { emoji: '🍵', name: 'Green Tea', reason: 'A gentle caffeine lift to compliment your natural energy rise.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIS8cR1-RzqDp6ULRoxBWYgwiqWRgxxKM_m-APEmKHQuRcHq8kOr3EMzE2wJlR3v6VluLGq5n7Qb67dF-SsD1utX1WBzCQyTeJD6lPHhoA-68yNVgrS_5YRkfQ_m1ZJs-h9fE281gZMjrmHvv6KY7vDOHIMbwU7MBEZIcNTX23A0d3x82tzPpj9DHKG_wG3I9d222iWD5NDYhBFsjtvO9yi418si1WKjtHYOIzG0xzeTIJCCrexw6h2VlRw44oiW21U9p0R10FIhE' },
    { emoji: '⚡', name: 'Energy Bars', reason: 'Quick fuel for your increased physical stamina this week.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQDuXsff1TVuExwtPvTH_MlAVXukRtlIWe9-clURTPBnhqONJ5DzS0l6WYgPcorvWlgXxBkpEtw0uKlVGryboBKOV70rP3WkGaaFcME-eZhBLX-eZVWm6eLDD1rLhreoGgVUPG2Pw7RctPmna5bGPK7SccEtUbCMlBYUT0D9NJx6MlSM5vqdaeja-_nCdhGCmIIm5qBTA_FwpNZH_4O5LzrdKFLpZ0Mo8_wSlXYP4i6ZpZOFyOuIKqlfMOLG6mSMGf0EBZDPnnwS0' }
  ],
  ovulation: [
    { emoji: '🥥', name: 'Coconut Water', reason: 'Extra hydration for your peak estrogen and physical activity.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_hkzB_rRFEm91qUiJkf8SWmHui5jrNiXNiJt3JP1wgFauYM3vxKrYRWQMC9QFmwep7GauUqmaNUsEhVUbSVp6TspO8kFhEgqFCvZjk60nD3KbZKdUmGG62cHekbUu0tqN4Bbr0Rklo0t4lPvsuDk3TlrgSAJX-z4VIV3NmqIR6F_A7qdTNOTfrKUjWIhGiuwCenMooFeth6M5Sk9SUYZXt_ooESlo7pGW1jkjJw2dTJ0LkXKTlYTi6N89FDPPiukaykoN-27sEXE' },
    { emoji: '🥗', name: 'Light Salad Ingredients', reason: 'Easy to digest nutrients while your energy is naturally high.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGdQayts7veFg_pFNdijQd7q-wdkG63cDeL5mpT8kX55lNyqve04e2BaY_w5GDyNMQmLxJC6e7-_ANI4M4vJQR1o6qIWjovPjJoYes3imOh4QvZLjcwjzct1eFKv9DjArkff_6Pm9SM2S0emO9ts8ZDssKLlkctmhZHrEDBTbszL-2yLAP25TaoY0jJIJdr50A1KtjPPZIBD-_ao8nARra4nd40D9LhZDTdUpxIQccPTf_vMfeJDOOALduW2_XWnQu9D2bGby67mA' },
    { emoji: '🫧', name: 'Sparkling Water', reason: 'A refreshing, bubbly lift for your most social phase.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQDuXsff1TVuExwtPvTH_MlAVXukRtlIWe9-clURTPBnhqONJ5DzS0l6WYgPcorvWlgXxBkpEtw0uKlVGryboBKOV70rP3WkGaaFcME-eZhBLX-eZVWm6eLDD1rLhreoGgVUPG2Pw7RctPmna5bGPK7SccEtUbCMlBYUT0D9NJx6MlSM5vqdaeja-_nCdhGCmIIm5qBTA_FwpNZH_4O5LzrdKFLpZ0Mo8_wSlXYP4i6ZpZOFyOuIKqlfMOLG6mSMGf0EBZDPnnwS0' },
    { emoji: '🥤', name: 'Fresh Juice', reason: 'Vibrant antioxidants to support your peak hormonal phase.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIS8cR1-RzqDp6ULRoxBWYgwiqWRgxxKM_m-APEmKHQuRcHq8kOr3EMzE2wJlR3v6VluLGq5n7Qb67dF-SsD1utX1WBzCQyTeJD6lPHhoA-68yNVgrS_5YRkfQ_m1ZJs-h9fE281gZMjrmHvv6KY7vDOHIMbwU7MBEZIcNTX23A0d3x82tzPpj9DHKG_wG3I9d222iWD5NDYhBFsjtvO9yi418si1WKjtHYOIzG0xzeTIJCCrexw6h2VlRw44oiW21U9p0R10FIhE' }
  ],
  luteal: [
    { emoji: '🍫', name: 'Dark Chocolate', reason: 'Boosts serotonin to combat those pre-menstrual mood dips.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQDuXsff1TVuExwtPvTH_MlAVXukRtlIWe9-clURTPBnhqONJ5DzS0l6WYgPcorvWlgXxBkpEtw0uKlVGryboBKOV70rP3WkGaaFcME-eZhBLX-eZVWm6eLDD1rLhreoGgVUPG2Pw7RctPmna5bGPK7SccEtUbCMlBYUT0D9NJx6MlSM5vqdaeja-_nCdhGCmIIm5qBTA_FwpNZH_4O5LzrdKFLpZ0Mo8_wSlXYP4i6ZpZOFyOuIKqlfMOLG6mSMGf0EBZDPnnwS0' },
    { emoji: '💊', name: 'Magnesium Supplements', reason: 'Helps calm the nervous system and prevents incoming cramps.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_hkzB_rRFEm91qUiJkf8SWmHui5jrNiXNiJt3JP1wgFauYM3vxKrYRWQMC9QFmwep7GauUqmaNUsEhVUbSVp6TspO8kFhEgqFCvZjk60nD3KbZKdUmGG62cHekbUu0tqN4Bbr0Rklo0t4lPvsuDk3TlrgSAJX-z4VIV3NmqIR6F_A7qdTNOTfrKUjWIhGiuwCenMooFeth6M5Sk9SUYZXt_ooESlo7pGW1jkjJw2dTJ0LkXKTlYTi6N89FDPPiukaykoN-27sEXE' },
    { emoji: '🧀', name: 'Comfort Snacks', reason: "Your metabolism is higher right now; it's okay to eat more.", image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGdQayts7veFg_pFNdijQd7q-wdkG63cDeL5mpT8kX55lNyqve04e2BaY_w5GDyNMQmLxJC6e7-_ANI4M4vJQR1o6qIWjovPjJoYes3imOh4QvZLjcwjzct1eFKv9DjArkff_6Pm9SM2S0emO9ts8ZDssKLlkctmhZHrEDBTbszL-2yLAP25TaoY0jJIJdr50A1KtjPPZIBD-_ao8nARra4nd40D9LhZDTdUpxIQccPTf_vMfeJDOOALduW2_XWnQu9D2bGby67mA' },
    { emoji: '🌼', name: 'Chamomile Tea', reason: 'Gently soothes anxiety and helps you wind down for rest.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIS8cR1-RzqDp6ULRoxBWYgwiqWRgxxKM_m-APEmKHQuRcHq8kOr3EMzE2wJlR3v6VluLGq5n7Qb67dF-SsD1utX1WBzCQyTeJD6lPHhoA-68yNVgrS_5YRkfQ_m1ZJs-h9fE281gZMjrmHvv6KY7vDOHIMbwU7MBEZIcNTX23A0d3x82tzPpj9DHKG_wG3I9d222iWD5NDYhBFsjtvO9yi418si1WKjtHYOIzG0xzeTIJCCrexw6h2VlRw44oiW21U9p0R10FIhE' }
  ]
};

interface CravePantrySectionProps {
  currentPhase: string;
}

export default function CravePantrySection({ currentPhase }: CravePantrySectionProps) {
  const [userTz, setUserTz] = useState('');
  
  useEffect(() => {
    try {
      setUserTz(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    } catch (e) {
      console.warn("Timezone detection failed");
    }
  }, []);

  const phaseKey = (currentPhase === 'menstrual' || currentPhase === 'follicular' || currentPhase === 'ovulation' || currentPhase === 'luteal') ? currentPhase : 'luteal';
  const products = pantryData[phaseKey];

  return (
    <div className="mt-12 mb-8 bg-gradient-to-br from-[#fcf9f8] to-[#f6f3f2] p-8 rounded-[32px] border border-[#cbc3d7]/30 shadow-[0_8px_30px_rgba(107,79,160,0.04)]">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-[#1c1b1b] mb-2">Crave Pantry 🍫</h2>
        <p className="font-sans text-lg text-[#7b7486]">Your body is asking for something. We know what.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {products.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[20px] shadow-[0_4px_20px_rgba(107,79,160,0.06)] border border-[#e5e2e1]/50 hover:shadow-[0_8px_30px_rgba(107,79,160,0.12)] transition-all duration-300 flex flex-col h-full">
            <div className="text-4xl mb-4">{item.emoji}</div>
            <h3 className="font-bold text-xl text-[#1c1b1b] mb-2">{item.name}</h3>
            <p className="font-sans text-sm text-[#7b7486] italic mb-6 flex-grow">{item.reason}</p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {getDeliveryApps(item.name, userTz).map((app, appIdx) => (
                <a key={appIdx} href={app.url} target="_blank" rel="noopener noreferrer" className={`flex-1 min-w-[70px] text-center ${app.bgColor} ${app.hoverBgColor} ${app.textColor} text-xs font-bold py-2 px-3 rounded-full transition-colors`}>
                  {app.name}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
