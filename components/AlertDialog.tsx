import React from 'react';
import { Language, t } from '../utils/i18n';
import type { AlertDialogState } from '../types/alertDialog';

export type { AlertDialogState };

interface Props {
  dialog: AlertDialogState;
  language: Language;
  onClose: () => void;
}

const AlertDialog: React.FC<Props> = ({ dialog, language, onClose }) => {
  if (!dialog.isOpen) return null;

  const titleClass =
    dialog.type === 'error'
      ? 'text-red-600'
      : dialog.type === 'success'
        ? 'text-green-600'
        : 'text-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
        <h3 className={`text-lg font-bold mb-2 ${titleClass}`}>{dialog.title}</h3>
        <p className="text-slate-600 mb-6 whitespace-pre-line">{dialog.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800"
        >
          {t(language).common.confirm}
        </button>
      </div>
    </div>
  );
};

export default AlertDialog;
