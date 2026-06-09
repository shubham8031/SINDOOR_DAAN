import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadFaceModels = async () => {
  if (modelsLoaded) return true;
  try {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    return true;
  } catch (err) {
    console.error('Face models load error:', err);
    return false;
  }
};

export const getFaceDescriptorFromFile = async (file) => {
  const loaded = await loadFaceModels();
  if (!loaded) throw new Error('Models not loaded');

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      try {
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        URL.revokeObjectURL(url);
        if (!detection) resolve(null);
        else resolve(Array.from(detection.descriptor));
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
};
