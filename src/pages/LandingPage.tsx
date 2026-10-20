import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ArrowRight, 
  Database, 
  User, 
  Users, 
  FileText, 
  Bot 
} from 'lucide-react';
import { User as UserType } from '../types';

interface LandingPageProps {
  onNavigateLogin: () => void;
  isAuthenticated?: boolean;
  onOpenWorkspace?: () => void;
  onLoginSuccess?: (user: UserType, token: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  isAuthenticated = false,
  onOpenWorkspace,
}) => {
  // Opening animation timeline phase:
  // 0: 0-1s Landscape fades in
  // 1: 1-2s Mist & atmosphere move; AGENT FIREWALL header & badge slide in
  // 2: 2.0s Headline line 1: “AI can act.”
  // 3: 2.7s Headline line 2: “AI cannot decide what it is”
  // 4: 3.4s Headline line 3: “allowed to do.”
  // 5: 4.2s Pipeline animates: AI AGENT → FIREWALL → HUMAN → LEDGER & subtitle
  // 6: 5.2s Buttons appear: Explore the Demo → & Sign In →
  // 7: 6.0s Settle into living animated state
  const [timelineStep, setTimelineStep] = useState<number>(0);

  // Live firewall pulse cycle
  const [firewallState, setFirewallState] = useState<'EVALUATING' | 'ALLOW' | 'APPROVAL' | 'BLOCK'>('EVALUATING');

  useEffect(() => {
    const t0 = setTimeout(() => setTimelineStep(1), 1000); // 1.0s
    const t1 = setTimeout(() => setTimelineStep(2), 2000); // 2.0s
    const t2 = setTimeout(() => setTimelineStep(3), 2700); // 2.7s
    const t3 = setTimeout(() => setTimelineStep(4), 3400); // 3.4s
    const t4 = setTimeout(() => setTimelineStep(5), 4200); // 4.2s
    const t5 = setTimeout(() => setTimelineStep(6), 5200); // 5.2s
    const t6 = setTimeout(() => setTimelineStep(7), 6000); // 6.0s

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  // Continuous subtle evaluation cycling for the central Firewall pill
  useEffect(() => {
    const states: Array<'EVALUATING' | 'ALLOW' | 'APPROVAL' | 'BLOCK'> = [
      'EVALUATING', 'ALLOW',
      'EVALUATING', 'APPROVAL',
      'EVALUATING', 'BLOCK'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % states.length;
      setFirewallState(states[idx]);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const handleSmoothNav = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Gentle accent highlight for 1.2s
      el.classList.add('ring-2', 'ring-[#1e382b]/30', 'transition-all', 'duration-500');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#1e382b]/30');
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#1c1917] selection:bg-[#1e382b] selection:text-[#faf6f0] font-sans overflow-x-hidden relative">
      
      {/* ============================================================== */}
      {/* 1. CINEMATIC LIVE GOLDEN-HOUR PANORAMA (EXACT REFERENCE FRAME) */}
      {/* ============================================================== */}
      <div 
        className={`relative w-full overflow-hidden transition-opacity duration-1000 ${
          timelineStep >= 0 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ minHeight: '840px', height: '100vh', maxHeight: '1020px' }}
      >
        {/* Layer 1: Radiant Golden-Hour Sky & Atmosphere */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(180deg, #f7efe2 0%, #faecd5 22%, #f2e3cb 48%, #e7d8c0 78%, #dfceb5 100%)'
          }}
        />

        {/* Layer 2: Radiant Morning Sunburst on Upper-Far-Left (Scaled & Positioned) */}
        <div 
          className="absolute z-1 pointer-events-none"
          style={{
            top: '5%',
            left: '3%',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(255, 246, 214, 0.9) 18%, rgba(254, 224, 160, 0.6) 38%, rgba(252, 207, 130, 0.25) 60%, transparent 80%)',
            animation: 'sunburstPulse 7s ease-in-out infinite'
          }}
        />

        {/* Layer 3: Volumetric Sunbeams Streaming Across Scene from Left Edge */}
        <div 
          className="absolute z-1 pointer-events-none"
          style={{
            top: '-50px',
            left: '1%',
            width: '850px',
            height: '750px',
            background: 'conic-gradient(from 135deg at 12% 18%, rgba(255,248,220,0.45) 0deg, transparent 20deg, rgba(255,240,190,0.35) 40deg, transparent 55deg, rgba(255,248,220,0.3) 75deg, transparent 95deg)',
            animation: 'sunbeamBreathe 10s ease-in-out infinite'
          }}
        />

        {/* Layer 4: Distant Cumulus Clouds Drifting Across Alpine Sky */}
        <div 
          className="absolute top-10 left-0 right-0 h-48 opacity-45 pointer-events-none z-1"
          style={{
            background: 'radial-gradient(ellipse at 45% 40%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 252, 245, 0.4) 40%, transparent 75%), radial-gradient(ellipse at 82% 35%, rgba(255, 255, 255, 0.8) 0%, transparent 60%)',
            animation: 'cloudDriftSlow 32s ease-in-out infinite'
          }}
        />

        {/* Layer 5: High Alpine Snow-Capped Mountains, Lake & Architecture (1600x960 Canvas) */}
        <svg 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-2"
          viewBox="0 0 1600 960" 
          preserveAspectRatio="xMidYMid slice"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Distant Alpine Snow Ridge Gradient */}
            <linearGradient id="alpPeakDistantGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eedecf" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#dec5b2" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#cbb29c" stopOpacity="0.65" />
            </linearGradient>

            {/* Snow couloir highlights */}
            <linearGradient id="snowWhiteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f5ebe0" stopOpacity="0.7" />
            </linearGradient>

            {/* Craggy Mountain Rock Shadow Gradient */}
            <linearGradient id="rockShadowGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6c5647" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#8d7260" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#b49a84" stopOpacity="0.65" />
            </linearGradient>

            {/* Fore-mountain rolling evergreen ridges */}
            <linearGradient id="foreMountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5d5a45" stopOpacity="0.92" />
              <stop offset="50%" stopColor="#4a4d3b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#373c2e" stopOpacity="0.98" />
            </linearGradient>

            {/* Tranquil Lake Waters & Sun Reflections */}
            <linearGradient id="lakeWaterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7a968f" stopOpacity="0.88" />
              <stop offset="40%" stopColor="#67847c" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#556f67" stopOpacity="0.95" />
            </linearGradient>

            {/* Radiant Sun Glimmer Streak on Lake */}
            <linearGradient id="lakeSunStreakGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#decab3" stopOpacity="0" />
              <stop offset="35%" stopColor="#fde096" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#fff8db" stopOpacity="0.98" />
              <stop offset="65%" stopColor="#fde096" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#decab3" stopOpacity="0" />
            </linearGradient>

            {/* Classical Italian Stone Villa & Basilica Gradient */}
            <linearGradient id="basilicaStoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a38974" stopOpacity="0.98" />
              <stop offset="40%" stopColor="#8b725e" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#685241" stopOpacity="0.98" />
            </linearGradient>

            {/* Verdigris Copper Dome Gradient (Italian Turquoise) */}
            <linearGradient id="copperVerdigrisDome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3f7564" stopOpacity="0.98" />
              <stop offset="45%" stopColor="#316353" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#224d40" stopOpacity="0.98" />
            </linearGradient>

            {/* Gilded Dome Ribs & Cross */}
            <linearGradient id="goldGildGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f6d376" />
              <stop offset="100%" stopColor="#cfa043" />
            </linearGradient>

            {/* Ancient Oak Tree Trunk & Branches Gradient */}
            <linearGradient id="treeBarkGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#413023" />
              <stop offset="60%" stopColor="#2c2016" />
              <stop offset="100%" stopColor="#1e150e" />
            </linearGradient>

            {/* Backlit Golden Amber Foliage Gradient */}
            <radialGradient id="sunlitFoliageGlow" cx="20%" cy="20%" r="80%">
              <stop offset="0%" stopColor="#f8c146" stopOpacity="0.98" />
              <stop offset="40%" stopColor="#d9822b" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#a74a17" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#5e2b0c" stopOpacity="0.88" />
            </radialGradient>
          </defs>

          {/* 1. FAR DISTANT ALPINE MOUNTAIN PEAKS & SNOW COULOIRS */}
          <path 
            d="M0 450 L70 410 L150 435 L280 340 L380 375 L490 280 L620 330 L730 260 L850 340 L980 250 L1080 310 L1220 180 L1340 250 L1460 160 L1600 230 L1600 700 L0 700 Z" 
            fill="url(#alpPeakDistantGrad)" 
          />

          {/* Right Alpine Snow Massif (Towering peaks behind cathedral dome) */}
          <path 
            d="M1220 320 L1280 180 L1330 230 L1400 250 L1470 170 L1520 160 L1570 220 L1600 210 L1600 520 L1220 520 Z" 
            fill="url(#snowWhiteGrad)" 
            opacity="0.85" 
          />
          <path 
            d="M1280 180 L1305 220 L1330 230 L1355 245 L1400 250 L1430 220 L1470 170 L1495 200 L1520 160 L1555 205 L1570 220 L1600 210 V340 H1220 Z" 
            fill="url(#rockShadowGrad)" 
            opacity="0.6" 
          />

          {/* 2. MIDGROUND FORE-MOUNTAIN RIDGES & CYPRESS FORESTS */}
          <path 
            d="M0 490 C120 465 240 515 390 445 C540 380 690 460 840 405 C990 350 1140 415 1300 370 C1440 330 1520 380 1600 350 L1600 700 L0 700 Z" 
            fill="url(#foreMountainGrad)" 
          />

          {/* 3. SERENE ALPINE LAKE BASIN */}
          <rect x="0" y="580" width="1600" height="230" fill="url(#lakeWaterGrad)" />

          {/* Lake Horizon Shoreline */}
          <path d="M0 580 Q400 572 800 580 T1600 575" stroke="#4a5a54" strokeWidth="3" />
          
          {/* Radiant Sun Reflection Streak Down Center-Left of Lake */}
          <rect 
            x="480" 
            y="580" 
            width="420" 
            height="210" 
            fill="url(#lakeSunStreakGrad)" 
            opacity="0.75" 
            style={{ animation: 'waterShimmer 6s ease-in-out infinite' }}
          />
          {/* Subtle Glimmering Water Waves */}
          <path d="M490 600 Q690 608 890 600" stroke="#fff4cf" strokeWidth="2" opacity="0.8" style={{ animation: 'waterShimmer 5s ease-in-out infinite' }} />
          <path d="M520 625 Q700 635 880 625" stroke="#fff1bd" strokeWidth="2.5" opacity="0.75" style={{ animation: 'waterShimmer 6.5s ease-in-out infinite 0.5s' }} />
          <path d="M510 655 Q710 668 910 655" stroke="#ffebad" strokeWidth="2.5" opacity="0.7" style={{ animation: 'waterShimmer 7s ease-in-out infinite 1s' }} />
          <path d="M470 690 Q680 702 890 690" stroke="#fde49a" strokeWidth="3" opacity="0.65" style={{ animation: 'waterShimmer 8s ease-in-out infinite 1.5s' }} />

          {/* Distant Lakeside Italian Villa Clusters (Center-Left Shore) */}
          <g transform="translate(260, 505)">
            <rect x="0" y="35" width="48" height="28" fill="#c4aa94" />
            <polygon points="0,35 24,18 48,35" fill="#a85338" />
            <rect x="18" y="44" width="7" height="12" fill="#3b2d20" />
            <rect x="56" y="24" width="22" height="39" fill="#d2baa5" />
            <polygon points="56,24 67,10 78,24" fill="#a85338" />
            <rect x="78" y="38" width="45" height="25" fill="#be9f87" />
            <polygon points="78,38 100,22 123,38" fill="#a85338" />
            <path d="M135 60 C135 40 141 30 141 60 Z" fill="#2d382b" />
            <path d="M145 60 C145 35 152 22 152 60 Z" fill="#243022" />
            <path d="M158 60 C158 42 163 32 163 60 Z" fill="#2d382b" />
          </g>

          {/* 4. CLASSICAL ITALIAN BASILICA & PALACE (MOVED TO RIGHT EDGE FOR OPEN CENTER) */}
          <g transform="translate(1250, 205)">
            {/* Grand Verdigris Copper Dome */}
            <path d="M180 185 C180 85 270 85 270 185 Z" fill="url(#copperVerdigrisDome)" />
            {/* Dome Copper Ribs */}
            <path d="M225 85 C225 125 225 155 225 185" stroke="url(#goldGildGrad)" strokeWidth="2.5" />
            <path d="M200 95 C205 125 208 155 210 185" stroke="url(#goldGildGrad)" strokeWidth="1.5" />
            <path d="M250 95 C245 125 242 155 240 185" stroke="url(#goldGildGrad)" strokeWidth="1.5" />
            {/* Golden Lantern Cupola and Spire */}
            <rect x="220" y="55" width="10" height="30" fill="url(#basilicaStoneGrad)" />
            <circle cx="225" cy="50" r="5.5" fill="url(#goldGildGrad)" />
            <path d="M225 35 V50 M221 42 H229" stroke="url(#goldGildGrad)" strokeWidth="2" />

            {/* Circular Drum with Classical Arched Windows and Corinthian Columns */}
            <rect x="170" y="185" width="110" height="55" fill="url(#basilicaStoneGrad)" />
            <path d="M188 200 A6 6 0 0 1 200 200 V225 H188 Z" fill="#faecd5" opacity="0.85" />
            <path d="M220 200 A6 6 0 0 1 232 200 V225 H220 Z" fill="#faecd5" opacity="0.85" />
            <path d="M252 200 A6 6 0 0 1 264 200 V225 H252 Z" fill="#faecd5" opacity="0.85" />
            <rect x="180" y="185" width="4" height="55" fill="#f2e2cf" />
            <rect x="210" y="185" width="4" height="55" fill="#f2e2cf" />
            <rect x="242" y="185" width="4" height="55" fill="#f2e2cf" />
            <rect x="274" y="185" width="4" height="55" fill="#f2e2cf" />

            {/* Basilica Main Facade & Grand Arched Colonnade */}
            <rect x="140" y="240" width="170" height="110" fill="url(#basilicaStoneGrad)" />
            <polygon points="140,240 225,200 310,240" fill="url(#basilicaStoneGrad)" />
            {Array.from({ length: 6 }).map((_, i) => (
              <rect key={i} x={155 + i * 26} y={255} width="8" height="85" fill="#f6eadb" opacity="0.9" />
            ))}

            {/* Ornate Multi-Tiered Bell Tower (Campanile) */}
            <g transform="translate(300, 110)">
              <rect x="0" y="70" width="46" height="240" fill="url(#basilicaStoneGrad)" />
              <path d="M12 90 A8 8 0 0 1 28 90 V130 H12 Z" fill="#35261c" />
              <path d="M12 155 A8 8 0 0 1 28 155 V195 H12 Z" fill="#35261c" />
              <polygon points="0,70 23,20 46,70" fill="url(#copperVerdigrisDome)" />
              <circle cx="23" cy="16" r="3.5" fill="url(#goldGildGrad)" />
            </g>

            {/* Lakeside Palace Wings & Waterfront Terraces */}
            <rect x="80" y="345" width="310" height="40" fill="url(#basilicaStoneGrad)" />
            <rect x="50" y="385" width="360" height="180" fill="url(#basilicaStoneGrad)" />
            {Array.from({ length: 7 }).map((_, i) => (
              <path key={i} d={`M${80 + i * 46} 415 A12 12 0 0 1 ${104 + i * 46} 415 V465 H${80 + i * 46} Z`} fill="#372a1e" opacity="0.8" />
            ))}

            {/* Classical Promenade Stairs Leading into the Water */}
            <rect x="50" y="555" width="360" height="15" fill="#a48c77" />
            <rect x="35" y="570" width="390" height="15" fill="#8f7864" />
            <rect x="20" y="585" width="420" height="20" fill="#756150" />
          </g>

          {/* 5. FOREGROUND TERRACE & STONE BALUSTRADE (LOWER-LEFT EDGE) */}
          <g transform="translate(0, 710)">
            <rect x="20" y="40" width="380" height="18" fill="url(#basilicaStoneGrad)" />
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={i} transform={`translate(${45 + i * 28}, 58)`}>
                <rect x="0" y="0" width="10" height="42" rx="3" fill="#cfbaa7" />
                <rect x="1" y="8" width="8" height="26" rx="2" fill="#aa9381" />
              </g>
            ))}
            <rect x="20" y="100" width="380" height="24" fill="url(#basilicaStoneGrad)" />
            {/* Classical Stone Urn / Planter on Far Left Pedestal */}
            <g transform="translate(0, 10)">
              <rect x="0" y="40" width="40" height="90" fill="url(#basilicaStoneGrad)" />
              <path d="M-5 40 C-5 10 45 10 45 40 Z" fill="url(#basilicaStoneGrad)" />
              <ellipse cx="20" cy="12" rx="24" ry="10" fill="url(#basilicaStoneGrad)" />
              <path d="M-8 12 Q20 -15 48 12 Q30 30 -8 12" fill="#3d4e32" />
              <circle cx="8" cy="5" r="6" fill="#d97724" />
              <circle cx="24" cy="2" r="7" fill="#bc4749" />
              <circle cx="32" cy="10" r="5" fill="#f4a261" />
            </g>
          </g>

          {/* 6. LEFT FOREGROUND TREE: REDUCED SCALE BY ~40%, CONFINED TO FAR LEFT EDGE */}
          {/* Terminating strictly before x=300 so headline has 100% unobstructed visibility */}
          <g 
            transform="translate(-65, 30) scale(0.60)" 
            style={{ transformOrigin: '0px 200px', animation: 'branchSway 9s ease-in-out infinite' }}
          >
            {/* Gnarled Mighty Oak Trunk on Left Edge */}
            <path 
              d="M-30 960 C10 820 40 680 50 560 C58 460 75 360 85 240 C95 140 60 70 -20 0 L-60 0 L-60 960 Z" 
              fill="url(#treeBarkGrad)" 
            />
            {/* Branches Confined to Left Edge */}
            <path d="M70 380 C140 330 200 305 280 290" stroke="url(#treeBarkGrad)" strokeWidth="30" strokeLinecap="round" />
            <path d="M85 240 C160 185 240 160 340 150" stroke="url(#treeBarkGrad)" strokeWidth="24" strokeLinecap="round" />
            <path d="M50 120 C130 75 220 65 310 75" stroke="url(#treeBarkGrad)" strokeWidth="18" strokeLinecap="round" />
            <path d="M280 290 C320 330 360 355 410 365" stroke="url(#treeBarkGrad)" strokeWidth="12" strokeLinecap="round" />
            <path d="M340 150 C380 185 420 210 470 220" stroke="url(#treeBarkGrad)" strokeWidth="12" strokeLinecap="round" />

            {/* Foliage Clusters Confined to Left Canopy */}
            <ellipse cx="130" cy="180" rx="85" ry="65" fill="url(#sunlitFoliageGlow)" />
            <ellipse cx="210" cy="150" rx="90" ry="75" fill="url(#sunlitFoliageGlow)" />
            <ellipse cx="300" cy="130" rx="85" ry="70" fill="url(#sunlitFoliageGlow)" />
            <ellipse cx="390" cy="120" rx="95" ry="75" fill="url(#sunlitFoliageGlow)" />

            <ellipse cx="240" cy="230" rx="85" ry="65" fill="url(#sunlitFoliageGlow)" />
            <ellipse cx="340" cy="225" rx="80" ry="60" fill="url(#sunlitFoliageGlow)" />
            <ellipse cx="430" cy="235" rx="75" ry="60" fill="url(#sunlitFoliageGlow)" />

            <ellipse cx="160" cy="310" rx="75" ry="55" fill="url(#sunlitFoliageGlow)" />
            <ellipse cx="250" cy="330" rx="70" ry="50" fill="url(#sunlitFoliageGlow)" />

            {/* Golden Specular Highlights */}
            <circle cx="150" cy="140" r="16" fill="#ffea8a" opacity="0.9" />
            <circle cx="220" cy="120" r="20" fill="#ffd56b" opacity="0.9" />
            <circle cx="310" cy="100" r="18" fill="#ffc857" opacity="0.9" />
            <circle cx="400" cy="95" r="20" fill="#ffa737" opacity="0.85" />
          </g>
        </svg>

        {/* Layer 6: Rolling Valley Mist Across Lake */}
        <div 
          className="absolute z-3 pointer-events-none w-full"
          style={{
            top: '46%',
            height: '240px',
            background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(255, 252, 245, 0.75) 0%, rgba(250, 242, 230, 0.5) 45%, rgba(245, 235, 220, 0.2) 75%, transparent 100%)',
            animation: 'mistRoll 20s ease-in-out infinite alternate'
          }}
        />

        {/* Layer 7: 6 Botanical Autumn Leaves Drifting in 3D Motion */}
        {/* Leaf 1: Golden oak leaf drifting down left */}
        <div 
          className="absolute top-0 left-[14%] w-6 h-6 text-[#c87127] opacity-90 pointer-events-none z-10"
          style={{ animation: 'leafDrift1 13s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
            <path d="M12 2C12 2 15 6 15 10C17 9 19 11 18 13C20 14 20 17 18 19C16 21 14 21 12 22C12 22 12 24 11 24C10 24 10 22 10 22C8 21 6 21 4 19C2 17 2 14 4 13C3 11 5 9 7 10C7 6 10 2 12 2Z" />
          </svg>
        </div>

        {/* Leaf 2: Burgundy beech leaf drifting center */}
        <div 
          className="absolute top-0 left-[42%] w-5 h-5 text-[#9e2a2b] opacity-85 pointer-events-none z-10"
          style={{ animation: 'leafDrift2 16s cubic-bezier(0.33, 0.68, 0.55, 0.99) infinite 2s' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
            <path d="M12 1.5C12 1.5 17 6.5 17 13C17 17.5 14.5 21 12 22.5C9.5 21 7 17.5 7 13C7 6.5 12 1.5 12 1.5Z" />
          </svg>
        </div>

        {/* Leaf 3: Golden ochre maple leaf drifting right */}
        <div 
          className="absolute top-0 left-[75%] w-7 h-7 text-[#d9822b] opacity-90 pointer-events-none z-10"
          style={{ animation: 'leafDrift3 12s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 1s' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
            <path d="M12 2L13.5 7.5L18 5L16.5 10.5L21 12L16.5 13.5L18 19L13.5 16.5L12 22L10.5 16.5L6 19L7.5 13.5L3 12L7.5 10.5L6 5L10.5 7.5L12 2Z" />
          </svg>
        </div>

        {/* Leaf 4: Warm amber petite leaf drifting near left balustrade */}
        <div 
          className="absolute top-0 left-[22%] w-4 h-4 text-[#a8501e] opacity-80 pointer-events-none z-10"
          style={{ animation: 'leafDrift4 15s cubic-bezier(0.33, 0.68, 0.55, 0.99) infinite 4.5s' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
            <path d="M12 2C12 2 16 7 16 13C16 18 13 21 12 22C11 21 8 18 8 13C8 7 12 2 12 2Z" />
          </svg>
        </div>

        {/* Leaf 5: Golden bronze elm leaf near lake center */}
        <div 
          className="absolute top-0 left-[55%] w-5 h-5 text-[#c27827] opacity-85 pointer-events-none z-10"
          style={{ animation: 'leafDrift5 14s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 6s' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
            <path d="M12 1.5C12 1.5 17 6.5 17 13C17 17.5 14.5 21 12 22.5C9.5 21 7 17.5 7 13C7 6.5 12 1.5 12 1.5Z" />
          </svg>
        </div>

        {/* Leaf 6: Russet beech leaf near cathedral */}
        <div 
          className="absolute top-0 left-[86%] w-5 h-5 text-[#943825] opacity-80 pointer-events-none z-10"
          style={{ animation: 'leafDrift6 17s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 7.5s' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
            <path d="M12 2C12 2 15 7 15 12C15 17 12 22 12 22C12 22 9 17 9 12C9 7 12 2 12 2Z" />
          </svg>
        </div>

        {/* Layer 8: Floating Golden Sunlight Motes */}
        <div 
          className="absolute top-[260px] left-[20%] w-2 h-2 rounded-full bg-[#fdeec7] opacity-80 pointer-events-none z-10"
          style={{ animation: 'lightMoteFloat 9s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-[320px] left-[34%] w-2.5 h-2.5 rounded-full bg-[#fff4db] opacity-75 pointer-events-none z-10"
          style={{ animation: 'lightMoteFloat 12s ease-in-out infinite 2s' }}
        />
        <div 
          className="absolute top-[220px] left-[46%] w-2 h-2 rounded-full bg-[#fdeec7] opacity-70 pointer-events-none z-10"
          style={{ animation: 'lightMoteFloat 10s ease-in-out infinite 4s' }}
        />

        {/* ============================================================ */}
        {/* TOP NAVIGATION BAR (EXACT REFERENCE HEADER)                  */}
        {/* ============================================================ */}
        <header className="relative z-30 max-w-7xl mx-auto px-6 sm:px-10 pt-6 pb-4 flex items-center justify-between">
          {/* Brand Logo & Finals Title */}
          <div 
            className={`flex items-center gap-3 transition-all duration-700 ${
              timelineStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
            }`}
          >
            {/* Dark Forest Green Shield with Engraved Leaf/Check */}
            <div className="w-9 h-9 rounded-md bg-[#162a20] text-[#f9f6f0] flex items-center justify-center shadow-md border border-[#2d493a]">
              <Shield className="w-5 h-5 text-[#e2ede6]" strokeWidth={1.8} />
            </div>
            <div>
              <div className="font-serif font-bold text-base tracking-[0.08em] uppercase text-[#141210] leading-none">
                AGENT FIREWALL
              </div>
              <div className="text-[10px] text-[#5c544c] font-mono tracking-widest uppercase mt-1">
                GARDENIA 2K26 FINALS
              </div>
            </div>
          </div>

          {/* Navigation Links & Sign In Action */}
          <div 
            className={`flex items-center gap-7 transition-all duration-700 delay-100 ${
              timelineStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
            }`}
          >
            <nav className="hidden md:flex items-center gap-7 text-xs font-serif text-[#2a2622]">
              <a 
                href="#philosophy" 
                onClick={(e) => handleSmoothNav(e, 'philosophy')}
                className="hover:text-[#1e382b] transition-colors"
              >
                The Philosophy
              </a>
              <a 
                href="#principles" 
                onClick={(e) => handleSmoothNav(e, 'principles')}
                className="hover:text-[#1e382b] transition-colors"
              >
                Four Principles
              </a>
              <a 
                href="#architecture" 
                onClick={(e) => handleSmoothNav(e, 'architecture')}
                className="hover:text-[#1e382b] transition-colors"
              >
                Architecture Flow
              </a>
            </nav>

            {isAuthenticated ? (
              <button
                onClick={onOpenWorkspace}
                className="px-4 py-2 bg-[#1e382b] hover:bg-[#162a20] text-[#f9f6f0] rounded-md text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onNavigateLogin}
                className="px-4 py-2 bg-[#faf6f0]/85 hover:bg-[#1e382b] text-[#1e382b] hover:text-[#f9f6f0] border border-[#2c2824]/60 rounded-md text-xs font-medium tracking-wide transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:-translate-y-0.5 active:translate-y-0 group"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </header>

        {/* ============================================================ */}
        {/* HERO EDITORIAL CENTER (CLEAN, UNOBSTRUCTED FOCAL POINT)     */}
        {/* ============================================================ */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 pt-6 sm:pt-10 pb-16 text-center flex flex-col items-center">
          
          {/* Institutional Capsule Badge (1–2s) */}
          <div 
            className={`transition-all duration-700 transform ${
              timelineStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#d6c7b2] bg-white/70 backdrop-blur-xs text-[11px] font-sans font-medium tracking-wider text-[#4a4239] shadow-xs">
              <span className="uppercase tracking-[0.14em]">DETERMINISTIC TRUST INFRASTRUCTURE</span>
              <span className="text-[#a89984]">/</span>
              <span className="text-[#1e382b] font-bold tracking-[0.14em]">GARDENIA 2K26</span>
            </div>
          </div>

          {/* 3-Line Editorial Headline (2–4s) — COMPLETELY CLEAR OF FOLIAGE */}
          <div className="mt-6 sm:mt-7 max-w-3xl mx-auto">
            {/* Line 1: “AI can act. */}
            <div 
              className={`font-serif text-4xl sm:text-6xl md:text-[66px] font-normal text-[#1a1714] leading-[1.08] transition-all duration-700 transform ${
                timelineStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              “AI can act.
            </div>

            {/* Line 2: AI cannot decide what it is */}
            <div 
              className={`font-serif text-4xl sm:text-6xl md:text-[66px] font-normal text-[#1a1714] leading-[1.08] transition-all duration-700 transform ${
                timelineStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="italic font-serif text-[#1e3b2b]">AI cannot decide</span> what it is
            </div>

            {/* Line 3: allowed to do.” */}
            <div 
              className={`font-serif text-4xl sm:text-6xl md:text-[66px] font-normal text-[#1a1714] leading-[1.08] transition-all duration-700 transform ${
                timelineStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              allowed to do.”
            </div>
          </div>

          {/* Supporting Subtitle */}
          <p 
            className={`mt-4 sm:mt-5 text-sm sm:text-base text-[#4d443b] max-w-xl font-sans font-normal leading-relaxed transition-all duration-700 transform ${
              timelineStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            Deterministic trust infrastructure for agentic collaboration.
          </p>

          {/* ============================================================ */}
          {/* THE 4-STAGE PIPELINE WIDGET (INTEGRATED INTO SCENE)         */}
          {/* AI AGENT → FIREWALL → HUMAN → LEDGER                         */}
          {/* ============================================================ */}
          <div 
            className={`mt-7 sm:mt-9 w-full max-w-xl transition-all duration-800 transform ${
              timelineStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-center justify-between px-2 sm:px-4">
              
              {/* Node 1: AI AGENT */}
              <div className="flex flex-col items-center text-center w-24">
                <div className="w-10 h-10 rounded-full bg-white/80 border border-[#d2c3af] flex items-center justify-center text-[#1e382b] shadow-xs">
                  <Bot className="w-5 h-5 text-[#2b4435]" />
                </div>
                <span className="font-sans font-bold text-[11px] text-[#1a1714] uppercase mt-2 tracking-wide">
                  AI AGENT
                </span>
                <span className="text-[10px] text-[#635a50] font-sans">
                  Proposes actions
                </span>
              </div>

              {/* Connecting Dashed Line 1 with Red Status Dot */}
              <div className="flex-1 flex items-center justify-center relative px-1">
                <div className="w-full border-t border-dashed border-[#8d7c69] relative">
                  <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#9e2a2b] shadow-xs" />
                </div>
                <span className="text-[10px] text-[#8d7c69] font-mono ml-1">→</span>
              </div>

              {/* Node 2: FIREWALL (Light coral/peach rounded card) */}
              <div className="flex flex-col items-center text-center w-32">
                <div className="w-full bg-[#fef2f2]/95 border border-[#fca5a5] rounded-xl p-2.5 shadow-sm flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#fee2e2] flex items-center justify-center text-[#991b1b]">
                    <Shield className="w-4 h-4 text-[#991b1b]" strokeWidth={2.2} />
                  </div>
                  <span className="font-sans font-bold text-[11px] text-[#991b1b] uppercase mt-1.5 tracking-wide">
                    FIREWALL
                  </span>
                  <span className="text-[9px] text-[#7f1d1d] font-sans">
                    Evaluates policy
                  </span>
                  {/* Evaluating Pill Badge */}
                  <div className="mt-1">
                    <span 
                      className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase transition-colors duration-300 ${
                        firewallState === 'BLOCK'
                          ? 'bg-[#ffe4e6] text-[#881337] border-[#fda4af]'
                          : firewallState === 'APPROVAL'
                          ? 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                          : firewallState === 'ALLOW'
                          ? 'bg-[#dcfce7] text-[#14532d] border-[#86efac]'
                          : 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]'
                      }`}
                    >
                      {firewallState === 'EVALUATING' ? 'EVALUATING ···' : firewallState}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connecting Dashed Line 2 */}
              <div className="flex-1 flex items-center justify-center relative px-1">
                <div className="w-full border-t border-dashed border-[#8d7c69]" />
                <span className="text-[10px] text-[#8d7c69] font-mono ml-1">→</span>
              </div>

              {/* Node 3: HUMAN */}
              <div className="flex flex-col items-center text-center w-24">
                <div className="w-10 h-10 rounded-full bg-white/80 border border-[#d2c3af] flex items-center justify-center text-[#1a1714] shadow-xs">
                  <User className="w-5 h-5 text-[#3d362e]" />
                </div>
                <span className="font-sans font-bold text-[11px] text-[#1a1714] uppercase mt-2 tracking-wide">
                  HUMAN
                </span>
                <span className="text-[10px] text-[#635a50] font-sans">
                  Decides
                </span>
              </div>

              {/* Connecting Dashed Line 3 */}
              <div className="flex-1 flex items-center justify-center relative px-1">
                <div className="w-full border-t border-dashed border-[#8d7c69]" />
                <span className="text-[10px] text-[#8d7c69] font-mono ml-1">→</span>
              </div>

              {/* Node 4: LEDGER */}
              <div className="flex flex-col items-center text-center w-24">
                <div className="w-10 h-10 rounded-full bg-white/80 border border-[#d2c3af] flex items-center justify-center text-[#1a1714] shadow-xs">
                  <Database className="w-5 h-5 text-[#3d362e]" />
                </div>
                <span className="font-sans font-bold text-[11px] text-[#1a1714] uppercase mt-2 tracking-wide">
                  LEDGER
                </span>
                <span className="text-[10px] text-[#635a50] font-sans">
                  Records history
                </span>
              </div>

            </div>
          </div>

          {/* Action Buttons (5–6s) */}
          <div 
            className={`mt-8 sm:mt-9 flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 transform ${
              timelineStep >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <a
              href="#architecture"
              onClick={(e) => handleSmoothNav(e, 'architecture')}
              className="px-6 py-3 bg-[#1e382b] hover:bg-[#14281e] text-[#fbf8f3] rounded-md text-xs font-semibold tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer group"
            >
              <span>Explore the Demo</span>
              <ArrowRight className="w-4 h-4 text-[#e2ded6] group-hover:translate-x-0.5 transition-transform" />
            </a>

            <button
              onClick={onNavigateLogin}
              className="px-6 py-3 bg-[#fdfbf7]/95 hover:bg-[#f3ede2] text-[#1a1714] border border-[#cfbeab] rounded-md text-xs font-semibold tracking-wider transition-all shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer group"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 text-[#635a50] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. LOWER SECTION: RESPONSIVE 25% / 50% / 25% 3-COLUMN EDITORIAL */}
      {/* (FULL AVAILABLE WIDTH, NO VERTICAL COLLAPSE, NO OVERFLOW)       */}
      {/* ============================================================== */}
      <section className="relative z-20 w-full px-6 sm:px-10 lg:px-12 py-12 border-t border-[#e6dbc8] bg-[#fbf8f3]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
            
            {/* -------------------------------------------------------- */}
            {/* LEFT: THE PHILOSOPHY (~25% -> 3 of 12 columns)           */}
            {/* -------------------------------------------------------- */}
            <div 
              id="philosophy" 
              className="lg:col-span-3 p-6 sm:p-7 bg-[#fdfbf7] border border-[#e8ddce] rounded-sm flex flex-col justify-between shadow-2xs h-full"
            >
              <div>
                <span className="font-sans text-[10px] text-[#786e63] uppercase tracking-[0.2em] block mb-3 font-semibold">
                  THE PHILOSOPHY
                </span>
                <h2 className="font-serif text-2xl sm:text-[28px] font-normal text-[#1a1714] leading-snug">
                  A new standard for responsible AI research.
                </h2>
                {/* Coral/Amber Underline Bar */}
                <div className="w-10 h-[2px] bg-[#d97724] my-4" />
                <p className="text-xs sm:text-[13px] text-[#52493f] leading-relaxed font-sans">
                  Agents may propose actions. Humans remain accountable for what those actions are allowed to do.
                </p>
              </div>

              <div className="pt-6 border-t border-[#ede4d8] mt-6">
                <span className="text-xs font-serif italic text-[#786e63] block">
                  “Code decides. Documents are data, never instructions.”
                </span>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* CENTER: FOUR PRINCIPLES (~50% -> 6 of 12 columns)        */}
            {/* -------------------------------------------------------- */}
            <div 
              id="principles" 
              className="lg:col-span-6 p-6 sm:p-7 bg-[#fdfbf7] border border-[#e8ddce] rounded-sm flex flex-col justify-between shadow-2xs h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[10px] text-[#786e63] uppercase tracking-[0.2em] font-semibold">
                    FOUR PRINCIPLES
                  </span>
                  <span className="text-[10px] font-mono text-[#1e382b] bg-[#edf3ef] px-2 py-0.5 rounded-sm border border-[#1e382b]/20 font-semibold">
                    GOVERNING TRUST
                  </span>
                </div>

                {/* 4 Cards in Responsive 2x2 or 4x1 Row with Spacious Width */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {/* 01 CHARTER */}
                  <div className="p-4 bg-white border border-[#eae0d2] rounded-sm flex flex-col justify-between shadow-2xs min-h-[145px]">
                    <div>
                      <FileText className="w-5 h-5 text-[#2c2621] mb-2" strokeWidth={1.8} />
                      <span className="text-[11px] font-mono text-[#786e63] block">01</span>
                      <h3 className="font-sans font-bold text-xs text-[#1a1714] mt-0.5 tracking-wide">CHARTER</h3>
                    </div>
                    <p className="text-[11px] text-[#6b6156] mt-3 leading-snug">
                      Defines trust.
                    </p>
                  </div>

                  {/* 02 FIREWALL (Red numbered accent) */}
                  <div className="p-4 bg-white border border-[#eae0d2] rounded-sm flex flex-col justify-between shadow-2xs min-h-[145px]">
                    <div>
                      <Shield className="w-5 h-5 text-[#b91c1c] mb-2" strokeWidth={1.8} />
                      <span className="text-[11px] font-mono text-[#b91c1c] font-bold block">02</span>
                      <h3 className="font-sans font-bold text-xs text-[#1a1714] mt-0.5 tracking-wide">FIREWALL</h3>
                    </div>
                    <p className="text-[11px] text-[#6b6156] mt-3 leading-snug">
                      Enforces trust.
                    </p>
                  </div>

                  {/* 03 HUMAN */}
                  <div className="p-4 bg-white border border-[#eae0d2] rounded-sm flex flex-col justify-between shadow-2xs min-h-[145px]">
                    <div>
                      <Users className="w-5 h-5 text-[#2c2621] mb-2" strokeWidth={1.8} />
                      <span className="text-[11px] font-mono text-[#786e63] block">03</span>
                      <h3 className="font-sans font-bold text-xs text-[#1a1714] mt-0.5 tracking-wide">HUMAN</h3>
                    </div>
                    <p className="text-[11px] text-[#6b6156] mt-3 leading-snug">
                      Owns the decision.
                    </p>
                  </div>

                  {/* 04 LEDGER */}
                  <div className="p-4 bg-white border border-[#eae0d2] rounded-sm flex flex-col justify-between shadow-2xs min-h-[145px]">
                    <div>
                      <Database className="w-5 h-5 text-[#2c2621] mb-2" strokeWidth={1.8} />
                      <span className="text-[11px] font-mono text-[#786e63] block">04</span>
                      <h3 className="font-sans font-bold text-xs text-[#1a1714] mt-0.5 tracking-wide">LEDGER</h3>
                    </div>
                    <p className="text-[11px] text-[#6b6156] mt-3 leading-snug">
                      Proves history.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3.5 bg-[#f8f2e7] border border-[#e5d9c7] rounded-sm text-center">
                <span className="text-xs font-serif text-[#3f3830]">
                  Deterministic execution. Cryptographic proofs. Unforgeable receipts.
                </span>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* RIGHT: ARCHITECTURE FLOW (~25% -> 3 of 12 columns)       */}
            {/* -------------------------------------------------------- */}
            <div 
              id="architecture" 
              className="lg:col-span-3 p-6 sm:p-7 bg-[#fdfbf7] border border-[#e8ddce] rounded-sm flex flex-col justify-between shadow-2xs h-full"
            >
              <div>
                <span className="font-sans text-[10px] text-[#786e63] uppercase tracking-[0.2em] block mb-2 font-semibold">
                  ARCHITECTURE FLOW
                </span>
                <h2 className="font-serif text-lg sm:text-xl font-normal text-[#1a1714] leading-snug">
                  From idea to impact. <br />
                  <span className="italic text-[#1e382b]">With a human in the loop.</span>
                </h2>

                {/* Vertical Progression with Colored Dots & Line */}
                <div className="mt-5 space-y-3 relative">
                  {/* Connecting vertical guide */}
                  <div className="absolute left-[9px] top-2 bottom-2 w-[1.5px] bg-[#e2d6c4] z-0" />

                  {/* Step 1: AI Agent */}
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#1e382b] flex items-center justify-center shrink-0 mt-0.5 text-white shadow-xs">
                      <Bot className="w-3 h-3 text-[#e2ede6]" />
                    </div>
                    <div>
                      <span className="font-sans font-bold text-xs text-[#1a1714]">AI Agent</span>
                      <p className="text-[10px] text-[#6b6156] font-sans">Proposes an action</p>
                    </div>
                  </div>

                  {/* Step 2: Firewall */}
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#b91c1c] flex items-center justify-center shrink-0 mt-0.5 text-white shadow-xs">
                      <Shield className="w-3 h-3 text-[#fee2e2]" />
                    </div>
                    <div>
                      <span className="font-sans font-bold text-xs text-[#1a1714]">Firewall</span>
                      <p className="text-[10px] text-[#6b6156] font-sans">Evaluates policy, safety and scope</p>
                    </div>
                  </div>

                  {/* Step 3: Human Owner */}
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#d97724] flex items-center justify-center shrink-0 mt-0.5 text-white shadow-xs">
                      <User className="w-3 h-3 text-[#ffedd5]" />
                    </div>
                    <div>
                      <span className="font-sans font-bold text-xs text-[#1a1714]">Human Owner</span>
                      <p className="text-[10px] text-[#6b6156] font-sans">Reviews and decides</p>
                    </div>
                  </div>

                  {/* Step 4: Ledger */}
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#2c2621] flex items-center justify-center shrink-0 mt-0.5 text-white shadow-xs">
                      <Database className="w-3 h-3 text-[#f5efe6]" />
                    </div>
                    <div>
                      <span className="font-sans font-bold text-xs text-[#1a1714]">Ledger</span>
                      <p className="text-[10px] text-[#6b6156] font-sans">Records immutable history</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#ede4d8]">
                <button
                  onClick={onNavigateLogin}
                  className="w-full py-2.5 bg-[#1e382b] hover:bg-[#14281e] text-[#fbf8f3] rounded-md text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:-translate-y-0.5 active:translate-y-0 group"
                >
                  <span>Enter Workspace (Sign In)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ded5c6] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. FOOTER                                                      */}
      {/* ============================================================== */}
      <footer className="relative z-20 border-t border-[#e8ddce] bg-[#f8f3ea] px-6 sm:px-10 py-6 text-xs text-[#786e63] font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#1a1714] tracking-wider uppercase">
              Agent Firewall
            </span>
            <span className="text-[#c5baa9]">|</span>
            <span>Gardenia 2K26 Finals</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-[#52493f]">
            <span>Deterministic Policy</span>
            <span className="text-[#c5baa9]">·</span>
            <span>Human-in-the-Loop</span>
            <span className="text-[#c5baa9]">·</span>
            <span>Cryptographic Ledger</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
