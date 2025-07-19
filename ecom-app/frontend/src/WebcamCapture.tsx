import React, { useRef, useState, useEffect } from 'react';

interface WebcamCaptureProps {
  onPhotoCapture: (file: File) => void;
  onCancel: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onPhotoCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      setError('');
      
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('Video started successfully');
                setIsReady(true);
              })
              .catch((err) => {
                console.error('Error playing video:', err);
                setError('Failed to start video');
              });
          }
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(`Camera error: ${err.message || 'Unable to access camera'}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped camera track');
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and then to File
    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().getTime();
        const file = new File([blob], `captured_id_${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: timestamp
        });
        
        setIsCapturing(true);
        onPhotoCapture(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up webcam component');
      stopCamera();
    };
  }, []); // Empty dependency array to run only once

  if (isCapturing) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Photo captured successfully!</p>
      </div>
    );
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '15px',
      backgroundColor: '#f9f9f9'
    }}>
      <h4 style={{ margin: '0 0 15px 0' }}>Take ID Card Photo</h4>
      
      {error ? (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {error}
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={startCamera}
              style={{
                padding: '5px 10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Try Again
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '5px 10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ 
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: '#000',
            borderRadius: '8px',
            padding: '10px',
            position: 'relative',
            minHeight: '300px'
          }}>
            {!isReady && !error && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontSize: '16px',
                zIndex: 10,
                textAlign: 'center'
              }}>
                <div>Loading camera...</div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                  Please allow camera access if prompted
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                maxWidth: '400px',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '4px',
                border: '2px solid #007bff',
                backgroundColor: '#000',
                display: isReady ? 'block' : 'none'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              margin: '0 0 15px 0', 
              color: '#666', 
              fontSize: '14px' 
            }}>
              Position the ID card within the camera view and click capture
            </p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={capturePhoto}
                disabled={!isReady}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isReady ? '#28a745' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isReady ? 'pointer' : 'not-allowed',
                  fontSize: '16px'
                }}
              >
                📷 Capture Photo
              </button>
              
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WebcamCapture;