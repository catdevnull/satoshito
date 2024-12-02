import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { signal, computed } from "@preact/signals";

const rates = signal({
  rate: 91846353.59709679,
  satsPerPeso: "1.09",
  time: 1733180438507,
  exchanges: [] as { exchange: string; price: number }[],
});

const isLoading = signal(true);
const error = signal<string | null>(null);

async function fetchRates() {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await fetch("/api/rates");
    const data = await response.json();
    if (response.ok) {
      rates.value = data;
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    error.value = "Error al obtener las tasas de cambio";
  } finally {
    isLoading.value = false;
  }
}

export function Calculadora() {
  const [modo, setModo] = useState<"peso" | "sats">("peso");
  const [valor, setValor] = useState<string>("1");

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const calcularConversion = () => {
    const numero = parseFloat(valor) || 0;
    const tasaSatsPerPeso = parseFloat(rates.value.satsPerPeso);

    if (modo === "peso") {
      return (numero * tasaSatsPerPeso).toFixed(2);
    } else {
      return (numero / tasaSatsPerPeso).toFixed(2);
    }
  };

  const intercambiarModo = () => {
    setModo(modo === "peso" ? "sats" : "peso");
    setValor("1");
  };

  const ultimaActualizacion = computed(() => {
    console.log(rates.value);
    if (!rates.value.time) return "";
    const fecha = new Date(rates.value.time);
    return fecha.toLocaleTimeString("es-AR");
  });

  return (
    <div>
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mb-8 flex flex-col gap-4">
        <div className="gap-2 md:gap-6 flex flex-col md:flex-row justify-center">
          <div className="relative">
            <input
              type="number"
              value={valor}
              onInput={(e) => setValor(e.currentTarget.value)}
              className=" text-4xl font-bold text-center bg-gray-50 rounded-lg py-4 px-3 focus:ring-2 focus:ring-primary-500 focus:outline-none w-48"
              min="0"
              disabled={isLoading.value || !!error.value}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              {modo === "peso" ? "PESOS" : "SATS"}
            </span>
          </div>

          <button
            onClick={intercambiarModo}
            className="flex items-center justify-center space-x-2 py-3 text-primary-600 hover:text-primary-700 transition-colors"
            disabled={isLoading.value || !!error.value}
          >
            <span className="text-2xl">⇅</span>
          </button>

          <div className="bg-gray-50 rounded-lg p-4 w-48">
            <p className="text-center text-3xl font-bold text-primary-600 w-full ">
              {calcularConversion()}
              <span className="text-gray-500 ml-2 text-xl">
                {modo === "peso" ? "SATS" : "PESOS"}
              </span>
            </p>
          </div>
        </div>
        <div className="text-center flex flex-col items-center">
          <p className="text-gray-600 text-sm">Tasa de cambio promedio</p>
          {isLoading.value ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded w-48 mx-auto"></div>
          ) : error.value ? (
            <p className="text-red-500">{error.value}</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-primary-600">
                1 PESO = {rates.value.satsPerPeso} SATS
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Última actualización: {ultimaActualizacion}
              </p>
            </>
          )}
        </div>
      </div>
      {!isLoading.value && !error.value && (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Cotizaciones por Exchange
          </h3>
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr className="text-neutral-500">
                        <th className="px-5 py-3 text-xs font-medium text-left uppercase">
                          Exchange
                        </th>
                        <th className="px-5 py-3 text-xs font-medium text-left uppercase">
                          ARS/SATS
                        </th>
                        <th className="px-5 py-3 text-xs font-medium text-left uppercase">
                          SATS/ARS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {rates.value.exchanges
                        ?.filter(({ price }) => price > 0 && isFinite(price))
                        .map(({ exchange, price }) => (
                          <tr key={exchange} className="text-neutral-800">
                            <td className="px-5 py-4 text-sm font-medium whitespace-nowrap capitalize">
                              {exchange}
                            </td>
                            <td className="px-5 py-4 text-sm whitespace-nowrap">
                              {(price / 100000000).toLocaleString("es-AR", {
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-5 py-4 text-sm whitespace-nowrap">
                              {(100000000 / price).toLocaleString("es-AR", {
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
