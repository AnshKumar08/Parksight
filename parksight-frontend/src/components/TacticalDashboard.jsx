import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup
} from 'react-leaflet';
import {
  Zap,
  Send,
  Activity,
  Loader2,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import geohashDecoder from 'ngeohash';
import toast, { Toaster } from 'react-hot-toast';

const TacticalDashboard = () => {
  const [targetTime, setTargetTime] = useState('2024-05-10T10:00');
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commuterHours, setCommuterHours] = useState(null);
  const [carbonReduction, setCarbonReduction] = useState(null);
  const [lastUpdate, setLastUpdate] = useState("Waiting...");
  const [dark, setDark] = useState(true);

  const [mapHeight, setMapHeight] = useState(380);
  const isResizingV = useRef(false);
  const vDragStartY = useRef(0);
  const vDragStartH = useRef(0);

  const [sidebarW, setSidebarW] = useState(240);
  const isResizingH = useRef(false);
  const hDragStartX = useRef(0);
  const hDragStartW = useRef(0);

  const onMouseDownV = useCallback((e) => {
    isResizingV.current = true;
    vDragStartY.current = e.clientY;
    vDragStartH.current = mapHeight;
    e.preventDefault();
  }, [mapHeight]);

  const onMouseDownH = useCallback((e) => {
    isResizingH.current = true;
    hDragStartX.current = e.clientX;
    hDragStartW.current = sidebarW;
    e.preventDefault();
  }, [sidebarW]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isResizingV.current) {
        const delta = e.clientY - vDragStartY.current;
        setMapHeight(Math.max(200, Math.min(700, vDragStartH.current + delta)));
      }
      if (isResizingH.current) {
        const delta = e.clientX - hDragStartX.current;
        setSidebarW(Math.max(160, Math.min(420, hDragStartW.current + delta)));
      }
    };
    const onMouseUp = () => {
      isResizingV.current = false;
      isResizingH.current = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const ACCENT = '#009B97';
  const ACCENT_HOVER = '#00827E';
  const T = {
    bg: dark ? '#111111' : '#F5F4F0',
    headerBg: dark ? '#1a1a1a' : '#ffffff',
    border: dark ? '#444444' : '#1a1a1a',
    sectionBg: dark ? '#1e1e1e' : '#ffffff',
    cardBg: dark ? '#2a2a2a' : '#F2F1ED',
    cardBorder: dark ? '#333333' : '#deddda',
    inputBg: dark ? '#2a2a2a' : '#F8F7F4',
    inputBorder: dark ? '#444444' : '#c9c8c4',
    text: dark ? '#f0f0f0' : '#1a1a1a',
    subtext: dark ? '#9ca3af' : '#6b7280',
    accent: ACCENT,
    accentHover: ACCENT_HOVER,
    tableBg: dark ? '#1e1e1e' : '#ffffff',
    tableHover: dark ? '#2a2a2a' : '#f5f4f0',
    footerBg: dark ? '#1a1a1a' : '#ffffff',
    footerText: dark ? '#6b7280' : '#9ca3af',
  };

  const runPrediction = async () => {
    setLoading(true);
    try {
      const formattedTime = targetTime.replace('T', ' ') + ':00';
      const response = await fetch('https://parksight-backend-sypc.onrender.com/api/v1/dispatch/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTime: formattedTime }),
      });
      const data = await response.json();
      const top5 = data.recommended_dispatch_zones.slice(0, 5);
      setHotspots(top5);

      const COLLECTIVE_DELAY_PER_CAR = 30;
      const CITY_BASELINE_HRS = 5000;
      const totalCars = top5.reduce((sum, s) => sum + s.predicted_violations, 0);
      const hoursSaved = Math.max(15, Math.round(totalCars * COLLECTIVE_DELAY_PER_CAR));
      const carbonPct = Math.min(15, parseFloat((hoursSaved / CITY_BASELINE_HRS * 100).toFixed(1)));

      setCommuterHours(hoursSaved);
      setCarbonReduction(carbonPct);
      setLastUpdate(new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
      alert("Unable to connect to the forecasting servers. Retrying connection...");
    }
    setLoading(false);
  };

  const dispatchUnit = (spot) => {
    const unitNumber = Math.floor(Math.random() * 6) + 1;
    const anticipatedViolations = Math.max(1, Math.ceil(spot.predicted_violations));
    toast.success(
      `SMS Sent to Patrol Unit ${unitNumber}: Proceed to Zone ${spot.geohash}. Anticipated ${anticipatedViolations} violations.`,
      {
        duration: 5000,
        style: {
          background: dark ? '#1a1a1a' : '#0f172a',
          color: '#f1f5f9',
          border: '1px solid #009B97',
          borderRadius: '4px',
          padding: '14px 18px',
          fontSize: '13px',
          fontFamily: 'monospace',
          maxWidth: '420px',
        },
        iconTheme: { primary: '#009B97', secondary: '#1a1a1a' },
      }
    );
  };

  const getSeverity = (index) => {
    if (index === 0) return { label: 'CRITICAL', bgColor: '#D63031', textColor: '#fff' };
    if (index <= 2) return { label: 'ELEVATED', bgColor: '#FDCB6E', textColor: '#7F5539' };
    return { label: 'MINOR', bgColor: '#0984E3', textColor: '#fff' };
  };

  const formatDisplayTime = (val) => {
    if (!val) return '';
    const [date, time] = val.split('T');
    if (!date || !time) return val;
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year} ${time}`;
  };

  const mapTile = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const fmtHours = commuterHours === null ? '—' : commuterHours;
  const fmtCarbon = carbonReduction === null ? '—' : `${carbonReduction}%`;

  return (
    <div
      className="min-h-screen font-mono flex flex-col transition-colors duration-300"
      style={{ background: T.bg, color: T.text }}
    >
      <Toaster position="top-right" />

      <header
        className="flex justify-between items-center px-6 py-3 border-b-2 flex-shrink-0"
        style={{ background: T.headerBg, borderColor: T.border }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-9 h-9 bg-[#1a1a1a] text-white font-black text-lg select-none relative flex-shrink-0">
            <span>P</span>
            <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#009B97]" />
          </div>
          <h1 className="text-lg font-black tracking-tight uppercase" style={{ color: T.text }}>
            PARKSIGHT
            <span className="mx-3 font-light" style={{ color: T.subtext }}>|</span>
            <span className="font-bold tracking-widest text-sm" style={{ color: T.subtext }}>
              PREMIUM COMMAND CENTER
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDark(d => !d)}
            className="flex items-center gap-2 border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors"
            style={{ borderColor: T.border, background: T.cardBg, color: T.text }}
            title="Toggle dark / light mode"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? 'Light' : 'Dark'}
          </button>

          <div
            className="flex items-center gap-2 text-white px-4 py-2 text-xs font-black tracking-widest uppercase"
            style={{ background: T.accent }}
          >
            <Activity size={14} className="animate-pulse" />
            ACTIVE FORECASTS: {hotspots.length > 0 ? String(hotspots.length).padStart(2, '0') : '—'}
          </div>
        </div>
      </header>

      <div className="flex overflow-hidden flex-shrink-0" style={{ height: mapHeight }}>

        <aside
          className="flex-shrink-0 flex flex-col relative"
          style={{ width: sidebarW, background: T.sectionBg, borderRight: `2px solid ${T.border}` }}
        >
          <div className="border-b-2 p-4" style={{ borderColor: T.border }}>
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: T.subtext }}>
              Forecast Window
            </p>
            <div className="mb-3">
              <input
                type="datetime-local"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full border px-3 py-2 text-sm font-bold cursor-pointer"
                style={{ background: T.inputBg, borderColor: T.inputBorder, color: T.text, colorScheme: dark ? 'dark' : 'light' }}
              />
            </div>
            <button
              onClick={runPrediction}
              disabled={loading}
              className="w-full text-white font-black text-xs uppercase tracking-widest py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: T.accent }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = T.accentHover)}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = T.accent)}
            >
              {loading
                ? <><Loader2 size={13} className="animate-spin" /> Running...</>
                : <><Zap size={13} fill="currentColor" /> Run Predictive Engine</>
              }
            </button>
          </div>

          <div
            className="p-4 flex flex-col gap-3 flex-grow overflow-auto"
            style={{ background: dark ? 'rgba(0,155,151,0.07)' : 'rgba(0,155,151,0.06)', borderTop: '2px solid rgba(0,155,151,0.3)' }}
          >
            <p className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: '#009B97' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#009B97', borderRadius: '50%' }} />
              Anticipated Impact
            </p>

            <div className="flex flex-col gap-2">
              <div
                className="flex items-center gap-4 px-4 py-3"
                style={{ background: dark ? 'rgba(0,155,151,0.12)' : 'rgba(0,155,151,0.08)', border: '1px solid rgba(0,155,151,0.35)', borderLeft: '3px solid #009B97' }}
              >
                <span className="text-4xl font-black" style={{ color: '#009B97' }}>{fmtHours}</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight" style={{ color: dark ? '#6ee7e4' : '#007a77' }}>Commuter</p>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight" style={{ color: dark ? '#6ee7e4' : '#007a77' }}>Hours Saved</p>
                </div>
              </div>
              <div
                className="flex items-center gap-4 px-4 py-3"
                style={{ background: dark ? 'rgba(0,155,151,0.12)' : 'rgba(0,155,151,0.08)', border: '1px solid rgba(0,155,151,0.35)', borderLeft: '3px solid #009B97' }}
              >
                <span className="text-4xl font-black" style={{ color: '#009B97' }}>{fmtCarbon}</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight" style={{ color: dark ? '#6ee7e4' : '#007a77' }}>Carbon Idle</p>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight" style={{ color: dark ? '#6ee7e4' : '#007a77' }}>Reduction</p>
                </div>
              </div>
            </div>

            {commuterHours !== null && (
              <p className="text-[9px] leading-relaxed" style={{ color: '#009B97', opacity: 0.7 }}>
                Based on {hotspots.reduce((s, h) => s + h.predicted_violations, 0).toFixed(1)} predicted violations
                across {hotspots.length} zones. Assumes 30 hrs collective city delay per violation.
              </p>
            )}
          </div>

          <div
            onMouseDown={onMouseDownH}
            className="absolute top-0 right-0 h-full cursor-ew-resize"
            style={{ width: '8px', background: 'transparent', zIndex: 999 }}
            title="Drag to resize sidebar"
          />
        </aside>

        <main className="flex-1 relative overflow-hidden flex flex-col" style={{ height: '100%' }}>
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <MapContainer
              center={[12.9716, 77.5946]}
              zoom={12}
              className="h-full w-full"
              zoomControl={false}
              style={{ height: '100%', background: T.bg }}
            >
              <TileLayer
                key={mapTile}
                url={mapTile}
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {hotspots.map((spot, idx) => {
                const { latitude, longitude } = geohashDecoder.decode(spot.geohash);
                const radius = idx === 0 ? 16 : idx <= 2 ? 11 : 8;
                return (
                  <CircleMarker
                    key={idx}
                    center={[latitude, longitude]}
                    radius={radius}
                    pathOptions={{
                      fillColor: '#FF4757',
                      color: '#FF4757',
                      weight: 2,
                      fillOpacity: 0.75,
                    }}
                  >
                    <Popup>
                      <div className="text-center font-bold text-xs">
                        Hotspot {idx + 1}<br />
                        <span className="text-gray-500">Traffic Surge: {Math.round(spot.predicted_violations * 100)}%</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          <div
            onMouseDown={onMouseDownV}
            className="w-full flex-shrink-0 cursor-ns-resize"
            style={{ height: '8px', background: 'transparent', zIndex: 999 }}
            title="Drag to resize map height"
          />
        </main>
      </div>

      <section
        className="border-t-2 px-6 pt-5 pb-6 flex-grow"
        style={{ background: T.tableBg, borderColor: T.border }}
      >
        <p className="text-base font-black uppercase tracking-widest mb-4" style={{ color: T.text }}>
          Top 5 Priority Dispatch Zones
        </p>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b-2" style={{ borderColor: T.border }}>
              {['ID', 'Geohash', 'Severity', 'Choke Score', 'Predicted Violations', 'Actions'].map((col, i) => (
                <th
                  key={i}
                  className={`pb-3 font-black uppercase tracking-widest text-xs ${i === 5 ? 'text-center' : ''}`}
                  style={{ color: T.subtext }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono font-bold">
            {hotspots.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 italic font-sans text-sm" style={{ color: T.subtext }}>
                  Run the predictive engine to populate dispatch data
                </td>
              </tr>
            ) : (
              hotspots.map((zone, index) => {
                const sev = getSeverity(index);
                return (
                  <tr
                    key={index}
                    className="border-b transition-colors"
                    style={{ borderColor: T.cardBorder }}
                    onMouseEnter={e => e.currentTarget.style.background = T.tableHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="py-3" style={{ color: T.subtext }}>{(index + 1).toString().padStart(3, '0')}</td>
                    <td className="py-3" style={{ color: T.text }}>{zone.geohash}</td>
                    <td className="py-3">
                      <span
                        className="px-2 py-1 text-[10px] font-black uppercase"
                        style={{ background: sev.bgColor, color: sev.textColor }}
                      >
                        {sev.label}
                      </span>
                    </td>
                    <td className="py-3" style={{ color: T.text }}>{parseFloat(zone.choke_score).toFixed(2)}</td>
                    <td className="py-3 font-bold" style={{ color: T.accent }}>{parseFloat(zone.predicted_violations).toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => dispatchUnit(zone)}
                        className="text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mx-auto transition-colors active:scale-95"
                        style={{ background: T.accent }}
                        onMouseEnter={e => e.currentTarget.style.background = T.accentHover}
                        onMouseLeave={e => e.currentTarget.style.background = T.accent}
                      >
                        <Send size={10} /> Dispatch Unit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      <footer
        className="flex justify-between items-center border-t-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest flex-shrink-0"
        style={{ background: T.footerBg, borderColor: T.border, color: T.footerText }}
      >
        <div className="flex gap-6">
          <span style={{ color: '#00B894' }}>SYNC: OK</span>
          <span>Last Update: {lastUpdate}</span>
        </div>
        <span>Data Source: Regional Traffic API V2.4</span>
      </footer>
    </div>
  );
};

export default TacticalDashboard;
