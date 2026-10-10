import React from 'react';
import { X, Keyboard, Command, Sparkles } from 'lucide-react';

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotkeysModal: React.FC<HotkeysModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const hotkeysList = [
    {
      key: '↑',
      description: 'إضافة نقطة للفريق الأول (Team A +1)',
      category: 'النقاط والتحكيم',
      color: 'border-purple-500/40 text-purple-300',
    },
    {
      key: '↓',
      description: 'خصم نقطة من الفريق الأول (Team A -1)',
      category: 'النقاط والتحكيم',
      color: 'border-purple-500/40 text-purple-300',
    },
    {
      key: '→  أو  +',
      description: 'إضافة نقطة للفريق الثاني (Team B +1)',
      category: 'النقاط والتحكيم',
      color: 'border-cyan-500/40 text-cyan-300',
    },
    {
      key: '←  أو  -',
      description: 'خصم نقطة من الفريق الثاني (Team B -1)',
      category: 'النقاط والتحكيم',
      color: 'border-cyan-500/40 text-cyan-300',
    },
    {
      key: 'Space',
      description: 'تشغيل / إيقاف المؤقت ونقرة التحكم الصوتي',
      category: 'المؤقت',
      color: 'border-amber-500/40 text-amber-300',
    },
    {
      key: 'B',
      description: 'فتح / إغلاق شاشة المسرح الميدانية (Stage View)',
      category: 'العرض والشاشات',
      color: 'border-indigo-500/40 text-indigo-300',
    },
    {
      key: 'F',
      description: 'تبديل وضع ملء الشاشة (Fullscreen)',
      category: 'العرض والشاشات',
      color: 'border-emerald-500/40 text-emerald-300',
    },
    {
      key: 'T',
      description: 'التبديل المباشر إلى شاشة المؤقت المزدوج',
      category: 'التنقل السريع',
      color: 'border-slate-500/40 text-slate-300',
    },
    {
      key: 'M',
      description: 'التبديل المباشر إلى شاشة المواجهة الرئيسية',
      category: 'التنقل السريع',
      color: 'border-slate-500/40 text-slate-300',
    },
    {
      key: 'Esc',
      description: 'إغلاق أي نافذة منبثقة أو الخروج من وضع المسرح',
      category: 'عام',
      color: 'border-rose-500/40 text-rose-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-[#0B1021] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E152E]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-changa font-bold text-white">اختصارات لوحة المفاتيح السريعة</h2>
              <p className="text-xs text-slate-400">تحكم فوري عالي السرعة للحكام ومخرجي البث بدون لمس الفأرة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {hotkeysList.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                  {item.category}
                </span>
                <span className="text-xs sm:text-sm text-slate-200 font-medium">
                  {item.description}
                </span>
              </div>
              <kbd
                className={`px-3 py-1.5 rounded-lg bg-slate-950 border font-mono font-bold text-xs sm:text-sm shadow-inner shrink-0 ${item.color}`}
              >
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0E152E]/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تعمل الاختصارات أيضاً عند استخدام الحروف بالعربية تلقائياً</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow"
          >
            فهمت ذلك
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotkeysModal;
