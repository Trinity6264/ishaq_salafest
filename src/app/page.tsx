'use client'
import React, { useState, useRef } from 'react';
import { Calendar, MapPin, Trophy, Target, Download, X } from 'lucide-react';

// Type definitions
interface Bet {
  id: string;
  label: string;
  odds: string;
  type?: 'win' | 'draw';
  category?: string;
}

interface GroupedOdds {
  [category: string]: Bet[];
}

const BettingApp: React.FC = () => {
  const [selectedBets, setSelectedBets] = useState<Bet[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const betSlipRef = useRef<HTMLDivElement>(null);

  const handleBetClick = (bet: Bet): void => {
    const isSelected = selectedBets.some(b => b.id === bet.id);
    if (isSelected) {
      setSelectedBets(selectedBets.filter(b => b.id !== bet.id));
    } else {
      setSelectedBets([...selectedBets, bet]);
    }
  };

  const placeBet = (): void => {
    if (selectedBets.length > 0) {
      setShowPopup(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const closePopup = (): void => {
    setShowPopup(false);
    setSelectedBets([]);
  };

  const downloadBetSlip = async (): Promise<void> => {
    const dialogElement = document.getElementById('bet-confirmation-dialog');
    if (!dialogElement) return;

    try {
      // Dynamically load html2canvas
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(script);

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load html2canvas'));
      });

      // TypeScript doesn't know about html2canvas on window, so we cast it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2canvas = (window as any).html2canvas;

      if (html2canvas) {
        const canvas = await html2canvas(dialogElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: dialogElement.offsetWidth,
          height: dialogElement.offsetHeight
        });

        // Download the image
        const link = document.createElement('a');
        link.download = `bet-slip-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        return;
      }
    } catch (error) {
      console.error('Error generating bet slip:', error);
      // Fallback to canvas drawing if html2canvas fails
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 400;
      canvas.height = 400 + (selectedBets.length * 25);

      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw header with trophy
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(200, 60, 40, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Bet Placed Successfully! 🎉', 200, 140);

      ctx.font = '16px Arial';
      ctx.fillText('Rich Family vs Town FC', 200, 170);
      ctx.font = '14px Arial';
      ctx.fillText('Ishaq Salafest - Semi Finals', 200, 190);

      // Draw selections
      ctx.textAlign = 'left';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Bet Summary:', 20, 230);

      selectedBets.forEach((bet, index) => {
        ctx.font = '14px Arial';
        ctx.fillText(bet.label, 20, 260 + (index * 25));
        ctx.textAlign = 'right';
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#22c55e';
        ctx.fillText(bet.odds, 380, 260 + (index * 25));
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
      });

      // Draw totals
      const yOffset = 280 + (selectedBets.length * 25);
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Stake: GH₵${stakeAmount} × ${totalOdds.toFixed(2)}`, 20, yOffset);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`Potential Win: GH₵${potentialWin.toFixed(2)}`, 20, yOffset + 25);

      // Download
      const link = document.createElement('a');
      link.download = `bet-slip-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const mainOdds: Bet[] = [
    { id: 'rich-win', label: 'Rich Family', odds: '1.85', type: 'win' },
    { id: 'draw', label: 'Draw', odds: '3.40', type: 'draw' },
    { id: 'town-win', label: 'Town FC', odds: '4.20', type: 'win' }
  ];

  const moreOdds: Bet[] = [
    // Goals Markets
    { id: 'rich-3plus', label: 'Rich Family 3+ Goals', odds: '2.75', category: 'Goals' },
    { id: 'rich-2plus', label: 'Rich Family 2+ Goals', odds: '1.65', category: 'Goals' },
    { id: 'town-1plus', label: 'Town FC 1+ Goals', odds: '1.95', category: 'Goals' },
    { id: 'both-score', label: 'Both Teams to Score', odds: '1.72', category: 'Goals' },
    { id: 'over-2.5', label: 'Over 2.5 Goals', odds: '1.58', category: 'Goals' },
    { id: 'over-3.5', label: 'Over 3.5 Goals', odds: '2.45', category: 'Goals' },
    { id: 'under-2.5', label: 'Under 2.5 Goals', odds: '2.35', category: 'Goals' },
    { id: 'over-1.5', label: 'Over 1.5 Goals', odds: '1.25', category: 'Goals' },

    // Half Time Markets
    { id: 'ht-rich', label: 'Rich Family HT', odds: '2.10', category: 'Half Time' },
    { id: 'ht-draw', label: 'Draw HT', odds: '2.25', category: 'Half Time' },
    { id: 'ht-town', label: 'Town FC HT', odds: '3.80', category: 'Half Time' },
    { id: 'ht-over1.5', label: 'Over 1.5 Goals HT', odds: '2.65', category: 'Half Time' },

    // Corners & Cards
    { id: 'rich-corners', label: 'Rich Family Most Corners', odds: '1.95', category: 'Specials' },
    { id: 'over-8corners', label: 'Over 8.5 Corners', odds: '1.85', category: 'Specials' },
    { id: 'over-3cards', label: 'Over 3.5 Cards', odds: '1.75', category: 'Specials' },
    { id: 'red-card', label: 'Red Card Shown', odds: '3.25', category: 'Specials' },

    // Clean Sheets & First Goal
    { id: 'rich-clean', label: 'Rich Family Clean Sheet', odds: '2.10', category: 'Specials' },
    { id: 'town-clean', label: 'Town FC Clean Sheet', odds: '4.50', category: 'Specials' },
    { id: 'first-goal', label: 'Rich Family First Goal', odds: '1.65', category: 'Specials' },
    { id: 'last-goal', label: 'Rich Family Last Goal', odds: '1.85', category: 'Specials' },

    // Exact Score
    { id: 'score-2-0', label: 'Rich Family 2-0', odds: '6.50', category: 'Exact Score' },
    { id: 'score-3-1', label: 'Rich Family 3-1', odds: '8.75', category: 'Exact Score' },
    { id: 'score-1-1', label: 'Draw 1-1', odds: '7.25', category: 'Exact Score' },
    { id: 'score-2-1', label: 'Rich Family 2-1', odds: '7.80', category: 'Exact Score' }
  ];

  const groupedOdds: GroupedOdds = moreOdds.reduce((acc: GroupedOdds, bet: Bet) => {
    if (bet.category && !acc[bet.category]) acc[bet.category] = [];
    if (bet.category) acc[bet.category].push(bet);
    return acc;
  }, {});

  const totalOdds: number = selectedBets.reduce((acc, bet) => acc * parseFloat(bet.odds), 1);
  const potentialWin: number = stakeAmount * totalOdds;

  const Confetti: React.FC = () => {
    const pieces = Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        className={`absolute w-3 h-3 opacity-80`}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
          borderRadius: '50%',
          animation: `confetti-fall ${2 + Math.random() * 2}s linear infinite`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ));
    return <div className="fixed inset-0 pointer-events-none z-30">{pieces}</div>;
  };

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setStakeAmount(Number(e.target.value) || 0);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(720deg); }
        }
      `}</style>

      {showConfetti && <Confetti />}

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center gap-3">
          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">LIVE</span>
          <span className="text-sm font-medium">19:15</span>
          <span className="text-xs opacity-90">Match ID: 31904</span>
          <span className="text-sm font-medium">Ishaq Salafest - Semi Finals</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-b-lg shadow-lg">
              {/* Match Info */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Friday, June 6th</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>Acherensua Town Park</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="text-center flex-1">
                    <h2 className="text-xl font-bold mb-2">Rich Family</h2>
                    <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto"></div>
                  </div>

                  <div className="text-center px-8">
                    <div className="text-2xl font-bold text-gray-400 mb-2">VS</div>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      SEMI FINAL
                    </span>
                  </div>

                  <div className="text-center flex-1">
                    <h2 className="text-xl font-bold mb-2">Town FC</h2>
                    <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto"></div>
                  </div>
                </div>

                {/* Main Odds - SportyBet Style */}
                <div className="grid grid-cols-3 gap-1">
                  {mainOdds.map((bet) => (
                    <button
                      key={bet.id}
                      onClick={() => handleBetClick(bet)}
                      className={`border rounded p-3 text-center transition-all ${selectedBets.some(b => b.id === bet.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                    >
                      <div className="text-xs text-gray-600 mb-1">
                        {bet.type === 'win' ? (bet.label === 'Rich Family' ? '1' : '2') : 'X'}
                      </div>
                      <div className="font-bold text-lg">{bet.odds}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Markets */}
              <div className="p-6">
                {Object.entries(groupedOdds).map(([category, bets]) => (
                  <div key={category} className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {bets.map((bet) => (
                        <button
                          key={bet.id}
                          onClick={() => handleBetClick(bet)}
                          className={`border rounded p-2 text-left text-sm transition-all ${selectedBets.some(b => b.id === bet.id)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                          <div className="text-xs text-gray-600 mb-1 truncate">{bet.label}</div>
                          <div className="font-bold">{bet.odds}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg sticky top-6" ref={betSlipRef}>
              <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                <h3 className="font-bold">Bet Slip ({selectedBets.length})</h3>
              </div>

              {selectedBets.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Target size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Click on odds to add selections</p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                    {selectedBets.map((bet) => (
                      <div key={bet.id} className="border rounded p-2 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="text-xs text-gray-600 mb-1 flex-1 pr-2">{bet.label}</div>
                          <button
                            onClick={() => handleBetClick(bet)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="font-bold text-green-600">{bet.odds}</div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="mb-3">
                      <label className="block text-xs text-gray-600 mb-1">Stake Amount</label>
                      <div className="flex items-center border rounded">
                        <span className="px-2 text-sm text-gray-600">GH₵</span>
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={handleStakeChange}
                          className="flex-1 p-2 border-0 outline-none"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="text-sm space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span>Total Odds:</span>
                        <span className="font-bold">{totalOdds.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stake:</span>
                        <span>GH₵{stakeAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-bold">Potential Win:</span>
                        <span className="font-bold text-green-600">GH₵{potentialWin.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={placeBet}
                      className="w-full bg-green-500 text-white py-3 rounded font-bold hover:bg-green-600 transition-colors"
                    >
                      Place Bet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup - Fixed Position */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div
            id="bet-confirmation-dialog"
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trophy className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Bet Placed Successfully! 🎉</h3>
              <p className="text-gray-600 mb-6">Your bet has been confirmed for Rich Family vs Town FC.</p>
              <p className="text-sm text-gray-500 mb-4">Ishaq Salafest - Semi Finals</p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="text-sm font-bold text-gray-800 mb-3 text-center">Bet Summary</div>
                {selectedBets.map((bet) => (
                  <div key={bet.id} className="flex justify-between items-center py-2 text-sm border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-700">{bet.label}</span>
                    <span className="font-bold text-green-600">{bet.odds}</span>
                  </div>
                ))}
                <div className="border-t-2 border-gray-300 mt-3 pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stake Amount:</span>
                    <span className="font-medium">GH₵{stakeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total Odds:</span>
                    <span className="font-medium">{totalOdds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Potential Win:</span>
                    <span className="text-green-600">GH₵{potentialWin.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={downloadBetSlip}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Bet Slip
                </button>
                <button
                  onClick={closePopup}
                  className="w-full bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Continue Betting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingApp;