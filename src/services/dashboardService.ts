import { collection, query, where, orderBy, limit, getDocs, Timestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Activity } from './activityService';

interface DashboardMetrics {
  totalTerritories: number;
  activeRepresentatives: number;
  totalUsers: number;
  totalBranches: number;
}

export const dashboardService = {
  async getRecentActivities(tenantId: string, limitCount = 10): Promise<Activity[]> {
    try {
      const activitiesRef = collection(db, 'activities');
      const activitiesQuery = query(
        activitiesRef,
        where('tenantId', '==', tenantId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(activitiesQuery);
      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
        metadata: {
          ...doc.data().metadata,
          createdAt: doc.data().metadata?.createdAt?.toDate(),
          updatedAt: doc.data().metadata?.updatedAt?.toDate()
        }
      })) as Activity[];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  async getDashboardMetrics(tenantId: string): Promise<DashboardMetrics> {
    console.log('DashboardService - Starting to fetch metrics for tenant:', tenantId);

    try {
      // Get tenant document reference
      const tenantRef = doc(db, 'tenants', tenantId);

      // Get collections references using tenant document as parent
      const territoriesRef = collection(tenantRef, 'territories');
      const representativesRef = collection(tenantRef, 'representatives');
      const usersRef = collection(tenantRef, 'users');
      const branchesRef = collection(tenantRef, 'branches');

      console.log('DashboardService - Collection paths:', {
        territories: territoriesRef.path,
        representatives: representativesRef.path,
        users: usersRef.path,
        branches: branchesRef.path
      });

      // Create query for active representatives
      const activeRepsQuery = query(
        representativesRef,
        where('status', '==', 'active')
      );

      // Execute all queries in parallel
      const [
        territoriesSnapshot,
        activeRepsSnapshot,
        usersSnapshot,
        branchesSnapshot
      ] = await Promise.all([
        getDocs(territoriesRef),
        getDocs(activeRepsQuery),
        getDocs(usersRef),
        getDocs(branchesRef)
      ]);

      console.log('DashboardService - Collection sizes:', {
        territories: territoriesSnapshot.size,
        activeReps: activeRepsSnapshot.size,
        users: usersSnapshot.size,
        branches: branchesSnapshot.size
      });

      // Create metrics object
      const metrics: DashboardMetrics = {
        totalTerritories: territoriesSnapshot.size,
        activeRepresentatives: activeRepsSnapshot.size,
        totalUsers: usersSnapshot.size,
        totalBranches: branchesSnapshot.size
      };

      console.log('DashboardService - Final metrics:', metrics);
      return metrics;
    } catch (error) {
      console.error('DashboardService - Error fetching metrics:', error);
      throw error;
    }
  }
};
