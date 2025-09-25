import { useEffect, useState } from "react";
import Header from "../HeaderComponent";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [gasometers, setGasometers] = useState([]);
  const [readings, setReadings] = useState([]);
  const [filteredReadings, setFilteredReadings] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysFilter, setDaysFilter] = useState(7); // filtro fixo padrão

  // Fetch gasometers
  useEffect(() => {
    fetch("http://localhost:8000/api/gasometros/")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setGasometers(data))
      .catch((err) => console.error("Fetch error (gasometers):", err));
  }, []);

  // Fetch readings
  useEffect(() => {
    fetch("http://localhost:8000/api/leituras/")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setReadings(data);
        setFilteredReadings(data);
      })
      .catch((err) => console.error("Fetch error (readings):", err));
  }, []);

  // Filtro customizado de datas (inputs From/To)
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredReadings(readings);
      return;
    }
    const filtered = readings.filter(
      (r) => r.data_leitura >= startDate && r.data_leitura <= endDate
    );
    setFilteredReadings(filtered);
  }, [startDate, endDate, readings]);

  // Filtro fixo para cards de resumo
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - daysFilter);

  const filteredByDays = readings.filter(
    (r) => r.data_leitura >= pastDate.toISOString().slice(0, 10) && r.data_leitura <= today.toISOString().slice(0, 10)
  );

  const totalFilteredReadings = filteredByDays.length;
  const uniqueGasometers = new Set(filteredByDays.map((r) => r.gasometro)).size;
  const averagePerDay = totalFilteredReadings / daysFilter;

  // Preparar dados do gráfico (agrupando por data)
  const chartData = filteredReadings.reduce((acc, r) => {
    const day = r.data_leitura;
    const value = parseFloat(r.consumo_m3);

    const existing = acc.find((e) => e.date === day);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ date: day, value });
    }

    return acc;
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[rgb(15,15,30)] via-[rgb(30,30,60)] to-[rgb(50,10,80)] text-white">
      <Header />

      <main className="p-8 flex-1 overflow-auto">

        {/* Filtro fixo */}
        <div className="flex gap-4 mb-6">
          {[7, 15, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDaysFilter(d)}
              className={`px-4 py-2 rounded-lg font-bold transition-colors hover:cursor-pointer ${
                daysFilter === d
                  ? "bg-purple-600 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Last {d} days
            </button>
          ))}
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-md">
            <p className="text-sm">Total Gasometers</p>
            <p className="text-2xl font-bold">{uniqueGasometers}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-md">
            <p className="text-sm">Total Readings</p>
            <p className="text-2xl font-bold">{totalFilteredReadings}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-md">
            <p className="text-sm">Average per Day</p>
            <p className="text-2xl font-bold">{averagePerDay.toFixed(2)}</p>
          </div>
        </div>

        {/* Cards de Gasômetros */}
        <h2 className="text-xl font-semibold mb-4">Gasometers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {gasometers.map((g) => (
            <div
              key={g.id}
              className="bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-md hover:scale-105 transition-transform"
            >
              <p className="text-sm text-gray-300">Código</p>
              <p className="text-lg font-bold text-white mb-2">{g.codigo}</p>
              <p className="text-sm text-gray-400">{g.apartamento_info}</p>
            </div>
          ))}
        </div>

        {/* Filtros de período customizado */}
        <div className="flex gap-4 mb-6">
          <label className="flex flex-col text-gray-300">
            From:
            <input
              type="date"
              className="px-3 py-2 rounded-lg text-black bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="flex flex-col text-gray-300">
            To:
            <input
              type="date"
              className="px-3 py-2 rounded-lg text-black bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>

        {/* Gráfico de consumo */}
        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-md">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
