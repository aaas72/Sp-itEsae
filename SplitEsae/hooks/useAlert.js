import { useState } from 'react';

export const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Tamam',
    cancelText: 'İptal',
    showCancel: false,
  });

  const showAlert = (config) => {
    setAlertConfig({
      visible: true,
      title: config.title || '',
      message: config.message || '',
      type: config.type || 'info',
      confirmText: config.confirmText || 'Tamam',
      cancelText: config.cancelText || 'İptal',
      showCancel: config.showCancel || false,
      onConfirm: () => {
        hideAlert();
        if (config.onConfirm) config.onConfirm();
      },
      onCancel: () => {
        hideAlert();
        if (config.onCancel) config.onCancel();
      },
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Helper methods for different alert types
  const showSuccess = (message, title = 'Başarılı', onConfirm) => {
    showAlert({ type: 'success', title, message, onConfirm });
  };

  const showError = (message, title = 'Hata', onConfirm) => {
    showAlert({ type: 'error', title, message, onConfirm });
  };

  const showWarning = (message, title = 'Uyarı', onConfirm) => {
    showAlert({ type: 'warning', title, message, onConfirm });
  };

  const showInfo = (message, title = 'Bilgi', onConfirm) => {
    showAlert({ type: 'info', title, message, onConfirm });
  };

  const showConfirm = (message, title = 'Onayla', onConfirm, onCancel) => {
    showAlert({ 
      type: 'warning', 
      title, 
      message, 
      showCancel: true, 
      onConfirm, 
      onCancel 
    });
  };

  return {
    alertConfig,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    hideAlert,
  };
};