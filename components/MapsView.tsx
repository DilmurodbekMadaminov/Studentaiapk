import React, { useState, useEffect } from 'react';
import { getMapsResponse } from '../services/geminiService';
import { 
  MapPin, Search, Loader2, Navigation, ExternalLink, Compass, 
  Map, ThumbsUp, GraduationCap, Coffee, Library, Milestone, Route
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';

interface SuggestedSpot {
  name: string;
  category: 'university' | 'library' | 'cafe' | 'workspace';
  lat: number;
  lng: number;
  address: string;
  rating: number;
}

export const MapsView: React.FC = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [links, setLinks] = useState<{ uri: string; title: string }[]>([]);
  
  // Yandex Map location states (Default Tashkent coordinates: lat 41.3082, lng 69.2518)
  const [mapLat, setMapLat] = useState<number>(41.3082);
  const [mapLng, setMapLng] = useState<number>(69.2518);
  const [embedText, setEmbedText] = useState<string>('Tashkent');
  const [selectedSpot, setSelectedSpot] = useState<SuggestedSpot | null>(null);

  // Dynamic Route planner
  const [startPoint, setStartPoint] = useState('Sizning manzilingiz (MFA)');
  const [endPoint, setEndPoint] = useState('O\'zbekiston Milliy Kutubxonasi');
  const [calculatedRoute, setCalculatedRoute] = useState<{
    distance: string;
    duration: string;
    traffic: string;
    steps: string[];
  } | null>(null);

  const suggestedSpots: SuggestedSpot[] = [
    { name: "Alisher Navoiy Milliy Kutubxonasi", category: "library", lat: 41.3168, lng: 69.2721, address: "Tashkent, Navoiy ko'chasi, 1", rating: 4.9 },
    { name: "O'zbekiston Milliy Universiteti", category: "university", lat: 41.3533, lng: 69.2144, address: "Tashkent, Universitet ko'chasi, 4", rating: 4.8 },
    { name: "GroundZero Co-working", category: "workspace", lat: 41.3212, lng: 69.2811, address: "Tashkent, Yunusobod tumani", rating: 4.7 },
    { name: "Book Cafe Tashkent", category: "cafe", lat: 41.2995, lng: 69.2601, address: "Shota Rustaveli k., 12", rating: 4.6 }
  ];

  const handleSearch = async (overrideQuery?: string) => {
    const activeQuery = overrideQuery || query;
    if (!activeQuery.trim()) return;
    setLoading(true);
    setResult(null);
    setLinks([]);

    try {
      let lat = mapLat;
      let lng = mapLng;

      // Request live location coordinates
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej)
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        setMapLat(lat);
        setMapLng(lng);
      } catch (e) {
        console.warn("Location access denied, falling back to cached lat/lng");
      }

      setEmbedText(activeQuery);
      const res = await getMapsResponse(activeQuery, lat, lng);
      setResult(res.text);

      if (res.grounding) {
        const groundingLinks: { uri: string; title: string }[] = [];
        res.grounding.forEach((c: any) => {
          if (c.maps) {
            groundingLinks.push({ uri: c.maps.uri, title: c.maps.title });
          }
        });
        setLinks(groundingLinks);
      }
    } catch (e) {
      console.error(e);
      setResult("Ma'lumot topilmadi. Qidiruv so'rovini aniqroq kiritib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpot = (spot: SuggestedSpot) => {
    setSelectedSpot(spot);
    setMapLat(spot.lat);
    setMapLng(spot.lng);
    setEmbedText(spot.name);
    setEndPoint(spot.name);
    
    // Simulate smart Yandex-style AI Router duration calculates
    setCalculatedRoute({
      distance: (Math.random() * 8 + 1.2).toFixed(1) + " km",
      duration: Math.floor(Math.random() * 20 + 8) + " daqiqa",
      traffic: ["O'rtacha", "Kam tirband", "Yengil harakat", "Tirbandlik yo'q"][Math.floor(Math.random() * 4)],
      steps: [
        "A10 burchak bo'ylab shimoli-g'arbga harakatlaning",
        "Yandex Maps tavsiyasiga ko'ra o'ngga buriling",
        "Maqsadli o'quv darsgohi / kutubxona o'ng tomonda joylashgan"
      ]
    });
  };

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(embedText)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Golden Branding Header matching Yandex AI maps feel */}
      <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-slate-900/5 p-8 md:p-12 rounded-[2.5rem] border border-amber-500/20 relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-500 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-600/10">
            <Compass className="animate-pulse" size={14} /> Yandex Maps AI Pro-Engine
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Smart <span className="text-amber-500 italic">Darsgoh</span> Xaritasi
          </h2>
          <p className="text-slate-500 font-medium text-xs md:text-sm max-w-xl">
            Universitetlar, tinch kovorkinglar, davlat kutubxonalari va eng yaxshi dars qilish kafelari yo'nalishlarini Yandex AI texnologiyalarida tahlil qiling.
          </p>
        </div>
      </div>

      {/* Main Interactive Map & Search area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Map Interactive Canvas Frame (8 Cols) */}
         <div className="lg:col-span-8 space-y-6">
            <div className="relative group bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-slate-100">
               <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors z-10">
                 <Search size={22} />
               </div>
               <input 
                 type="text"
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                 placeholder="Kovorking, kutubxona yoki universitetlarni qidiring..."
                 className="w-full pl-16 pr-44 py-6 rounded-[2.5rem] bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none text-base md:text-lg font-bold transition-all relative z-0"
               />
               <button 
                 onClick={() => handleSearch()}
                 disabled={loading || !query.trim()}
                 className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-8 py-3.5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-md transition-all disabled:opacity-50 z-10"
               >
                 {loading ? <Loader2 className="animate-spin" size={18} /> : "Qidirish"}
               </button>
            </div>

            {/* Simulated Live Frame Viewer */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-150 shadow-sm overflow-hidden space-y-4">
               <div className="w-full h-[400px] rounded-[1.8rem] bg-slate-50 relative overflow-hidden border border-slate-100 shadow-inner">
                  <iframe 
                    src={mapEmbedUrl}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy"
                    title="Yandex API Live Hotspots"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 z-0"
                  />
               </div>
               
               {/* Quick Info Bar */}
               <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Map size={14} className="text-amber-500" /> Markaziy koordinatalar: {mapLat.toFixed(4)}, {mapLng.toFixed(4)}</span>
                  <span>Google/Yandex Map integratsiyasi faol</span>
               </div>
            </div>

            {/* AI Analytical Insights */}
            {result && (
               <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl space-y-3">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-1">
                     <GraduationCap size={14} /> AI O'qituvchi Yo'llanmalari
                  </span>
                  <div className="prose prose-invert max-w-none text-sm text-slate-300 font-medium leading-relaxed">
                     <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
               </div>
            )}
         </div>

         {/* Suggested Spot Directories & Route planner (4 Cols) */}
         <div className="lg:col-span-4 space-y-6">
            
            {/* Suggestedspots bento card */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
               <div>
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Tavsiya etilgan darsgohlar</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Sizga yaqin bo'lgan darslik nuqtalarini bitta kran orqali xaritada ko'ring.</p>
               </div>
               
               <div className="space-y-2.5">
                  {suggestedSpots.map((spot, i) => (
                     <div 
                       key={i}
                       onClick={() => handleSelectSpot(spot)}
                       className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-start ${selectedSpot?.name === spot.name ? 'border-amber-500 bg-amber-50/20' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-100'}`}
                     >
                        <div className="flex gap-2.5 items-start">
                           <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-amber-600">
                              {spot.category === 'library' && <Library size={16} />}
                              {spot.category === 'university' && <GraduationCap size={16} />}
                              {spot.category === 'cafe' && <Coffee size={16} />}
                              {spot.category === 'workspace' && <Milestone size={16} />}
                           </div>
                           <div>
                              <h4 className="font-bold text-xs text-slate-800 leading-tight">{spot.name}</h4>
                              <p className="text-[9px] text-slate-400 mt-0.5 leading-none">{spot.address}</p>
                           </div>
                        </div>
                        <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-md shrink-0">★ {spot.rating}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* AI Route Optimizer */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
               <div className="flex gap-2 items-center text-slate-800">
                  <Route size={18} className="text-amber-500" />
                  <h3 className="font-black text-xs uppercase tracking-widest leading-none">AI Yo'nalish Optimal hisoboti</h3>
               </div>
               
               <div className="space-y-3">
                  <div className="space-y-2">
                     <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Boshlang'ich nuqta</span>
                        <input 
                          type="text" 
                          value={startPoint} 
                          onChange={(e) => setStartPoint(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 text-xs px-3 py-2 rounded-xl mt-1 outline-none font-medium" 
                        />
                     </div>
                     <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Maqsad (Kutubxona / Kafe)</span>
                        <input 
                          type="text" 
                          value={endPoint} 
                          onChange={(e) => setEndPoint(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 text-xs px-3 py-2 rounded-xl mt-1 outline-none font-medium" 
                        />
                     </div>
                  </div>

                  {calculatedRoute ? (
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 mt-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                           <div className="p-1 bg-white rounded-lg shadow-sm border border-slate-100">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Masofa</span>
                              <span className="text-xs font-black text-slate-800 leading-none">{calculatedRoute.distance}</span>
                           </div>
                           <div className="p-1 bg-white rounded-lg shadow-sm border border-slate-100">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Vaqt</span>
                              <span className="text-xs font-black text-amber-600 leading-none">{calculatedRoute.duration}</span>
                           </div>
                           <div className="p-1 bg-white rounded-lg shadow-sm border border-slate-100">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Tirbandlik</span>
                              <span className="text-xs font-bold text-slate-700 leading-none">{calculatedRoute.traffic}</span>
                           </div>
                        </div>

                        <div className="space-y-1 pt-1">
                           <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Yandex AI yo'llanma qadamlari</span>
                           {calculatedRoute.steps.map((st, sIdx) => (
                              <p key={sIdx} className="text-[10px] text-slate-500 font-medium leading-normal flex gap-1.5"><span className="text-amber-500 font-black">✓</span> {st}</p>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Hisoblash uchun yuqoridagi ro'yxatdan bitta darsgohni tanlang.
                     </p>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
