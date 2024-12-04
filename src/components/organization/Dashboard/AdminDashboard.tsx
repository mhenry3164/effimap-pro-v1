import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../dashboard/DashboardLayout';
import { DashboardMetrics } from '../../dashboard/DashboardMetrics';
import { DashboardMap } from '../../dashboard/DashboardMap';
import { RecentActivityFeed } from '../../dashboard/RecentActivityFeed';
import { QuickActions } from '../../dashboard/QuickActions';
import { UsageStats } from '../../dashboard/UsageStats';
import { useAuth } from '../../../hooks/useAuth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Container, Box } from '@mui/material';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalTerritories: 0,
    activeTerritories: 0,
    totalUsers: 0,
    totalBranches: 0
  });
  const [activities, setActivities] = useState([]);
  const [usage, setUsage] = useState({
    territoriesUsed: 0,
    territoriesLimit: 100,
    usersActive: 0,
    usersLimit: 50,
    storageUsed: 0,
    storageLimit: 5 * 1024 * 1024 * 1024 // 5GB
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.tenantId) return;

      try {
        // Fetch metrics
        const territoriesRef = collection(db, 'territories');
        const territoriesQuery = query(territoriesRef, where('tenantId', '==', user.tenantId));
        const territoriesSnap = await getDocs(territoriesQuery);
        
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, where('tenantId', '==', user.tenantId));
        const usersSnap = await getDocs(usersQuery);
        
        const branchesRef = collection(db, 'branches');
        const branchesQuery = query(branchesRef, where('tenantId', '==', user.tenantId));
        const branchesSnap = await getDocs(branchesQuery);

        setMetrics({
          totalTerritories: territoriesSnap.size,
          activeTerritories: territoriesSnap.docs.filter(doc => doc.data().status === 'active').length,
          totalUsers: usersSnap.size,
          totalBranches: branchesSnap.size
        });

        // Fetch recent activities
        const activitiesRef = collection(db, 'activities');
        const activitiesQuery = query(
          activitiesRef,
          where('tenantId', '==', user.tenantId),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const activitiesSnap = await getDocs(activitiesQuery);
        
        setActivities(
          activitiesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate()
          }))
        );

        // Set usage stats
        setUsage(prev => ({
          ...prev,
          territoriesUsed: territoriesSnap.size,
          usersActive: usersSnap.size,
          // You might want to calculate actual storage used if you're storing files
          storageUsed: 1024 * 1024 * 100 // Example: 100MB
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user?.tenantId]);

  return (
    <DashboardLayout>
      <Container maxWidth={false} sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Metrics Section */}
          <Box>
            <DashboardMetrics metrics={metrics} />
          </Box>

          {/* Main Content Section */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Left Column - Map and Quick Actions */}
            <Box sx={{ 
              flex: '1 1 auto',
              minWidth: 0, // Prevents flex items from overflowing
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2
            }}>
              {/* Map Container */}
              <Box sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                boxShadow: 1,
                overflow: 'hidden',
                height: { xs: 400, md: 450 }
              }}>
                <DashboardMap />
              </Box>

              {/* Quick Actions Container */}
              <Box sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                boxShadow: 1,
                p: 2
              }}>
                <QuickActions />
              </Box>
            </Box>

            {/* Right Column - Activity Feed and Usage Stats */}
            <Box sx={{ 
              width: { xs: '100%', md: '380px' },
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2
            }}>
              {/* Activity Feed Container */}
              <Box sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                boxShadow: 1,
                p: 2,
                height: { xs: 'auto', md: '400px' },
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <RecentActivityFeed activities={activities} />
              </Box>

              {/* Usage Stats Container */}
              <Box sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                boxShadow: 1,
                p: 2
              }}>
                <UsageStats usage={usage} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default AdminDashboard;
