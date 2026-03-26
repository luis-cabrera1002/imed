import { useState } from "react";
import { Phone, X, AlertTriangle } from "lucide-react";

export default function EmergencyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110"
        aria-label="Emergencia"
      >
        <Phone className="w-6 h-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Emergencia</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <a href="tel:128" className="flex items-center gap-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl hover:bg-red-100 transition-colors">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-red-700 text-lg">1-2-8</p>
                  <p className="text-sm text-red-600">Emergencias Guatemala</p>
                </div>
              </a>
              <a href="tel:122" className="flex items-center gap-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl hover:bg-orange-100 transition-colors">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-orange-700 text-lg">1-2-2</p>
                  <p className="text-sm text-orange-600">Bomberos Voluntarios</p>
                </div>
              </a>
              <a href="tel:1516" className="flex items-center gap-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-blue-700 text-lg">1516</p>
                  <p className="text-sm text-blue-600">Cruz Roja Guatemala</p>
                </div>
              </a>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">Toca un numero para llamar directamente</p>
          </div>
        </div>
      )}
    </>
  );
}
