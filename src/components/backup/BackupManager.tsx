import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Modal } from '../ui';
import api from '../../services/api';
import { notificationService } from '../../services/NotificationService';

interface Backup {
    id: string;
    filename: string;
    size: string;
    created_at: string;
    type: 'full' | 'db';
}

export const BackupManager: React.FC = () => {
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
    const queryClient = useQueryClient();

    const { data: backups, isLoading } = useQuery<Backup[]>({
        queryKey: ['backups'],
        queryFn: () => api.get('/wp-json/wedding-photo-selection/v1/admin/backups').then(res => res.data),
    });

    const createBackupMutation = useMutation({
        mutationFn: (type: 'full' | 'db') =>
            api.post('/wp-json/wedding-photo-selection/v1/admin/backups', { type }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['backups'] });
            notificationService.notify('Sauvegarde créée avec succès', {
                type: 'success',
            });
        },
    });

    const restoreBackupMutation = useMutation({
        mutationFn: (backupId: string) =>
            api.post(`/wp-json/wedding-photo-selection/v1/admin/backups/${backupId}/restore`),
        onSuccess: () => {
            setShowRestoreModal(false);
            notificationService.notify('Restauration effectuée avec succès', {
                type: 'success',
            });
        },
    });

    const deleteBackupMutation = useMutation({
        mutationFn: (backupId: string) =>
            api.delete(`/wp-json/wedding-photo-selection/v1/admin/backups/${backupId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['backups'] });
            notificationService.notify('Sauvegarde supprimée', {
                type: 'success',
            });
        },
    });

    const handleRestore = (backup: Backup) => {
        setSelectedBackup(backup);
        setShowRestoreModal(true);
    };

    const confirmRestore = () => {
        if (selectedBackup) {
            restoreBackupMutation.mutate(selectedBackup.id);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Gestionnaire de sauvegardes</h2>
                        <div className="space-x-2">
                            <Button
                                variant="secondary"
                                onClick={() => createBackupMutation.mutate('db')}
                                disabled={createBackupMutation.isPending}
                            >
                                Sauvegarde BDD
                            </Button>
                            <Button
                                onClick={() => createBackupMutation.mutate('full')}
                                disabled={createBackupMutation.isPending}
                            >
                                Sauvegarde complète
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-4">Chargement...</div>
                    ) : (
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Nom</th>
                                    <th className="px-4 py-2">Type</th>
                                    <th className="px-4 py-2">Taille</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {backups?.map((backup) => (
                                    <tr key={backup.id}>
                                        <td className="px-4 py-2">{backup.filename}</td>
                                        <td className="px-4 py-2">
                                            {backup.type === 'full' ? 'Complète' : 'Base de données'}
                                        </td>
                                        <td className="px-4 py-2">{backup.size}</td>
                                        <td className="px-4 py-2">{backup.created_at}</td>
                                        <td className="px-4 py-2">
                                            <div className="space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleRestore(backup)}
                                                >
                                                    Restaurer
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => deleteBackupMutation.mutate(backup.id)}
                                                >
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={showRestoreModal}
                onClose={() => setShowRestoreModal(false)}
                title="Confirmer la restauration"
            >
                <div className="space-y-4">
                    <p>
                        Êtes-vous sûr de vouloir restaurer cette sauvegarde ?
                        Cette action est irréversible et remplacera toutes les données actuelles.
                    </p>
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="secondary"
                            onClick={() => setShowRestoreModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmRestore}
                            disabled={restoreBackupMutation.isPending}
                        >
                            Confirmer la restauration
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
