export type DeliveryApp = { name: string; url: string; bgColor: string; textColor: string; hoverBgColor: string };

export function getDeliveryApps(productName: string, tz: string): DeliveryApp[] {
  const p = encodeURIComponent(productName);
  
  if (!tz) {
    return []; // Return empty if not yet loaded
  }
  
  if (tz === 'Asia/Kolkata') {
    return [
      { name: 'Blinkit 🟡', url: `https://blinkit.com/s/?q=${p}`, bgColor: 'bg-[#ffe24c]', textColor: 'text-[#211b00]', hoverBgColor: 'hover:bg-[#e2c62d]' },
      { name: 'Zepto 🟣', url: `https://www.zeptonow.com/search?query=${p}`, bgColor: 'bg-[#e9ddff]', textColor: 'text-[#23005c]', hoverBgColor: 'hover:bg-[#d0bcff]' },
      { name: 'Swiggy 🟠', url: `https://www.swiggy.com/search?query=${p}`, bgColor: 'bg-[#FFE4CC]', textColor: 'text-[#6b3800]', hoverBgColor: 'hover:bg-[#FFD0A6]' }
    ];
  }
  if (tz.startsWith('America/')) {
    return [
      { name: 'DoorDash 🔴', url: `https://www.doordash.com/search/store/${p}`, bgColor: 'bg-[#ffebee]', textColor: 'text-[#c62828]', hoverBgColor: 'hover:bg-[#ffcdd2]' },
      { name: 'Instacart 🟢', url: `https://www.instacart.com/store/s?k=${p}`, bgColor: 'bg-[#e8f5e9]', textColor: 'text-[#2e7d32]', hoverBgColor: 'hover:bg-[#c8e6c9]' },
      { name: 'Amazon Fresh 🔵', url: `https://www.amazon.com/s?k=${p}&i=amazonfresh`, bgColor: 'bg-[#e3f2fd]', textColor: 'text-[#1565c0]', hoverBgColor: 'hover:bg-[#bbdefb]' }
    ];
  }
  if (tz === 'Europe/London') {
    return [
      { name: 'Deliveroo 🩵', url: `https://deliveroo.co.uk/search?q=${p}`, bgColor: 'bg-[#e0f7fa]', textColor: 'text-[#00838f]', hoverBgColor: 'hover:bg-[#b2ebf2]' },
      { name: 'Ocado 🟣', url: `https://www.ocado.com/search?entry=${p}`, bgColor: 'bg-[#f3e5f5]', textColor: 'text-[#6a1b9a]', hoverBgColor: 'hover:bg-[#e1bee7]' },
      { name: 'Amazon Fresh UK 🔵', url: `https://www.amazon.co.uk/s?k=${p}&i=amazonfresh`, bgColor: 'bg-[#e3f2fd]', textColor: 'text-[#1565c0]', hoverBgColor: 'hover:bg-[#bbdefb]' }
    ];
  }
  if (tz.startsWith('Australia/')) {
    return [
      { name: 'Uber Eats 🖤', url: `https://www.ubereats.com/au/search?q=${p}`, bgColor: 'bg-[#eeeeee]', textColor: 'text-[#212121]', hoverBgColor: 'hover:bg-[#e0e0e0]' },
      { name: 'DoorDash AU 🔴', url: `https://www.doordash.com/en-AU/search/store/${p}`, bgColor: 'bg-[#ffebee]', textColor: 'text-[#c62828]', hoverBgColor: 'hover:bg-[#ffcdd2]' },
      { name: 'Woolworths 🟢', url: `https://www.woolworths.com.au/shop/search/products?searchTerm=${p}`, bgColor: 'bg-[#e8f5e9]', textColor: 'text-[#2e7d32]', hoverBgColor: 'hover:bg-[#c8e6c9]' }
    ];
  }
  if (tz === 'Asia/Dubai' || tz === 'Asia/Riyadh') {
    return [
      { name: 'Talabat 🟠', url: `https://www.talabat.com/uae/search/${p}`, bgColor: 'bg-[#fff3e0]', textColor: 'text-[#e65100]', hoverBgColor: 'hover:bg-[#ffe0b2]' },
      { name: 'Noon 🟡', url: `https://www.noon.com/uae-en/search/?q=${p}`, bgColor: 'bg-[#fffde7]', textColor: 'text-[#f57f17]', hoverBgColor: 'hover:bg-[#fff9c4]' },
      { name: 'Careem Now 🟢', url: `https://www.careem.com/en-ae/food/search/${p}`, bgColor: 'bg-[#e8f5e9]', textColor: 'text-[#2e7d32]', hoverBgColor: 'hover:bg-[#c8e6c9]' }
    ];
  }
  if (tz === 'Asia/Seoul') {
    return [
      { name: 'Coupang Eats 🔵', url: `https://www.coupang.com/np/search?q=${p}`, bgColor: 'bg-[#e3f2fd]', textColor: 'text-[#1565c0]', hoverBgColor: 'hover:bg-[#bbdefb]' },
      { name: 'Baemin 🩵', url: `https://www.baemin.com/search?q=${p}`, bgColor: 'bg-[#e0f7fa]', textColor: 'text-[#00838f]', hoverBgColor: 'hover:bg-[#b2ebf2]' },
      { name: 'Market Kurly 🟣', url: `https://www.kurly.com/search?sword=${p}`, bgColor: 'bg-[#f3e5f5]', textColor: 'text-[#6a1b9a]', hoverBgColor: 'hover:bg-[#e1bee7]' }
    ];
  }
  if (tz === 'Asia/Tokyo') {
    return [
      { name: 'Uber Eats Japan 🖤', url: `https://www.ubereats.com/jp/search?q=${p}`, bgColor: 'bg-[#eeeeee]', textColor: 'text-[#212121]', hoverBgColor: 'hover:bg-[#e0e0e0]' },
      { name: 'Demae-can 🔴', url: `https://demae-can.com/search/result?keyword=${p}`, bgColor: 'bg-[#ffebee]', textColor: 'text-[#c62828]', hoverBgColor: 'hover:bg-[#ffcdd2]' },
      { name: 'Amazon Japan 🔵', url: `https://www.amazon.co.jp/s?k=${p}`, bgColor: 'bg-[#e3f2fd]', textColor: 'text-[#1565c0]', hoverBgColor: 'hover:bg-[#bbdefb]' }
    ];
  }
  if (tz === 'Asia/Singapore' || tz === 'Asia/Kuala_Lumpur') {
    return [
      { name: 'GrabFood 🟢', url: `https://food.grab.com/sg/en/search?query=${p}`, bgColor: 'bg-[#e8f5e9]', textColor: 'text-[#2e7d32]', hoverBgColor: 'hover:bg-[#c8e6c9]' },
      { name: 'Foodpanda 🩷', url: `https://www.foodpanda.sg/search?q=${p}`, bgColor: 'bg-[#fce4ec]', textColor: 'text-[#c2185b]', hoverBgColor: 'hover:bg-[#f8bbd0]' },
      { name: 'RedMart 🔴', url: `https://redmart.lazada.sg/shop/?q=${p}`, bgColor: 'bg-[#ffebee]', textColor: 'text-[#c62828]', hoverBgColor: 'hover:bg-[#ffcdd2]' }
    ];
  }
  if (tz.startsWith('Europe/') && tz !== 'Europe/London') {
    return [
      { name: 'Uber Eats 🖤', url: `https://www.ubereats.com/search?q=${p}`, bgColor: 'bg-[#eeeeee]', textColor: 'text-[#212121]', hoverBgColor: 'hover:bg-[#e0e0e0]' },
      { name: 'Deliveroo 🩵', url: `https://deliveroo.co.uk/search?q=${p}`, bgColor: 'bg-[#e0f7fa]', textColor: 'text-[#00838f]', hoverBgColor: 'hover:bg-[#b2ebf2]' },
      { name: 'Gorillas/Getir 🟣', url: `https://getir.com/search?q=${p}`, bgColor: 'bg-[#f3e5f5]', textColor: 'text-[#6a1b9a]', hoverBgColor: 'hover:bg-[#e1bee7]' }
    ];
  }
  
  // Fallback
  return [
    { name: 'Amazon 🔵', url: `https://www.amazon.com/s?k=${p}`, bgColor: 'bg-[#e3f2fd]', textColor: 'text-[#1565c0]', hoverBgColor: 'hover:bg-[#bbdefb]' },
    { name: 'Google Shopping 🔴', url: `https://www.google.com/search?q=buy+${p}&tbm=shop`, bgColor: 'bg-[#ffebee]', textColor: 'text-[#c62828]', hoverBgColor: 'hover:bg-[#ffcdd2]' }
  ];
}
