import React from 'react';
import { MapPin, AlertCircle, Car, Navigation, CheckCircle2 } from 'lucide-react';

const ParkingCard = ({ zone }) => {
  const percentage = zone.occupancyPercentage || 0;
  const threshold = zone.thresholdPercentage || 90;
  const available = zone.availableSlots || 0;
  const isFull = percentage >= threshold;

  
  const handleNavigationClick = () => {
    const lat = zone.latitude;
    const lng = zone.longitude;

    if (lat && lng && lat !== "0" && lng !== "0") {
      
      const mapUrl = `https://www.google.com/maps/@${lat},${lng},18z`;
      window.open(mapUrl, "_blank");
    } else {
      alert(`Navigation coordinates not available for ${zone.name}.`);
    }
  };

  // UI status config
  const getStatusConfig = (pct, thresh) => {
    if (pct >= thresh)
      return {
        status: "Full",
        color: "text-rose-600",
        bg: "bg-rose-50",
        accent: "bg-rose-500",
        icon: <AlertCircle className="w-4 h-4" />,
        button: "hover:bg-rose-50 text-rose-600"
      };

    if (pct >= 70)
      return {
        status: "Busy",
        color: "text-amber-600",
        bg: "bg-amber-50",
        accent: "bg-amber-500",
        icon: <Car className="w-4 h-4" />,
        button: "hover:bg-amber-50 text-amber-600"
      };

    return {
      status: "Available",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "bg-emerald-500",
      icon: <CheckCircle2 className="w-4 h-4" />,
      button: "hover:bg-emerald-50 text-emerald-600"
    };
  };

  const config = getStatusConfig(percentage, threshold);

  return (
    <div className="
      group relative bg-gradient-to-br from-slate-50 to-white 
      rounded-3xl shadow-lg hover:shadow-2xl 
      transition-all duration-500 overflow-hidden 
      border-2 border-slate-200/60 hover:border-blue-300
    ">
      {/* Accent top bar */}
      <div className={`absolute top-0 left-0 w-full h-2 ${config.accent} opacity-80`} />

      <div className="p-7">

        {/* Header */}
        <div className="flex justify-between items-start mb-7">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight">
              {zone.name}
            </h3>

            <div className="flex items-center mt-2 text-slate-600">
              <MapPin className="w-4 h-4 mr-2 opacity-70" />
              <p className="text-sm font-semibold truncate max-w-[180px]">{zone.location}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm ${config.bg} ${config.color}`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${config.accent}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.accent}`}></span>
            </span>
            {config.status}
          </div>
        </div>

        {/* Main Stats */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Car className="w-3.5 h-3.5" />
              Open Spaces
            </p>

            <div className="flex items-baseline gap-2">
              <span className={`text-6xl font-black tracking-tighter ${available > 0 ? config.color : "text-slate-400"}`}>
                {available}
              </span>
              <span className="text-slate-500 font-bold text-xl">/ {zone.totalSlots}</span>
            </div>
          </div>

          {/* Navigation Button (works now) */}
          <button
            onClick={handleNavigationClick}
            className={`
              p-4 rounded-2xl bg-white shadow-md 
              transition-all duration-300 
              group-hover:scale-110 group-hover:rotate-12 
              border-2 border-slate-100 ${config.button}
            `}
            aria-label={`Navigate to ${zone.name}`}
          >
            <Navigation className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
            <span>Capacity</span>
            <span className={config.color}>{percentage}%</span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full ${config.accent} transition-all duration-700 ease-out shadow-lg`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Warning */}
        {isFull && (
          <div className="
            mt-5 flex items-start gap-3 text-sm text-rose-700 
            bg-gradient-to-r from-rose-50 to-rose-100 
            p-4 rounded-2xl font-bold border border-rose-200
            animate-in fade-in slide-in-from-top-2
          ">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>This zone is at full capacity. Try nearby locations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingCard;
