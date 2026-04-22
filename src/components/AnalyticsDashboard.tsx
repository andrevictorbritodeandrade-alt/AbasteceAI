import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  name: string;
  gasto: number;
  consumo: number;
}

interface AnalyticsDashboardProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-white mb-2">{label}</p>
        <p className="text-gasolina">Gasto: R$ {payload[0].value.toFixed(2)}</p>
        <p className="text-etanol">Consumo: {payload[1]?.value.toFixed(1)} km/L</p>
      </div>
    );
  }
  return null;
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  if (data.length < 2) {
    return (
      <div className="text-center text-gray-500 py-12 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
        <h3 className="text-lg font-semibold text-white">Dados insuficientes para análise</h3>
        <p className="mt-2">Adicione abastecimentos de meses diferentes para ver as tendências.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/30 p-4 rounded-2xl border border-gray-800">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              yAxisId="left"
              stroke="#9CA3AF" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `R$${value}`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#9CA3AF" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}km/L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="gasto" 
              name="Gasto (R$)"
              stroke="#991b1b" 
              strokeWidth={3} 
              dot={{ fill: '#991b1b', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="consumo" 
              name="Consumo (km/L)"
              stroke="#16a34a" 
              strokeWidth={3} 
              dot={{ fill: '#16a34a', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
