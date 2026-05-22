import api from './api';

export function esArchivoAudioValido(file: File): boolean {
  if (file.type.startsWith('audio/') || file.type === 'video/mp4') return true;
  return /\.(webm|mp4|m4a|mp3|wav|ogg|mpeg)$/i.test(file.name);
}

export const speechService = {
  transcribe: async (audio: Blob | File): Promise<{ text: string }> => {
    const formData = new FormData();
    const nombre = audio instanceof File ? audio.name : 'audio.webm';
    formData.append('audio', audio, nombre);

    const response = await api.post<{ texto?: string; text?: string }>(
      '/speech/transcribe',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    const data = response.data;
    return { text: (data.texto ?? data.text ?? '').trim() };
  },
};