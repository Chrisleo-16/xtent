
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';

export type ProfileWithRole = Tables<'profiles'> & {
  primary_role: 'landlord' | 'tenant' | 'caretaker' | 'vendor' | 'admin' | null;
};

// Fetch user profile including primary role
const fetchUserProfile = async (userId: string): Promise<ProfileWithRole | null> => {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) throw new Error(error.message);
    if (!profile) return null;

    const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_primary_role', { _user_id: userId });

    if (roleError) throw new Error(roleError.message);
    
    return { ...profile, primary_role: roleData };
};

// Fetch uploaded verification documents
const fetchVerificationDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from('verification_documents')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw new Error(error.message);
  return data;
};

// Upload a verification document
const uploadVerificationDocument = async ({ file, documentType, userId }: { file: File, documentType: string, userId: string }) => {
  const filePath = `${userId}/${documentType}/${file.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('verification_documents')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error: dbError } = await supabase
    .from('verification_documents')
    .upsert({ user_id: userId, document_type: documentType, file_path: filePath }, { onConflict: 'user_id, document_type' })
    .select()
    .single();
  
  if (dbError) throw new Error(dbError.message);
  return data;
};

// Delete a verification document
const deleteVerificationDocument = async (documentId: string, filePath: string) => {
    const { error: storageError } = await supabase.storage
        .from('verification_documents')
        .remove([filePath]);
    if (storageError) {
        console.error("Error deleting from storage:", storageError.message);
    }

    const { error: dbError } = await supabase
        .from('verification_documents')
        .delete()
        .eq('id', documentId);
    
    if (dbError) throw new Error(dbError.message);
};

// Request verification
const requestVerification = async () => {
  const { error } = await supabase.rpc('request_verification');
  if (error) throw new Error(error.message);
};

export const useVerification = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => user ? fetchUserProfile(user.id) : null,
    enabled: !!user,
  });

  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['verificationDocuments', user?.id],
    queryFn: () => user ? fetchVerificationDocuments(user.id) : [],
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadVerificationDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationDocuments', user?.id] });
      toast({ title: "Success", description: "Document uploaded successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to upload document: ${error.message}`, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ documentId, filePath }: { documentId: string, filePath: string }) => deleteVerificationDocument(documentId, filePath),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['verificationDocuments', user?.id] });
        toast({ title: "Success", description: "Document deleted successfully." });
    },
    onError: (error) => {
        toast({ title: "Error", description: `Failed to delete document: ${error.message}`, variant: 'destructive' });
    },
  });

  const requestVerificationMutation = useMutation({
    mutationFn: requestVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      toast({ title: "Success", description: "Verification request submitted. We will review your documents shortly." });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to submit request: ${error.message}`, variant: 'destructive' });
    },
  });

  return {
    profile,
    isLoadingProfile,
    documents,
    isLoadingDocuments,
    uploadDocument: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deleteDocument: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    requestVerification: requestVerificationMutation.mutate,
    isSubmitting: requestVerificationMutation.isPending,
  };
};
