import { useCallback, useState } from "react";

const useImageUpload = () => {
  const [icon, setIcon] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [iconChanged, setIconChanged] = useState(false);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          const img = new Image();
          img.src = result;

          img.onload = () => {
            const inputWidth = img.naturalWidth;
            const inputHeight = img.naturalHeight;
            // convert to aspect ratio 1
            let outputWidth = inputWidth;
            let outputHeight = inputHeight;
            if (inputWidth > inputHeight) {
              outputWidth = inputHeight;
            } else if (inputHeight > inputWidth) {
              outputHeight = inputWidth;
            }

            const offsetX = (outputWidth - inputWidth) * 0.5;
            const offsetY = (outputHeight - inputHeight) * 0.5;

            const canvas = document.createElement("canvas");
            canvas.width = outputWidth;
            canvas.height = outputHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, offsetX, offsetY);

            // create a second canvas to scale the square image to 512x512
            const scaledCanvas = document.createElement("canvas");
            scaledCanvas.width = 512;
            scaledCanvas.height = 512;

            const scaledCtx = scaledCanvas.getContext("2d");
            scaledCtx.drawImage(canvas, 0, 0, 512, 512);

            scaledCanvas.toBlob(
              (blob) => {
                const resizedImage = new File(
                  [blob],
                  "resized-server-icon.webp",
                  {
                    type: "image/webp",
                  },
                );
                setIcon(resizedImage);
                setPreviewUrl(URL.createObjectURL(blob));
              },
              "image/webp",
              1, // Quality maximum (1)
            );
          };
        } else {
          console.error("Result of FileReader is not a string");
        }
      };
      reader.readAsDataURL(file);
      setIconChanged(true);
    }
  }, []);

  return {
    icon,
    previewUrl,
    iconChanged,
    setIconChanged,
    handleFileChange,
    setPreviewUrl,
    setIcon,
  };
};

export default useImageUpload;
