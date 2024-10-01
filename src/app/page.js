'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import styles from './page.module.css';

export default function Home() {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionQuality, setCompressionQuality] = useState(75);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setOriginalImage(file);
    await compressImage(file, compressionQuality);
  }, [compressionQuality]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

  const applyEnhancements = async (file) => {
    return new Promise((resolve) => {
      const img = new window.Image(); // Use the native Image constructor
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Apply brightness, contrast, and saturation
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const compressImage = async (file, quality) => {
    const enhancedFile = await applyEnhancements(file);
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      quality: quality / 100,
    };

    try {
      const compressedFile = await imageCompression(enhancedFile, options);
      setCompressedImage(compressedFile);
      setCompressedSize(compressedFile.size);
    } catch (error) {
      console.error('Error compressing image:', error);
    }
  };

  useEffect(() => {
    if (originalImage) {
      compressImage(originalImage, compressionQuality);
    }
  }, [compressionQuality, originalImage, brightness, contrast, saturation]);

  const handleQualityChange = (e) => {
    setCompressionQuality(e.target.value);
  };

  const handleEnhancementChange = (type, value) => {
    switch (type) {
      case 'brightness':
        setBrightness(value);
        break;
      case 'contrast':
        setContrast(value);
        break;
      case 'saturation':
        setSaturation(value);
        break;
      default:
        break;
    }
  };

  const downloadImage = (image, type) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(image);
    link.download = `${type}_image.${image.type.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Image Compressor</h1>
        <p className={styles.subtitle}>Compress and enhance your images easily</p>
      </header>

      <main className={styles.main}>
        <div {...getRootProps()} className={styles.dropzone}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the image here ...</p>
          ) : (
            <>
              <p>Drag & drop an image here, or click to select one</p>
              <p className={styles.supportedFormats}>Supported formats: JPEG, PNG, WEBP</p>
            </>
          )}
        </div>

        {originalImage && (
          <div className={styles.imageContainer}>
            <div className={styles.imageWrapper}>
              <h3 className={styles.imageTitle}>Original Image</h3>
              <div className={styles.imageFrame}>
                <Image
                  src={URL.createObjectURL(originalImage)}
                  alt="Original"
                  width={300}
                  height={200}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <p className={styles.imageSize}>Size: {(originalImage.size / 1024).toFixed(2)} KB</p>
            </div>

            <div className={styles.imageWrapper}>
              <h3 className={styles.imageTitle}>Compressed Image</h3>
              {compressedImage && (
                <>
                  <div className={styles.imageFrame}>
                    <Image
                      src={URL.createObjectURL(compressedImage)}
                      alt="Compressed"
                      width={300}
                      height={200}
                      style={{
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  <p className={styles.imageSize}>Size: {(compressedSize / 1024).toFixed(2)} KB</p>
                </>
              )}
            </div>
          </div>
        )}

        {originalImage && (
          <div className={styles.controls}>
            <div className={styles.compressionControl}>
              <label htmlFor="quality">Compression Quality: {compressionQuality}%</label>
              <input
                type="range"
                id="quality"
                min="0"
                max="100"
                value={compressionQuality}
                onChange={handleQualityChange}
              />
            </div>

            <div className={styles.enhancementControls}>
              <div>
                <label htmlFor="brightness">Brightness: {brightness}%</label>
                <input
                  type="range"
                  id="brightness"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => handleEnhancementChange('brightness', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contrast">Contrast: {contrast}%</label>
                <input
                  type="range"
                  id="contrast"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => handleEnhancementChange('contrast', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="saturation">Saturation: {saturation}%</label>
                <input
                  type="range"
                  id="saturation"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => handleEnhancementChange('saturation', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {compressedImage && (
          <div className={styles.downloadButtons}>
            <button onClick={() => downloadImage(compressedImage, 'compressed')} className={styles.primaryButton}>
              Download Compressed Image
            </button>
            <button onClick={() => downloadImage(originalImage, 'original')} className={styles.secondaryButton}>
              Download Original Image
            </button>
          </div>
        )}
      </main>
    </div>
  );
}