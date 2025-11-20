import React from 'react';
import { Car, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total (Last Hour)',
      value: stats.total || 0,
      icon: Car,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Allowed',
      value: stats.allowed || 0,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Warned',
      value: stats.warned || 0,
      icon: AlertTriangle,
      gradient: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Ignored',
      value: stats.ignored || 0,
      icon: XCircle,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.gradient} p-6 rounded-xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm opacity-90 mb-1">{card.title}</p>
                <p className="text-4xl font-bold">{card.value}</p>
              </div>
              <div className={`${card.iconBg} p-3 rounded-lg`}>
                <Icon className={`w-8 h-8 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;




// import React from 'react';
// import { Car, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

// const StatsCards = ({ stats = { total: 0, allowed: 0, warned: 0, ignored: 0 } }) => {
//   const cards = [
//     {
//       title: 'Total Vehicles',
//       value: stats.total || 0,
//       icon: Car,
//       gradient: 'from-blue-500 to-cyan-500',
//       iconBg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
//       iconColor: 'text-blue-600',
//       shadowColor: 'shadow-blue-500/10',
//     },
//     {
//       title: 'Allowed Entry',
//       value: stats.allowed || 0,
//       icon: CheckCircle,
//       gradient: 'from-green-500 to-emerald-500',
//       iconBg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
//       iconColor: 'text-green-600',
//       shadowColor: 'shadow-green-500/10',
//     },
//     {
//       title: 'Warnings Issued',
//       value: stats.warned || 0,
//       icon: AlertTriangle,
//       gradient: 'from-yellow-500 to-orange-500',
//       iconBg: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10',
//       iconColor: 'text-yellow-600',
//       shadowColor: 'shadow-yellow-500/10',
//     },
//     {
//       title: 'Denied Access',
//       value: stats.ignored || 0,
//       icon: XCircle,
//       gradient: 'from-purple-500 to-pink-500',
//       iconBg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
//       iconColor: 'text-purple-600',
//       shadowColor: 'shadow-purple-500/10',
//     }
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//       {cards.map((card, index) => {
//         const Icon = card.icon;
//         return (
//           <div
//             key={index}
//             className={`group relative bg-white rounded-xl p-4 shadow-md ${card.shadowColor} 
//                         hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
//           >
//             {/* Accent line */}
//             <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`}></div>

//             {/* Decorative background */}
//             <div className={`absolute -right-6 -top-6 w-20 h-20 bg-gradient-to-br ${card.gradient} 
//                              opacity-5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500`}></div>

//             <div className="relative">
//               {/* Header */}
//               <div className="flex items-center justify-between mb-3">
//                 <div className={`${card.iconBg} p-2.5 rounded-lg backdrop-blur-sm 
//                                 group-hover:scale-105 transition-transform duration-300`}>
//                   <Icon className={`w-5 h-5 ${card.iconColor}`} />
//                 </div>
//                 <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.gradient} animate-pulse`} />
//               </div>

//               {/* Title */}
//               <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{card.title}</p>

//               {/* Value (Smaller now) */}
//               <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
//                 {card.value}
//               </p>

//               {/* Footer */}
//               <div className="mt-3 pt-3 border-t border-gray-100">
//                 <div className="flex items-center text-[10px] text-gray-400">
//                   <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.gradient} mr-2`} />
//                   <span>Active tracking</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default StatsCards;
