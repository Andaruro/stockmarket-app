import { useEffect }
from "react";

import {
  Html5QrcodeScanner
} from "html5-qrcode";

export default function BarcodeScanner({
  onScan
}) {

  useEffect(() => {

    const scanner =
      new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: 250
        },
        false
      );

    scanner.render(

      async (decodedText) => {

        console.log(
          "QR LEÍDO:",
          decodedText
        );

        onScan(decodedText);

        await scanner.clear();

      },

      () => {}

    );

    return () => {

      scanner.clear()
        .catch(() => {});

    };

  }, []);

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
        Scanner Código Barras
      </h2>

      <div id="reader"></div>

    </div>
  );
}
