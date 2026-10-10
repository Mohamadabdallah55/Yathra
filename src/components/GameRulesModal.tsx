import React, { useState } from 'react';
import { GameItem, CategoryInfo } from '../types';
import { GameIcon } from './GameIcons';
import { X, Check, BookOpen } from 'lucide-react';

interface GameRulesModalProps {
  game: GameItem;
  category?: CategoryInfo;
  onSaveRules: (gameId: string, rules: string) => void;
  onClose: () => void;
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({
  game,
  category,
  onSaveRules,
  onClose,
}) => {
  const [rulesText, setRulesText] = useState(
    game.rules || `• نظام الجولة: مواجهة رسمية بين ممثلي الفريقين (أو الفريق كاملاً).
• الهدف: تحقيق الفوز وفق قوانين اللعبة والوقت المحدد.
• التحكيم: قرار الحكم نهائي ويتم تسجيل النتيجة فور انتهاء الجولة.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in text-right">
      <div className="bg-[#0C1226] border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <GameIcon name={game.iconType} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base font-changa text-white flex items-center gap-2">
              <span>قوانين وشروط لعبة: {game.nameAr}</span>
            </h3>
            <span className="font-mono text-xs text-slate-400 uppercase">{game.nameEn}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 font-changa mb-1.5">
            دليل القوانين والتوجيهات للحكم:
          </label>
          <textarea
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            rows={6}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-cairo leading-relaxed focus:outline-none focus:border-purple-500"
            placeholder="اكتب تفاصيل القوانين ونظام احتساب الفوز هنا..."
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold font-changa"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              onSaveRules(game.id, rulesText);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-changa flex items-center gap-1.5 shadow-md shadow-purple-600/40"
          >
            <Check className="w-4 h-4" />
            <span>حفظ القوانين</span>
          </button>
        </div>
      </div>
    </div>
  );
};
