const STORAGE_KEY = 'nvp_offline_pending_mutations';

/**
 * Get all pending offline mutations
 */
export const getPendingMutations = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Save pending mutation to queue when offline
 */
export const addPendingMutation = (mutation) => {
  try {
    const current = getPendingMutations();
    const newItem = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      url: mutation.url,
      method: (mutation.method || 'post').toLowerCase(),
      data: mutation.data || {},
      title: mutation.title || `Offline action (${mutation.method?.toUpperCase() || 'POST'})`
    };
    current.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('nvp_offline_mutation_change', { detail: { count: current.length, item: newItem } }));
    return newItem;
  } catch (e) {
    console.error('[Offline Queue] Error adding mutation:', e);
    return null;
  }
};

/**
 * Remove specific mutation from queue
 */
export const removePendingMutation = (id) => {
  try {
    const current = getPendingMutations();
    const filtered = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('nvp_offline_mutation_change', { detail: { count: filtered.length } }));
  } catch (e) {}
};

/**
 * Clear all pending mutations
 */
export const clearPendingMutations = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('nvp_offline_mutation_change', { detail: { count: 0 } }));
  } catch (e) {}
};

/**
 * Sync all queued offline mutations when internet comes back online
 */
export const syncPendingMutations = async (axiosInstance) => {
  const mutations = getPendingMutations();
  if (!mutations || mutations.length === 0) return { synced: 0, failed: 0 };

  console.log(`[Offline Sync] Starting sync for ${mutations.length} queued mutations...`);
  window.dispatchEvent(new CustomEvent('nvp_offline_sync_started', { detail: { total: mutations.length } }));

  let syncedCount = 0;
  let failedCount = 0;

  for (const item of mutations) {
    try {
      console.log(`[Offline Sync] Replaying: ${item.method.toUpperCase()} ${item.url}`, item.data);
      await axiosInstance({
        url: item.url,
        method: item.method,
        data: item.data,
        headers: {
          'x-offline-replayed': 'true'
        }
      });

      removePendingMutation(item.id);
      syncedCount++;
    } catch (err) {
      console.error(`[Offline Sync Error] Failed to replay ${item.url}:`, err.message);
      // If server returns 400 or 404 (invalid payload), remove to avoid infinite loop
      if (err.response && (err.response.status === 400 || err.response.status === 404)) {
        removePendingMutation(item.id);
      }
      failedCount++;
    }
  }

  // Clear offline GET cache so fresh server data is fetched
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nvp_offline_cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('nvp_offline_sync_completed', {
    detail: { synced: syncedCount, failed: failedCount }
  }));

  return { synced: syncedCount, failed: failedCount };
};
