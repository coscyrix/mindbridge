# Migration Guide: Converting to TanStack Query

This guide shows you how to convert existing components from traditional `useEffect` + `useState` patterns to TanStack Query hooks.

## Table of Contents
1. [Simple Data Fetching](#simple-data-fetching)
2. [Data Fetching with Parameters](#data-fetching-with-parameters)
3. [Form Submissions](#form-submissions)
4. [Complex State Management](#complex-state-management)
5. [Refetching and Cache Invalidation](#refetching-and-cache-invalidation)

---

## Simple Data Fetching

### ❌ Before: Traditional useEffect

```javascript
import React, { useState, useEffect } from 'react';
import CommonServices from '../services/CommonServices';
import { toast } from 'react-toastify';

function ReferencesComponent() {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setLoading(true);
        const response = await CommonServices.getReferences();
        setReferences(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to fetch references');
      } finally {
        setLoading(false);
      }
    };

    fetchReferences();
  }, []);

  const handleRefresh = () => {
    fetchReferences();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleRefresh}>Refresh</button>
      {references.map(ref => (
        <div key={ref.id}>{ref.name}</div>
      ))}
    </div>
  );
}
```

### ✅ After: TanStack Query

```javascript
import React from 'react';
import { useReferences } from '../utils/hooks';
import { toast } from 'react-toastify';

function ReferencesComponent() {
  const { 
    data: references, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useReferences({
    onError: (error) => {
      toast.error('Failed to fetch references');
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {references?.map(ref => (
        <div key={ref.id}>{ref.name}</div>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✨ 60% less code
- ✨ Automatic caching
- ✨ No memory leaks (automatic cleanup)
- ✨ Built-in refetch functionality
- ✨ Background refetching

---

## Data Fetching with Parameters

### ❌ Before: useEffect with dependencies

```javascript
import React, { useState, useEffect } from 'react';
import CommonServices from '../services/CommonServices';

function ClientsList({ counselorId }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchClients = async () => {
      if (!counselorId) return;

      try {
        setLoading(true);
        const response = await CommonServices.getClients({
          counselor_id: counselorId,
          page,
          limit: 10,
        });
        
        if (isMounted) {
          setClients(response.data.clients);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClients();

    return () => {
      isMounted = false;
    };
  }, [counselorId, page]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {clients.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
}
```

### ✅ After: TanStack Query

```javascript
import React, { useState } from 'react';
import { useClients } from '../utils/hooks';

function ClientsList({ counselorId }) {
  const [page, setPage] = useState(1);

  const { 
    data, 
    isLoading, 
    isError, 
    error,
    isPreviousData 
  } = useClients(
    { 
      counselor_id: counselorId,
      page,
      limit: 10 
    },
    { 
      enabled: !!counselorId,
      keepPreviousData: true, // Show previous page while loading
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div style={{ opacity: isPreviousData ? 0.5 : 1 }}>
        {data?.clients?.map(client => (
          <div key={client.id}>{client.name}</div>
        ))}
      </div>
      <button 
        onClick={() => setPage(p => p - 1)} 
        disabled={page === 1}
      >
        Previous
      </button>
      <button 
        onClick={() => setPage(p => p + 1)}
        disabled={isPreviousData || !data?.hasMore}
      >
        Next
      </button>
    </div>
  );
}
```

**Benefits:**
- ✨ Automatic cleanup (no isMounted flag needed)
- ✨ Conditional fetching with `enabled`
- ✨ Smooth pagination with `keepPreviousData`
- ✨ Automatic refetch when parameters change

---

## Form Submissions

### ❌ Before: Manual state management

```javascript
import React, { useState } from 'react';
import CommonServices from '../services/CommonServices';
import { toast } from 'react-toastify';

function UploadProfileImage({ counselorProfileId, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    try {
      setUploading(true);
      setError(null);
      
      const result = await CommonServices.uploadProfileImage(
        counselorProfileId,
        formData
      );
      
      toast.success('Image uploaded successfully!');
      setSelectedFile(null);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Manually trigger refetch of profile
      window.location.reload(); // Bad practice!
    } catch (err) {
      setError(err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        disabled={uploading}
      />
      <button onClick={handleUpload} disabled={!selectedFile || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </div>
  );
}
```

### ✅ After: TanStack Query Mutation

```javascript
import React, { useState } from 'react';
import { useUploadProfileImage } from '../utils/hooks';
import { toast } from 'react-toastify';

function UploadProfileImage({ counselorProfileId, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  
  const uploadMutation = useUploadProfileImage();

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    uploadMutation.mutate(
      { counselorProfileId, formData },
      {
        onSuccess: (result) => {
          toast.success('Image uploaded successfully!');
          setSelectedFile(null);
          onSuccess?.(result);
          // Cache is automatically invalidated by the mutation hook!
        },
        onError: (error) => {
          toast.error('Upload failed');
        },
      }
    );
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        disabled={uploadMutation.isLoading}
      />
      <button 
        onClick={handleUpload} 
        disabled={!selectedFile || uploadMutation.isLoading}
      >
        {uploadMutation.isLoading ? 'Uploading...' : 'Upload'}
      </button>
      {uploadMutation.isError && (
        <div className="error">{uploadMutation.error.message}</div>
      )}
    </div>
  );
}
```

**Benefits:**
- ✨ Automatic cache invalidation
- ✨ No manual page reload needed
- ✨ Built-in loading/error states
- ✨ Cleaner code

---

## Complex State Management

### ❌ Before: Multiple useEffects

```javascript
import React, { useState, useEffect } from 'react';
import CommonServices from '../services/CommonServices';

function Dashboard({ counselorId }) {
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await CommonServices.getSessions();
        setSessions(response.data);
      } catch (err) {
        setErrors(prev => ({ ...prev, sessions: err }));
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await CommonServices.getClients({ counselor_id: counselorId });
        setClients(response.data.clients);
      } catch (err) {
        setErrors(prev => ({ ...prev, clients: err }));
      }
    };
    if (counselorId) {
      fetchClients();
    }
  }, [counselorId]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await CommonServices.getReportsTableData({ counselor_id: counselorId });
        setReports(response.data);
      } catch (err) {
        setErrors(prev => ({ ...prev, reports: err }));
      }
    };
    if (counselorId) {
      fetchReports();
    }
  }, [counselorId]);

  useEffect(() => {
    // Complex loading logic
    setLoading(
      sessions.length === 0 ||
      (counselorId && clients.length === 0) ||
      (counselorId && reports.length === 0)
    );
  }, [sessions, clients, reports, counselorId]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      {/* Display data */}
    </div>
  );
}
```

### ✅ After: TanStack Query with Parallel Queries

```javascript
import React from 'react';
import { 
  useSessions, 
  useClients, 
  useReportsTableData 
} from '../utils/hooks';

function Dashboard({ counselorId }) {
  const sessionsQuery = useSessions();
  
  const clientsQuery = useClients(
    { counselor_id: counselorId },
    { enabled: !!counselorId }
  );
  
  const reportsQuery = useReportsTableData(
    { counselor_id: counselorId },
    { enabled: !!counselorId }
  );

  const isLoading = 
    sessionsQuery.isLoading || 
    clientsQuery.isLoading || 
    reportsQuery.isLoading;

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      
      {sessionsQuery.isError && (
        <div>Sessions error: {sessionsQuery.error.message}</div>
      )}
      
      {clientsQuery.isError && (
        <div>Clients error: {clientsQuery.error.message}</div>
      )}
      
      {reportsQuery.isError && (
        <div>Reports error: {reportsQuery.error.message}</div>
      )}

      {/* Display data */}
      <section>
        <h3>Sessions: {sessionsQuery.data?.length}</h3>
      </section>
      
      <section>
        <h3>Clients: {clientsQuery.data?.clients?.length}</h3>
      </section>
      
      <section>
        <h3>Reports: {reportsQuery.data?.length}</h3>
      </section>
    </div>
  );
}
```

**Benefits:**
- ✨ Parallel fetching (not sequential)
- ✨ Individual error handling
- ✨ Simpler loading state logic
- ✨ Each query manages its own state

---

## Refetching and Cache Invalidation

### ❌ Before: Manual refetch coordination

```javascript
import React, { useState, useCallback } from 'react';
import CommonServices from '../services/CommonServices';

function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await CommonServices.getSessions();
      setSessions(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCreateSession = async (sessionData) => {
    try {
      await api.post('/api/sessions', sessionData);
      // Manually refetch sessions
      await fetchSessions();
      // Also need to refetch current sessions if this component uses it
      // And any other related data...
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSession = async (sessionId, updates) => {
    try {
      await api.put(`/api/sessions/${sessionId}`, updates);
      // Manually refetch again
      await fetchSessions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### ✅ After: Automatic Cache Invalidation

```javascript
import React from 'react';
import { useSessions } from '../utils/hooks';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { queryKeys } from '../utils/hooks/useQueryHooks';
import { api } from '../utils/auth';

function SessionManagement() {
  const { data: sessions, isLoading } = useSessions();
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: (sessionData) => api.post('/api/sessions', sessionData),
    onSuccess: () => {
      // Automatically refetch all sessions queries
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      queryClient.invalidateQueries({ queryKey: ['currentSessions'] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, updates }) => 
      api.put(`/api/sessions/${sessionId}`, updates),
    onSuccess: () => {
      // Automatically refetch all affected queries
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });

  const handleCreateSession = (sessionData) => {
    createSessionMutation.mutate(sessionData);
  };

  const handleUpdateSession = (sessionId, updates) => {
    updateSessionMutation.mutate({ sessionId, updates });
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

**Benefits:**
- ✨ Automatic cache invalidation
- ✨ All queries with matching keys are updated
- ✨ No need to manually coordinate refetches
- ✨ Works across all components

---

## Step-by-Step Migration Process

### Step 1: Identify Data Fetching Logic
Look for:
- `useEffect` with API calls
- `useState` for loading, error, data
- Manual refetch functions

### Step 2: Check if Hook Exists
Check `utils/hooks/useQueryHooks.js` for an existing hook.

### Step 3: Replace with TanStack Query
- Import the hook
- Remove `useEffect`, `useState` for loading/error/data
- Handle loading and error states
- Use returned data

### Step 4: Test
- Verify data loads correctly
- Check loading states work
- Test error handling
- Verify refetching works

### Step 5: Remove Old Code
- Delete unused `useEffect` hooks
- Delete unused `useState` declarations
- Remove manual refetch functions

---

## Common Migration Patterns

### Pattern: Search with Debounce

**Before:**
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedTerm, setDebouncedTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedTerm(searchTerm);
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm]);

useEffect(() => {
  if (debouncedTerm) {
    fetchSearchResults(debouncedTerm);
  }
}, [debouncedTerm]);
```

**After:**
```javascript
import { useSearchClients } from '../utils/hooks/useAdvancedQueryPatterns';

const [searchTerm, setSearchTerm] = useState('');
const { data: results, isLoading } = useSearchClients(searchTerm, 500);
```

### Pattern: Polling/Auto-refresh

**Before:**
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    fetchCurrentSessions();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

**After:**
```javascript
const { data } = useCurrentSessions(params, {
  refetchInterval: 30000,
});
```

---

## Troubleshooting Migration Issues

### Issue: "Data is undefined on first render"
**Solution:** Use optional chaining or check loading state
```javascript
// Before: data.map(...)
// After: data?.map(...) or check isLoading first
```

### Issue: "Query not running"
**Solution:** Check if `enabled` option is blocking it
```javascript
useClients(params, { enabled: !!params });
```

### Issue: "Old data showing after mutation"
**Solution:** Ensure cache invalidation in mutation
```javascript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['clients'] });
}
```

---

## Migration Checklist

- [ ] Identify all components with data fetching
- [ ] List all API endpoints being used
- [ ] Check existing hooks in `useQueryHooks.js`
- [ ] Create new hooks if needed
- [ ] Replace `useEffect` + `useState` with query hooks
- [ ] Add loading and error handling
- [ ] Test each migrated component
- [ ] Remove old code
- [ ] Verify cache invalidation works
- [ ] Test refetching behavior
- [ ] Check DevTools for query states

---

## Need Help?

- Check `TANSTACK_QUERY_CHEATSHEET.md` for quick syntax
- See `ExampleQueryComponent.js` for component examples
- Read `useAdvancedQueryPatterns.js` for complex scenarios
- Review official docs: https://tanstack.com/query/latest

Happy migrating! 🚀

