'use client'

import { useDropzone } from 'react-dropzone'
import styles from './Dropzone.module.css'

export default function Dropzone({ onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

  return (
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
  );
}