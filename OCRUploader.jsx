import { useState } from "react";
import Tesseract from "tesseract.js";

export default function OCRUploader({ onTextDetected }) {
  const [loading, setLoading] = useState(false);
  const [detectedText, setDetectedText] = useState("");
  const [preview, setPreview] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setDetectedText("");

    try {
      const result = await Tesseract.recognize(file, "eng");
      const text = result.data.text;
      setDetectedText(text);
      onTextDetected(text);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm-card p-5 sm-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="
          w-10 h-10 rounded-xl
          bg-gradient-to-br from-indigo-500 to-purple-500
          text-white flex items-center justify-center
          shadow-md
        ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Sora' }}>
            OCR con IA
          </h3>
          <p className="text-xs text-slate-500">
            Sube una imagen para detectar fechas automáticamente
          </p>
        </div>
      </div>

      <label className="
        flex flex-col items-center justify-center
        p-6 border-2 border-dashed border-indigo-200
        rounded-xl bg-indigo-50/30
        cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/60
        transition
      ">
        {preview ? (
          <img src={preview} alt="preview" className="max-h-32 rounded-lg mb-3"/>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-indigo-400 mb-2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        )}
        <p className="font-semibold text-sm text-slate-700">
          {preview ? "Cambiar imagen" : "Clic para subir imagen"}
        </p>
        <p className="text-xs text-slate-500 mt-1">PNG, JPG o JPEG</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>

      {loading && (
        <div className="mt-4 flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
          <svg className="animate-spin w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4"/>
            <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <p className="text-sm font-medium text-indigo-900">Analizando imagen con IA...</p>
        </div>
      )}

      {detectedText && !loading && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
            Texto detectado
          </p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
            {detectedText}
          </p>
        </div>
      )}
    </div>
  );
}
