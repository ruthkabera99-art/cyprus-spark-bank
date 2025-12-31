import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useToggleAdminRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, currentRole }: { userId: string; currentRole: string }) => {
      if (currentRole === 'admin') {
        // Demote: Remove admin role, ensure user role exists
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (deleteError) throw deleteError;

        // Ensure user has 'user' role
        const { data: existingUserRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .eq('role', 'user')
          .single();

        if (!existingUserRole) {
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'user' });
          if (insertError) throw insertError;
        }
      } else {
        // Promote: Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
