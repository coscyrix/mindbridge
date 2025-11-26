import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CommonServices from '../../services/CommonServices';

// Query Keys - centralized for better cache management
export const queryKeys = {
  references: ['references'],
  counselors: (roleId) => ['counselors', roleId],
  services: (tenantId) => ['services', tenantId],
  clients: (params) => ['clients', params],
  clientsByCounselor: (params) => ['clientsByCounselor', params],
  sessions: ['sessions'],
  sessionsByCounselor: (params) => ['sessionsByCounselor', params],
  currentSessions: (params) => ['currentSessions', params],
  formSubmission: (params) => ['formSubmission', params],
  overallSessionsData: (params) => ['overallSessionsData', params],
  reportsTableData: (params) => ['reportsTableData', params],
  assessmentResults: (params) => ['assessmentResults', params],
  feedbackFormDetails: (params) => ['feedbackFormDetails', params],
  counselorProfile: (counselorId) => ['counselorProfile', counselorId],
  searchedCounselors: (payload) => ['searchedCounselors', payload],
  searchFilters: ['searchFilters'],
  documents: (counselorProfileId) => ['documents', counselorProfileId],
};

// ============ Query Hooks ============

/**
 * Fetch references data
 */
export const useReferences = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.references,
    queryFn: async () => {
      const response = await CommonServices.getReferences();
      return response.data;
    },
    ...options,
  });
};

/**
 * Fetch all counselors
 */
export const useCounselors = (roleId = 2, options = {}) => {
  return useQuery({
    queryKey: queryKeys.counselors(roleId),
    queryFn: async () => {
      const response = await CommonServices.getAllCounselors(roleId);
      return response.data;
    },
    ...options,
  });
};

/**
 * Fetch services
 */
export const useServices = (tenantId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.services(tenantId),
    queryFn: async () => {
      const response = await CommonServices.getServices(tenantId);
      return response.data;
    },
    ...options,
  });
};

/**
 * Fetch clients
 */
export const useClients = (params, options = {}) => {
  return useQuery({
    queryKey: queryKeys.clients(params),
    queryFn: async () => {
      const response = await CommonServices.getClients(params);
      return response.data;
    },
    enabled: !!params,
    ...options,
  });
};

/**
 * Fetch clients by counselor
 */
export const useClientsByCounselor = (params, options = {}) => {
  return useQuery({
    queryKey: queryKeys.clientsByCounselor(params),
    queryFn: async () => {
      const response = await CommonServices.getClientsByCounselor(params);
      return response.data;
    },
    enabled: !!params,
    ...options,
  });
};

/**
 * Fetch sessions
 */
export const useSessions = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: async () => {
      const response = await CommonServices.getSessions();
      return response.data;
    },
    ...options,
  });
};

/**
 * Fetch sessions by counselor
 */
export const useSessionsByCounselor = (params, options = {}) => {
  return useQuery({
    queryKey: queryKeys.sessionsByCounselor(params),
    queryFn: async () => {
      const response = await CommonServices.getSessionsByCounselor(params);
      return response.data;
    },
    enabled: !!params,
    ...options,
  });
};

/**
 * Fetch current sessions (today and tomorrow)
 */
export const useCurrentSessions = (params, options = {}) => {
  return useQuery({
    queryKey: queryKeys.currentSessions(params),
    queryFn: async () => {
      const response = await CommonServices.getCurrentSessions(params);
      return response.data;
    },
    enabled: !!params,
    ...options,
  });
};

/**
 * Fetch form submission details
 */
export const useFormSubmissionDetails = (params, options = {}) => {
  return useQuery({
    queryKey: queryKeys.formSubmission(params),
    queryFn: async () => {
      const response = await CommonServices.getFormSubmissionDetails(params);
      return response.data;
    },
    enabled: !!params,
    ...options,
  });
};

/**
 * Fetch overall sessions data (dashboard)
 */
export const useOverallSessionsData = (params, options = {}) => {
  return useQuery({
    queryKey: queryKeys.overallSessionsData(params),
    queryFn: async () => {
      const response = await CommonServices.getOverallSessionsData(params);
      return response.data;
    },
    enabled: !!params,
    ...options,
  });
};

/**
 * Fetch reports table data (dashboard)
 */
export const useReportsTableData = (params, options = {}) => {
  return useQuery({
    queryKey: queryKeys.reportsTableData(params),
    queryFn: async () => {
      const response = await CommonServices.getReportsTableData(params);
      return response.data;
    },
    enabled: !!params,
    ...options,
  });
};

/**
 * Fetch assessment results (dashboard)
 */
export const useAssessmentResults = (params, options = {}) => {
  return useQuery({
    queryKey: queryKeys.assessmentResults(params),
    queryFn: async () => {
      const response = await CommonServices.getAssessmentResults(params);
      return response.data;
    },
    enabled: !!params,
    ...options,
  });
};

/**
 * Fetch feedback form details
 */
export const useFeedbackFormDetails = (params, options = {}) => {
  return useQuery({
    queryKey: queryKeys.feedbackFormDetails(params),
    queryFn: async () => {
      const response = await CommonServices.getFeedbackFormDetails(params);
      return response.data;
    },
    enabled: !!params,
    ...options,
  });
};

/**
 * Fetch counselor profile
 */
export const useCounselorProfile = (counselorId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.counselorProfile(counselorId),
    queryFn: async () => {
      const response = await CommonServices.getCounselorProfile(counselorId);
      return response.data;
    },
    enabled: !!counselorId,
    ...options,
  });
};

/**
 * Fetch searched counselors
 */
export const useSearchedCounselors = (payload, options = {}) => {
  return useQuery({
    queryKey: queryKeys.searchedCounselors(payload),
    queryFn: async () => {
      const response = await CommonServices.getSearchedCounselors(payload);
      return response.data;
    },
    enabled: !!payload,
    ...options,
  });
};

/**
 * Fetch search filters
 */
export const useSearchFilters = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.searchFilters,
    queryFn: async () => {
      const response = await CommonServices.getSearchFilters();
      return response.data;
    },
    ...options,
  });
};

/**
 * Fetch documents
 */
export const useDocuments = (counselorProfileId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.documents(counselorProfileId),
    queryFn: async () => {
      const response = await CommonServices.getDocuments(counselorProfileId);
      return response.data;
    },
    enabled: !!counselorProfileId,
    ...options,
  });
};

// ============ Mutation Hooks ============

/**
 * Upload profile image mutation
 */
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ counselorProfileId, formData }) =>
      CommonServices.uploadProfileImage(counselorProfileId, formData),
    onSuccess: (data, variables) => {
      // Invalidate counselor profile query to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.counselorProfile(variables.counselorProfileId),
      });
    },
  });
};

/**
 * Upload license file mutation
 */
export const useUploadLicenseFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ counselorProfileId, formData }) =>
      CommonServices.uploadLicenseFile(counselorProfileId, formData),
    onSuccess: (data, variables) => {
      // Invalidate counselor profile query
      queryClient.invalidateQueries({
        queryKey: queryKeys.counselorProfile(variables.counselorProfileId),
      });
    },
  });
};

/**
 * Upload onboarding documents mutation
 */
export const useUploadOnboardingDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) =>
      CommonServices.uploadOnboardingDocuments(formData),
    onSuccess: (data, variables) => {
      // Invalidate documents query if counselorProfileId is available
      if (data?.counselorProfileId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.documents(data.counselorProfileId),
        });
      }
    },
  });
};

/**
 * Delete document mutation
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId) => CommonServices.deleteDocument(documentId),
    onSuccess: () => {
      // Invalidate all documents queries
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      });
    },
  });
};

/**
 * Submit onboarding form mutation
 */
export const useSubmitOnboardingForm = () => {
  return useMutation({
    mutationFn: (payload) => CommonServices.submitOnboardingform(payload),
  });
};

/**
 * Submit PCL5 form mutation
 */
export const useSubmitPCL5Form = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => CommonServices.submitPCL5Form(payload),
    onSuccess: () => {
      // Invalidate relevant queries after successful submission
      queryClient.invalidateQueries({ queryKey: ['formSubmission'] });
      queryClient.invalidateQueries({ queryKey: ['assessmentResults'] });
    },
  });
};

/**
 * Submit PHQ9 form mutation
 */
export const useSubmitPHQ9Form = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => CommonServices.submitPHQ9Form(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formSubmission'] });
      queryClient.invalidateQueries({ queryKey: ['assessmentResults'] });
    },
  });
};

/**
 * Submit GAD7 form mutation
 */
export const useSubmitGAD7Form = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => CommonServices.submitGAD7Form(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formSubmission'] });
      queryClient.invalidateQueries({ queryKey: ['assessmentResults'] });
    },
  });
};

/**
 * Submit IPF form mutation
 */
export const useSubmitIPFForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => CommonServices.submitIPFForm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formSubmission'] });
    },
  });
};

/**
 * Submit WHODAS form mutation
 */
export const useSubmitWHODASForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => CommonServices.submitWHODASForm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formSubmission'] });
      queryClient.invalidateQueries({ queryKey: ['assessmentResults'] });
    },
  });
};

/**
 * Submit SMART Goal form mutation
 */
export const useSubmitSMARTGoalForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => CommonServices.submitSMARTGoalForm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formSubmission'] });
    },
  });
};

/**
 * Submit Consent form mutation
 */
export const useSubmitConsentForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => CommonServices.submitConsentForm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formSubmission'] });
    },
  });
};

/**
 * Submit GAS form mutation
 */
export const useSubmitGASForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => CommonServices.submitGASForm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formSubmission'] });
      queryClient.invalidateQueries({ queryKey: ['assessmentResults'] });
    },
  });
};

