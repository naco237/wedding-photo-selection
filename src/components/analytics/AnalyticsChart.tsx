import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Card } from '../ui';

interface AnalyticsData {
    date: string;
    views: number;
    selections: number;
    downloads: number;
}

interface Props {
    data?: AnalyticsData[];
    detailed?: boolean;
}

export const AnalyticsChart: React.FC<Props> = ({ data = [], detailed = false }) => {
    return (
        <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Statistiques d'utilisation</h2>
            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="views"
                            stroke="#8884d8"
                            name="Vues"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="selections"
                            stroke="#82ca9d"
                            name="Sélections"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="downloads"
                            stroke="#ffc658"
                            name="Téléchargements"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {detailed && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-purple-700 font-semibold">Total des vues</h3>
                        <p className="text-2xl text-purple-900">
                            {data.reduce((sum, item) => sum + item.views, 0)}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-green-700 font-semibold">Total des sélections</h3>
                        <p className="text-2xl text-green-900">
                            {data.reduce((sum, item) => sum + item.selections, 0)}
                        </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="text-yellow-700 font-semibold">Total des téléchargements</h3>
                        <p className="text-2xl text-yellow-900">
                            {data.reduce((sum, item) => sum + item.downloads, 0)}
                        </p>
                    </div>
                </div>
            )}
        </Card>
    );
};
