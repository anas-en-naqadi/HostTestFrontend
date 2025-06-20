// src/utils/alert.ts
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const ReactSwal = withReactContent(Swal);

export function alertSuccess(title: string, text?: string) {
  return ReactSwal.fire({
    title,
    text,
    icon: 'success',
    showConfirmButton: false,
    timer: 3000  // Increased to 3 seconds for better visibility
  });
}

export function alertError(title: string, text?: string) {
  return ReactSwal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
  });
}

export function alertConfirm(
  title: string,
  text: string,
): Promise<boolean> {
  return ReactSwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
      confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    target: 'body',

    // —— BUTTON COLORS —— 
    confirmButtonColor: '#e3342f',    // red-600
    cancelButtonColor: '#6c757d',     // gray-600

   
  }).then((result) => !!result.isConfirmed);
}
