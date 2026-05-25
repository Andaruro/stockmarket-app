import { useState } from "react";

import Tesseract from "tesseract.js";

export default function OCRUploader({
  onTextDetected
}) {

  const [loading, setLoading] =
    useState(false);

  const [detectedText, setDetectedText] =
    useState("");

  const handleImageUpload =
    async (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      setLoading(true);

      const result =
        await Tesseract.recognize(
          file,
          "eng"
        );

      const text =
        result.data.text;

      setDetectedText(text);

      onTextDetected(text);

      setLoading(false);

  };

  return (

    <div className="
      bg-white
      p-6
      rounded-2xl
      shadow
      mb-6
    ">

      <h2 className="
        text-2xl
        font-bold
        mb-4
      ">
        OCR IA
      </h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />

      {loading && (

        <p className="mt-4">
          Analizando imagen...
        </p>

      )}

      {detectedText && (

        <div className="
          mt-4
          p-4
          bg-slate-100
          rounded-lg
        ">

          <p className="font-bold">
            Texto Detectado:
          </p>

          <p className="mt-2 whitespace-pre-wrap">
            {detectedText}
          </p>

        </div>

      )}

    </div>
  );
}