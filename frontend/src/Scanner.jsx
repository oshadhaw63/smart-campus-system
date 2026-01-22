import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const Scanner = ({ onScan }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [lastScanned, setLastScanned] = useState("No data yet");

  useEffect(() => {
    const scannerId = "reader";
    let html5QrCode;

    const startScanner = async () => {
        try {
            html5QrCode = new Html5Qrcode(scannerId);
            await html5QrCode.start(
                { facingMode: "environment" },
                { fps: 5, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    // Update debug text
                    setLastScanned(decodedText);
                    
                    // Logic to extract ID
                    const lines = decodedText.split("\n");
                    const idLine = lines.find(line => line.startsWith("ID:"));
                    
                    if (idLine) {
                        const id = idLine.split(":")[1].trim();
                        // Send ID to App.jsx
                        onScan(id);
                        // Optional: Pause briefly
                        html5QrCode.pause();
                        setTimeout(() => html5QrCode.resume(), 2000); 
                    }
                },
                (errorMessage) => { /* ignore errors */ }
            );
        } catch (err) {
            console.error(err);
            setIsEnabled(false);
        }
    };

    if (isEnabled) setTimeout(startScanner, 100);

    return () => {
        if (html5QrCode?.isScanning) {
            html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
        }
    };
  }, [isEnabled, onScan]);

  return (
    <div className="bg-white p-4 rounded-xl text-center relative">
       <div id="reader" className="w-full h-64 bg-black rounded-lg overflow-hidden"></div>
       {/* DEBUG INFO */}
       <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600 font-mono break-all">
           Last Read: {lastScanned}
       </div>
    </div>
  );
};

export default Scanner;