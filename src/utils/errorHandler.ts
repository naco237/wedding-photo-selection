import { toast } from 'react-toastify';

interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export const handleError = (error: any) => {
  console.error('Error occurred:', error);

  let errorMessage = 'Une erreur est survenue';

  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }

  // Afficher l'erreur à l'utilisateur
  toast.error(errorMessage, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  // Log l'erreur pour le debugging
  if (process.env.NODE_ENV !== 'production') {
    console.debug('Error details:', {
      message: errorMessage,
      stack: error.stack,
      response: error.response?.data,
    });
  }

  return errorMessage;
};
