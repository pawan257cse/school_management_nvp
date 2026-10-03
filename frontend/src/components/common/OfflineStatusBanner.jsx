import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { getPendingMutations, syncPendingMutations } from '../../utils/offlineSync';
import API from '../../services/api';

export default function OfflineStatusBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(getPendingMutations().length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // { type: 'success'|'error', text: '' }

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleMutationChange = (e) => {
      setPendingCount(e.detail?.count ?? getPendingMutations().length);
    };

    const handleSyncStarted = () => {
      setIsSyncing(true);
    };

    const handleSyncCompleted = (e) => {
      setIsSyncing(false);
      const synced = e.detail?.synced || 0;
      if (synced > 0) {
        setSyncStatus({ type: 'success', text: `Successfully synced ${synced} offline updates!` });
        setTimeout(() => setSyncStatus(null), 5000);
      }
      setPendingCount(getPendingMutations().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('nvp_offline_mutation_change', handleMutationChange);
    window.addEventListener('nvp_offline_sync_started', handleSyncStarted);
    window.addEventListener('nvp_offline_sync_completed', handleSyncCompleted);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('nvp_offline_mutation_change', handleMutationChange);
      window.removeEventListener('nvp_offline_sync_started', handleSyncStarted);
      window.removeEventListener('nvp_offline_sync_completed', handleSyncCompleted);
    };
  }, []);

  const triggerSync = async () => {
    if (isSyncing || getPendingMutations().length === 0) return;
    setIsSyncing(true);
    try {
      await syncPendingMutations(API);
    } catch (e) {
    } finally {
      setIsSyncing(false);
    }
  };

  // If online and no pending items and no sync status, show nothing
  if (isOnline && pendingCount === 0 && !isSyncing && !syncStatus) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full px-4 sm:px-0 transition-all duration-300 transform translate-y-0">
      {/* Offline Status Card */}
      {!isOnline && (
        <div className="bg-amber-900/95 backdrop-blur-md text-amber-100 border border-amber-600/50 shadow-2xl rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-amber-200">Offline Mode Active</p>
              <p className="text-amber-300/80 text-[11px] leading-tight">
                Showing cached data. {pendingCount > 0 ? `${pendingCount} update(s) saved locally.` : 'New entries will save locally.'}
              </p>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-[11px] font-semibold whitespace-nowrap">
              {pendingCount} Pending
            </span>
          )}
        </div>
      )}

      {/* Syncing Status Card */}
      {isOnline && isSyncing && (
        <div className="bg-blue-900/95 backdrop-blur-md text-blue-100 border border-blue-600/50 shadow-2xl rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-blue-300 animate-spin" />
            <div>
              <p className="font-bold text-blue-100">Syncing Offline Updates...</p>
              <p className="text-blue-300/80 text-[11px]">Uploading changes to NVP Server</p>
            </div>
          </div>
        </div>
      )}

      {/* Online Sync Pending Card */}
      {isOnline && !isSyncing && pendingCount > 0 && !syncStatus && (
        <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="font-bold text-slate-100">Internet Reconnected</p>
              <p className="text-slate-400 text-[11px]">{pendingCount} offline update(s) ready to sync</p>
            </div>
          </div>
          <button
            onClick={triggerSync}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Now
          </button>
        </div>
      )}

      {/* Sync Status Toast */}
      {syncStatus && (
        <div className="bg-emerald-950/95 backdrop-blur-md text-emerald-100 border border-emerald-600/50 shadow-2xl rounded-xl p-3.5 flex items-center gap-2.5 text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncStatus.text}</span>
        </div>
      )}
    </div>
  );
}
