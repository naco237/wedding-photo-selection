import { useState, useEffect } from 'react';
import { AdminSettings } from '../types';
import { adminService } from '../services/adminService';

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSettings();
      setSettings(data);
    } catch (err) {
      setError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AdminSettings>) => {
    try {
      setLoading(true);
      await adminService.updateSettings(newSettings);
      await loadSettings();
    } catch (err) {
      setError('Erreur lors de la mise à jour des paramètres');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
};