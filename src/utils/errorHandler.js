export const handleSupabaseError = (error, defaultMessage = 'Une erreur est survenue') => {
        console.error('Erreur Supabase :', error);
        return error.message || defaultMessage;
      };

      export const handleApiCall = async (callback) => {
        try {
          const result = await callback();
          return { data: result, error: null };
        } catch (error) {
          return { data: null, error: handleSupabaseError(error) };
        }
      };