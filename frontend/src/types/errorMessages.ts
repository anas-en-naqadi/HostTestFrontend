export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  UPLOAD = 'upload',
  FILE_SIZE = 'file_size',
  FILE_TYPE = 'file_type',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

export const errorMessages = {
  [ErrorType.VALIDATION]: {
    title: 'Validation Error',
    message: 'Please check the form for missing or invalid fields.',
    description: 'Some required fields are missing or contain invalid data. Please review the form and try again.'
  },
  [ErrorType.NETWORK]: {
    title: 'Network Error',
    message: 'Failed to connect to the server.',
    description: 'Please check your internet connection and try again. If the problem persists, please contact support.'
  },
  [ErrorType.UPLOAD]: {
    title: 'Upload Error',
    message: 'Failed to upload files.',
    description: 'There was an issue uploading your files. Please check your internet connection and try again.'
  },
  [ErrorType.FILE_SIZE]: {
    title: 'File Size Error',
    message: 'File size exceeds limit.',
    description: 'The file you selected is too large. Please choose a smaller file or compress the current one.'
  },
  [ErrorType.FILE_TYPE]: {
    title: 'File Type Error',
    message: 'Unsupported file type.',
    description: 'Please upload a file with one of the supported formats: .mp4, .webm, .ogg, .mov, .mkv'
  },
  [ErrorType.SERVER]: {
    title: 'Server Error',
    message: 'Server encountered an error.',
    description: 'The server encountered an unexpected error. Please try again later. If the problem persists, contact support.'
  },
  [ErrorType.TIMEOUT]: {
    title: 'Timeout Error',
    message: 'Request timed out.',
    description: 'The request took too long to complete. Please check your internet connection and try again.'
  },
  [ErrorType.UNKNOWN]: {
    title: 'Unknown Error',
    message: 'An unexpected error occurred.',
    description: 'An unexpected error occurred. Please try again. If the problem persists, contact support.'
  }
};
