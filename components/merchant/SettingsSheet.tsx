import React from 'react';
import { Settings, Edit3, Globe, LogOut, Trash2 } from 'lucide-react';

type Props = {
  visible: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  onToggleLanguage?: () => void;
  onLogout: () => void;
  onDeleteAccount?: () => void;
  isZh?: boolean;
};

const copyZh = {
  title: '设置',
  editProfile: '编辑资料',
  language: '语言',
  logout: '退出',
  deleteAccount: '删除账号',
};

const copyEn = {
  title: 'Settings',
  editProfile: 'Edit Profile',
  language: 'Language',
  logout: 'Logout',
  deleteAccount: 'Delete Account',
};

export const SettingsSheet: React.FC<Props> = ({
  visible,
  onClose,
  onEditProfile,
  onToggleLanguage,
  onLogout,
  onDeleteAccount,
  isZh = true,
}) => {
  const t = isZh ? copyZh : copyEn;
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white border-t-2 border-black shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-black/20" />
        </div>
        <div className="px-6 pb-8">
          <h2 className="font-display font-bold text-lg uppercase tracking-tight text-hopon-black mb-4">
            {t.title}
          </h2>
          <div className="space-y-0 border-y border-black/10">
            <button
              type="button"
              onClick={() => {
                onEditProfile();
                onClose();
              }}
              className="w-full flex items-center justify-between py-4 border-b border-black/10 font-mono text-sm text-hopon-black hover:bg-hopon-grey/50 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Edit3 className="w-5 h-5" />
                {t.editProfile}
              </span>
            </button>
            {onToggleLanguage != null && (
              <button
                type="button"
                onClick={onToggleLanguage}
                className="w-full flex items-center justify-between py-4 border-b border-black/10 font-mono text-sm text-hopon-black hover:bg-hopon-grey/50 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Globe className="w-5 h-5" />
                  {t.language}
                </span>
                <span className="font-mono text-xs text-black/60">{isZh ? '中' : 'EN'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-3 py-4 border-b border-black/10 font-mono text-sm text-hopon-black hover:bg-hopon-grey/50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {t.logout}
            </button>
            {onDeleteAccount != null && (
              <button
                type="button"
                onClick={() => {
                  onDeleteAccount();
                  onClose();
                }}
                className="w-full flex items-center gap-3 py-4 font-mono text-sm text-hopon-red hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                {t.deleteAccount}
              </button>
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close"
      />
    </div>
  );
};
