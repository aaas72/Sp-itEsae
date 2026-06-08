import { useState, useEffect, useCallback } from 'react';
import { activitiesAPI } from '../utils/api';
import { useAlert } from './useAlert';

export const useActivities = (groupId = null) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const { showAlert } = useAlert();

  const fetchActivities = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      }
      setError(null);

      let response;
      if (groupId) {
        response = await activitiesAPI.getGroupActivities(groupId, pageNum, 20);
      } else {
        response = await activitiesAPI.getUserActivities(pageNum, 20);
      }

      if (response.success) {
        const newActivities = response.data.activities || [];
        
        if (pageNum === 1) {
          setActivities(newActivities);
        } else {
          setActivities(prev => [...prev, ...newActivities]);
        }
        
        setHasMore(newActivities.length === 20);
        setPage(pageNum);
      } else {
        throw new Error(response.message || 'Aktiviteler getirilemedi');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.message);
      
      if (pageNum === 1) {
        showAlert(
          'Hata',
          'Aktiviteler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
          [{ text: 'Tamam', style: 'default' }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, showAlert]);

  const fetchRecentActivities = useCallback(async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await activitiesAPI.getRecentActivities(groupId);
      
      if (response.success) {
        setActivities(response.data.activities || []);
      } else {
        throw new Error(response.message || 'Son aktiviteler getirilemedi');
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      setError(err.message);
      showAlert(
        'Hata',
        'Aktiviteler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  }, [groupId, showAlert]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchActivities(page + 1);
    }
  }, [loading, hasMore, page, fetchActivities]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchActivities(1, true);
  }, [fetchActivities]);

  const getActivityById = useCallback(async (activityId) => {
    try {
      const response = await activitiesAPI.getActivityById(activityId);
      
      if (response.success) {
        return response.data.activity;
      } else {
        throw new Error(response.message || 'Aktivite detayları getirilemedi');
      }
    } catch (err) {
      console.error('Error fetching activity by ID:', err);
      showAlert(
        'Hata',
        'Aktivite detayları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam', style: 'default' }]
      );
      throw err;
    }
  }, [showAlert]);

  // Initial load
  useEffect(() => {
    if (groupId) {
      fetchActivities(1);
    }
  }, [groupId]);

  return {
    activities,
    loading,
    refreshing,
    hasMore,
    error,
    fetchActivities,
    fetchRecentActivities,
    loadMore,
    refresh,
    getActivityById,
  };
};

export default useActivities;