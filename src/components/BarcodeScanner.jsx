import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function BarcodeScanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="sm-card p-5 sm-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="
          w-10 h-10 rounded-xl
          bg-gradient-to-br from-teal-500 to-emerald-500
          text-white flex items-center justify-center
          shadow-md
        ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
            <line x1="7" y1="8" x2="7" y2="16"/>
            <line x1="11" y1="8" x2="11" y2="16"/>
            <line x1="15" y1="8" x2="15" y2="16"/>
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Sora' }}>
            Scanner
          </h3>
          <p className="text-xs text-slate-500">
            Apunta la cámara al código de barras o QR
          </p>
        </div>
      </div>

      <div
        id="reader"
        className="
          rounded-xl overflow-hidden
          border border-slate-200
          [&_button]:!sm-btn [&_button]:!sm-btn-secondary
          [&_select]:!sm-input
        "
      />
    </div>
  );
}
