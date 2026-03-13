/**
 * Notifications list and mark read. Matches Blanc app notifications screen.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { getCurrentUserId, fetchNotifications, markNotificationRead } from '../../lib/merchant/api';
import type { Notification } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

export const MerchantNotifications: React.FC = () => {
  const { t, isZh } = useMerchantLocale();
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchNotifications(userId, { limit: 50 });
      setList(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkRead = async (notificationId: string) => {
    const ok = await markNotificationRead(notificationId);
    if (ok) {
      setList((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
      );
    }
  };

  const copyTitle = isZh ? '通知' : 'Notifications';
  const copyEmpty = isZh ? '暂无通知' : 'No notifications yet';
  const copyMarkRead = isZh ? '标记已读' : 'Mark as read';
  const copyUnread = isZh ? '未读' : 'Unread';

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <p className="font-display font-bold text-hopon-black">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-hopon-black mb-6">
        {copyTitle}
      </h1>
      {list.length === 0 ? (
        <div className="border-2 border-dashed border-black/20 p-12 text-center">
          <p className="text-black/60">{copyEmpty}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((n) => {
            const isUnread = !(n as { read_at?: string | null }).read_at;
            return (
              <li
                key={n.id}
                className={`border-2 border-black p-4 ${isUnread ? 'bg-hopon-grey/30' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    {n.title && (
                      <p className="font-display font-bold text-hopon-black truncate">{n.title}</p>
                    )}
                    {n.body && <p className="text-sm text-black/80 mt-0.5 break-words">{n.body}</p>}
                    <p className="text-xs text-black/50 mt-1">
                      {(n as { created_at?: string }).created_at
                        ? new Date((n as { created_at: string }).created_at).toLocaleString(isZh ? 'zh-CN' : 'en-US')
                        : ''}
                    </p>
                  </div>
                  {isUnread && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 px-3 py-1 border-2 border-black font-mono text-xs uppercase hover:bg-hopon-grey"
                    >
                      {copyMarkRead}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
