import api from './api';

export const speechService = {
  transcribe: async (audioBlob: Blob): Promise<{ text: string }> => {
    const formData = new FormData();

    formData.append('audio', audioBlob, 'audio.webm');

    const response = await api.post('/speech/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};