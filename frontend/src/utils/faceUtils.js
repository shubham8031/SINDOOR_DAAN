import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadFaceModels = async () => {
  if (modelsLoaded) return;
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
};

export const getFaceDescriptor = async (imageElement) => {
  await loadFaceModels();
  const detection = await faceapi
    .detectSingleFace(imageElement)
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!detection) return null;
  return Array.from(detection.descriptor);
};

export const getFaceDescriptorFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      try {
        const descriptor = await getFaceDescriptor(img);
        URL.revokeObjectURL(url);
        resolve(descriptor);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
};
