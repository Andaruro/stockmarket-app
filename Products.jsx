const handleBarcodeScan =
  (code) => {

    try {

      const cleanCode =
        code.trim();

      const values =
        cleanCode.split(",");

      if (values.length < 5) {

        alert(
          "Formato QR inválido"
        );

        return;

      }

      setProduct({
        name:
          values[0].trim(),

        barcode:
          cleanCode,

        price:
          values[1].trim(),

        quantity:
          values[2].trim(),

        minStock:
          values[3].trim(),

        expirationDate:
          values[4].trim()
      });

    } catch (error) {

      console.error(
        "QR inválido",
        error
      );

    }

};
