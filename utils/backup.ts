import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { AppState } from '../types';
import { loadData, saveData } from './storage';

const BACKUP_VERSION = 1;

interface BackupData {
  version: number;
  timestamp: string;
  appName: string;
  data: AppState;
}

export const createBackup = (): BackupData => {
  return {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    appName: 'notebk',
    data: loadData()
  };
};

export const validateBackup = (backup: unknown): backup is BackupData => {
  if (!backup || typeof backup !== 'object') return false;

  const b = backup as Record<string, unknown>;

  return (
    b.appName === 'notebk' &&
    typeof b.version === 'number' &&
    b.data !== null &&
    typeof b.data === 'object'
  );
};

export const generateBackupFilename = (): string => {
  const date = new Date().toISOString().split('T')[0];
  return `notebk-backup-${date}.json`;
};

export const exportBackup = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const backup = createBackup();
    const jsonString = JSON.stringify(backup, null, 2);
    const filename = generateBackupFilename();

    if (Capacitor.isNativePlatform()) {
      // En Android: usar Share API
      // Crear un data URL para compartir
      const base64 = btoa(unescape(encodeURIComponent(jsonString)));
      const dataUrl = `data:application/json;base64,${base64}`;

      const canShare = await Share.canShare();

      if (canShare.value) {
        await Share.share({
          title: 'Backup de notebk',
          text: jsonString,
          dialogTitle: 'Guardar backup'
        });
      } else {
        // Fallback: copiar al clipboard
        await navigator.clipboard.writeText(jsonString);
        return { success: true, error: 'Backup copiado al portapapeles' };
      }
    } else {
      // En Web: descargar directamente
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return { success: true };
  } catch (error) {
    console.error('Error al exportar backup:', error);
    return { success: false, error: 'Error al exportar el backup' };
  }
};

export const importBackup = (file: File): Promise<{ success: boolean; data?: AppState; error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);

        if (!validateBackup(backup)) {
          resolve({ success: false, error: 'Archivo de backup inválido o corrupto' });
          return;
        }

        resolve({ success: true, data: backup.data });
      } catch {
        resolve({ success: false, error: 'Error al leer el archivo JSON' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Error al leer el archivo' });
    };

    reader.readAsText(file);
  });
};

export const applyBackup = (data: AppState): void => {
  saveData(data);
};
