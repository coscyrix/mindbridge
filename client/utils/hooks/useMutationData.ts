import {
  Mutation,
  MutationFunction,
  MutationKey,
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useMutationData = (
  mutationKey: MutationKey,
  mutationFn: MutationFunction<any, any>,
  queryKey?: string | string[], 
  onSuccess?: () => void
) => {
  const client = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey,
    mutationFn,
    onSuccess(data) {
      if (onSuccess) {
        onSuccess();
        return;
      }
      
      // Show success or error toast based on response status
      if (data?.status === 200 || data?.status === 201) {
        toast.success(data?.data?.message || data?.data || "Operation successful");
      } else {
        toast.error(data?.data?.message || data?.data || "Operation failed");
      }
    },
    onError(error: any) {
      // Handle error responses
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "An error occurred";
      toast.error(errorMessage);
    },
    onSettled: async () => {
      // Invalidate and refetch queries when mutation succeeds or fails
      if (queryKey) {
        // Handle both single string and array of strings
        const queryKeys = Array.isArray(queryKey) ? queryKey : [queryKey];
        
        // Invalidate all specified query keys
        await Promise.all(
          queryKeys.map((key) => client.invalidateQueries({ queryKey: [key] }))
        );
      }
    },
  });

  return { mutate, isPending };
};

export const useMutationDataState = (mutationKey: MutationKey) => {
  const data = useMutationState({
    filters: { mutationKey },
    select: (mutation) => {
      return {
        variables: mutation.state.variables as any,
        status: mutation.state.status,
      };
    },
  });

  const latestVariables = data[data.length - 1];
  return { latestVariables };
};
