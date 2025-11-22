import React, { createContext, useContext, useEffect, useState } from 'react';
import faceIO from '@faceio/fiojs';

const FaceIOContext = createContext();

export const useFaceIO = () => {
  const context = useContext(FaceIOContext);
  if (!context) throw new Error('useFaceIO must be used within FaceIOProvider');
  return context;
};

export const FaceIOProvider = ({ children, publicId }) => {
  const [faceio, setFaceio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initFaceIO = async () => {
      try {
        const instance = new faceIO(publicId);
        setFaceio(instance);
        setLoading(false);
      } catch (err) {
        setError('Failed to initialize FaceIO');
        setLoading(false);
        console.error(err);
      }
    };
    initFaceIO();
  }, [publicId]);

  // Error handler utility
  const handleError = (errCode) => {
    const messages = {
      'fioErrCode.PERMISSION_REFUSED': 'Camera access denied. Please allow permissions.',
      'fioErrCode.NO_FACES_DETECTED': 'No face detected. Try better lighting.',
      'fioErrCode.UNRECOGNIZED_FACE': 'Face not recognized. Enroll first.',
      'fioErrCode.PAD_ATTACK': 'Spoofing detected. Use your real face.',
      'fioErrCode.TIMEOUT': 'Timed out. Check your connection.',
    };
    const msg = messages[errCode] || 'An error occurred. Try again.';
    setError(msg);
    console.error('FaceIO Error:', errCode);
  };

  return (
    <FaceIOContext.Provider value={{ faceio, loading, error, handleError, setError }}>
      {children}
    </FaceIOContext.Provider>
  );
};