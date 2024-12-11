import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Tabs, Button, Modal } from '../components/ui';
import { AnalyticsChart } from '../components/analytics/AnalyticsChart';
import { ClientList } from '../components/clients/ClientList';
import { BackupManager } from '../components/backup/BackupManager';
import { SystemStatus } from '../components/system/SystemStatus';
import { notificationService } from '../services/NotificationService';
import api from '../services/api';

interface DashboardStats {
    totalClients: number;
    activeSelections: number;
    totalPhotos: number;
    diskUsage: string;
}

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: () => api.get('/wp-json/wedding-photo-selection/v1/admin/stats').then(res => res.data),
    });

    const { data: analyticsData } = useQuery({
        queryKey: ['analytics'],
        queryFn: () => api.get('/wp-json/wedding-photo-selection/v1/admin/analytics').then(res => res.data),
    });

    const sendNotification = async () => {
        try {
            await notificationService.notify(notificationMessage, {
                email: true,
                push: true,
            });
            setShowNotificationModal(false);
            setNotificationMessage('');
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tableau de bord administrateur</h1>
                <Button onClick={() => setShowNotificationModal(true)}>
                    Envoyer une notification
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <h3>Clients Total</h3>
                    <p className="text-2xl">{statsLoading ? '...' : stats?.totalClients}</p>
                </Card>
                <Card>
                    <h3>Sélections actives</h3>
                    <p className="text-2xl">{statsLoading ? '...' : stats?.activeSelections}</p>
                </Card>
                <Card>
                    <h3>Photos Total</h3>
                    <p className="text-2xl">{statsLoading ? '...' : stats?.totalPhotos}</p>
                </Card>
                <Card>
                    <h3>Espace disque</h3>
                    <p className="text-2xl">{statsLoading ? '...' : stats?.diskUsage}</p>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={[
                    { id: 'overview', label: 'Aperçu' },
                    { id: 'clients', label: 'Clients' },
                    { id: 'analytics', label: 'Analytiques' },
                    { id: 'backup', label: 'Sauvegardes' },
                    { id: 'system', label: 'Système' },
                ]}
            />

            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <AnalyticsChart data={analyticsData} />
                        <ClientList limit={5} />
                    </div>
                )}
                {activeTab === 'clients' && <ClientList />}
                {activeTab === 'analytics' && <AnalyticsChart data={analyticsData} detailed />}
                {activeTab === 'backup' && <BackupManager />}
                {activeTab === 'system' && <SystemStatus />}
            </div>

            {/* Notification Modal */}
            <Modal
                isOpen={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                title="Envoyer une notification"
            >
                <div className="space-y-4">
                    <textarea
                        className="w-full p-2 border rounded"
                        rows={4}
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        placeholder="Message de notification..."
                    />
                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
                            Annuler
                        </Button>
                        <Button onClick={sendNotification}>
                            Envoyer
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};