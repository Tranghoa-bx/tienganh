import React from 'react';
import { Gift as GiftType } from '../types';
import { FileDown, PenTool, Gift, Award, Grid, Coins, CheckCircle, ArrowRight } from 'lucide-react';

interface GiftShopProps {
  gifts: GiftType[];
  userPoints: number;
  unlockedGifts: string[];
  onRedeem: (giftId: string, cost: number) => void;
}

export default function GiftShop({ gifts, userPoints, unlockedGifts, onRedeem }: GiftShopProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileDown': return FileDown;
      case 'PenTool': return PenTool;
      case 'Gift': return Gift;
      case 'Award': return Award;
      case 'Grid': return Grid;
      default: return Gift;
    }
  };

  return (
    <div className="space-y-6">
      {/* Coins Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 rounded-2xl text-white shadow-md flex items-center justify-between">
        <div className="space-y-1 text-left">
          <p className="text-xs text-amber-100 font-bold uppercase tracking-wider">Ngân hàng điểm thưởng của con</p>
          <div className="flex items-center space-x-2">
            <Coins className="w-7 h-7 text-yellow-300 animate-bounce" />
            <h2 className="text-2xl font-black">{userPoints} <span className="text-sm font-semibold">Điểm tích lũy</span></h2>
          </div>
        </div>
        <div className="text-xs bg-white/15 px-3 py-1.5 rounded-lg border border-white/10 font-medium">
          Luyện phát âm & Từ vựng để kiếm thêm điểm!
        </div>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {gifts.map((gift) => {
          const GiftIcon = getIcon(gift.icon);
          const isUnlocked = unlockedGifts.includes(gift.id);
          const canAfford = userPoints >= gift.cost;

          return (
            <div
              key={gift.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? 'border-emerald-200 ring-2 ring-emerald-500/10'
                  : 'border-slate-100 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Top info */}
              <div className="p-5 space-y-3.5 text-left">
                {/* Icon wrapper & Type badge */}
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${
                    gift.type === 'document' ? 'bg-blue-50 text-blue-600' :
                    gift.type === 'physical' ? 'bg-amber-50 text-amber-600' :
                    gift.type === 'voucher' ? 'bg-rose-50 text-rose-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    <GiftIcon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isUnlocked ? 'bg-emerald-100 text-emerald-800' :
                    gift.type === 'document' ? 'bg-blue-100 text-blue-800' :
                    gift.type === 'physical' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {isUnlocked ? 'Đã đổi quà' :
                     gift.type === 'document' ? 'Tài liệu học tập' :
                     gift.type === 'physical' ? 'Quà hiện vật' :
                     gift.type === 'voucher' ? 'Mã ưu đãi' : 'Danh hiệu'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{gift.name}</h4>
                  <p className="text-slate-500 text-xs leading-normal line-clamp-3">{gift.description}</p>
                </div>
              </div>

              {/* Bottom action block */}
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-700 text-sm">{gift.cost} điểm</span>
                </div>

                {isUnlocked ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Đã sở hữu</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => onRedeem(gift.id, gift.cost)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
                      canAfford
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Đổi quà</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
