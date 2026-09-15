import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, Printer, Download, Sparkles, Check, Phone, MapPin } from 'lucide-react';
import { Logo } from './Logo';

interface QrGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: string | null;
}

export const QrGeneratorModal: React.FC<QrGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentTable,
}) => {
  const [tableSelection, setTableSelection] = useState<string>(currentTable || '1');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Formulate target URL with table parameter
    const origin = window.location.origin;
    const targetUrl =
      tableSelection === 'entrance'
        ? origin
        : `${origin}/?table=${tableSelection}`;

    QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#140e09',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('QR Generation notice:', err));
  }, [isOpen, tableSelection]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Arachchi_Restaurant_Table_${tableSelection}_QR.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#171009] border border-amber-600/40 p-5 sm:p-7 shadow-2xl text-stone-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-amber-100">
              Table QR Stand Generator
            </h3>
            <p className="text-xs text-stone-400">
              Generate scannable QR codes for restaurant dining tables.
            </p>
          </div>
        </div>

        {/* Table Selector */}
        <div className="flex items-center gap-2 mb-5">
          <label className="text-xs font-semibold text-stone-300">Select Table:</label>
          <select
            value={tableSelection}
            onChange={(e) => setTableSelection(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-amber-300 focus:outline-none"
          >
            <option value="entrance">Main Entrance / Counter Stand</option>
            {Array.from({ length: 25 }, (_, i) => (
              <option key={i + 1} value={`${i + 1}`}>
                Table {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Printable Table Card Preview */}
        <div
          ref={printRef}
          className="bg-[#faf6f0] text-stone-900 p-6 rounded-2xl border-4 border-[#3d2716] shadow-2xl text-center space-y-4 max-w-sm mx-auto"
        >
          {/* Header on Table Card */}
          <div className="border-b-2 border-amber-900/30 pb-3">
            <div className="flex items-center justify-center gap-2">
              <span className="font-serif text-2xl font-black text-[#2e1c10] tracking-wider">
                ARACHCHI
              </span>
              <span className="text-sm font-bold text-amber-800">ආරච්චි</span>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#784620]">
              Restaurant • Anuradhapura
            </div>
          </div>

          {/* Table Number Badge */}
          <div className="inline-block px-4 py-1 rounded-full bg-[#2e1c10] text-amber-300 text-sm font-black tracking-wider uppercase shadow">
            {tableSelection === 'entrance' ? 'Welcome • Dine In' : `Table ${tableSelection}`}
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-xl border-2 border-dashed border-[#a67c52] shadow-inner inline-block">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Menu QR Code"
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-stone-400">
                Generating QR...
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-1">
            <div className="text-xs font-black text-[#2e1c10] tracking-wide uppercase">
              Scan with Phone Camera
            </div>
            <div className="text-[11px] font-medium text-stone-700">
              Instant Menu & Live Prices • බීම හා ආහාර මෙනුව
            </div>
            <div className="text-[10px] text-stone-500">
              Jayanthi Mawatha, Anuradhapura • Tel: +94 25 226 2444
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Table Card
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
};
