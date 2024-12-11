import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button } from '../ui';
import api from '../../services/api';

interface SystemStatus {
    php_version: string;
    wordpress_version: string;
    memory_usage: string;
    memory_limit: string;
    disk_free_space: string;
    disk_total_space: string;
    mysql_version: string;
    server_software: string;
    max_upload_size: string;
    php_extensions: string[];
    error_log: {
        size: string;
        recent_errors: string[];
    };
    cron_jobs: {
        name: string;
        next_run: string;
        last_run: string;
    }[];
}

export const SystemStatus: React.FC = () => {
    const { data: status, isLoading, refetch } = useQuery<SystemStatus>({
        queryKey: ['system-status'],
        queryFn: () => api.get('/wp-json/wedding-photo-selection/v1/admin/system').then(res => res.data),
    });

    const getStatusColor = (usage: number) => {
        if (usage > 90) return 'text-red-600';
        if (usage > 70) return 'text-yellow-600';
        return 'text-green-600';
    };

    const calculateUsagePercentage = (used: string, total: string) => {
        const usedValue = parseFloat(used);
        const totalValue = parseFloat(total);
        return (usedValue / totalValue) * 100;
    };

    return (
        <div className="space-y-6">
            {/* System Overview */}
            <Card>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">État du système</h2>
                        <Button onClick={() => refetch()}>Rafraîchir</Button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-4">Chargement...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Versions</h3>
                                <div className="space-y-2">
                                    <p>PHP: {status?.php_version}</p>
                                    <p>WordPress: {status?.wordpress_version}</p>
                                    <p>MySQL: {status?.mysql_version}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Mémoire</h3>
                                <div className="space-y-2">
                                    <p>Utilisation: {status?.memory_usage}</p>
                                    <p>Limite: {status?.memory_limit}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{
                                                width: `${calculateUsagePercentage(
                                                    status?.memory_usage || '0',
                                                    status?.memory_limit || '100'
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Espace disque</h3>
                                <div className="space-y-2">
                                    <p>Libre: {status?.disk_free_space}</p>
                                    <p>Total: {status?.disk_total_space}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{
                                                width: `${calculateUsagePercentage(
                                                    status?.disk_free_space || '0',
                                                    status?.disk_total_space || '100'
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Error Logs */}
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Journaux d'erreurs récents</h2>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-60">
                        {status?.error_log.recent_errors.map((error, index) => (
                            <div key={index} className="mb-2 font-mono text-sm">
                                {error}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Cron Jobs */}
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Tâches planifiées</h2>
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tâche</th>
                                <th className="px-4 py-2">Dernière exécution</th>
                                <th className="px-4 py-2">Prochaine exécution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {status?.cron_jobs.map((job, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2">{job.name}</td>
                                    <td className="px-4 py-2">{job.last_run}</td>
                                    <td className="px-4 py-2">{job.next_run}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* PHP Extensions */}
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Extensions PHP</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {status?.php_extensions.map((ext, index) => (
                            <div key={index} className="bg-gray-50 p-2 rounded">
                                {ext}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};
