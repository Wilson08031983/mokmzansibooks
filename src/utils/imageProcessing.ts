/**
 * Image processing utilities for MokMzansi Books
 * Includes background removal and other image processing features
 */

import { FileWithPreview } from '@/components/invoices/FileUploader';

/**
 * Removes the background from an image using a canvas-based approach
 * This is a client-side implementation that works for images with solid backgrounds
 * For more advanced background removal, consider using a third-party API
 * 
 * @param file The file object to process
 * @returns A Promise that resolves to a new file with background removed
 */
export const removeImageBackground = async (file: FileWithPreview): Promise<FileWithPreview> => {
  try {
    // Create a temporary image element to load the file
    const img = new Image();
    
    // Create a promise to handle image loading
    const loadImagePromise = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(new Error('Failed to load image'));
      
      // Set crossOrigin to anonymous if you're loading from another domain
      img.crossOrigin = 'anonymous';
    });
    
    // Set the image source to the file's preview or create an object URL
    if (file.preview) {
      img.src = file.preview;
    } else {
      img.src = URL.createObjectURL(file);
    }
    
    // Wait for the image to load
    await loadImagePromise;
    
    // Create a canvas element to work with the image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Draw the image on the canvas
    ctx.drawImage(img, 0, 0);
    
    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Enhanced background detection approach:
    // 1. Sample multiple points from the edges (more likely to be background)
    // 2. Create a color range from these samples
    // 3. Apply more intelligent removal
    
    // Sample points from all four edges
    const edgeSamples: Array<{r: number, g: number, b: number}> = [];
    const sampleSize = 10; // Number of sample points from each edge
    const width = canvas.width;
    const height = canvas.height;
    
    // Top edge
    for (let x = 0; x < width; x += Math.floor(width / sampleSize)) {
      const i = (0 * width + x) * 4;
      edgeSamples.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2]
      });
    }
    
    // Bottom edge
    for (let x = 0; x < width; x += Math.floor(width / sampleSize)) {
      const i = ((height - 1) * width + x) * 4;
      edgeSamples.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2]
      });
    }
    
    // Left edge
    for (let y = 0; y < height; y += Math.floor(height / sampleSize)) {
      const i = (y * width + 0) * 4;
      edgeSamples.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2]
      });
    }
    
    // Right edge
    for (let y = 0; y < height; y += Math.floor(height / sampleSize)) {
      const i = (y * width + (width - 1)) * 4;
      edgeSamples.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2]
      });
    }
    
    // Find the most common color range from the samples
    // (Simple approach: average the colors and use that as the center of our range)
    let totalR = 0, totalG = 0, totalB = 0;
    edgeSamples.forEach(sample => {
      totalR += sample.r;
      totalG += sample.g;
      totalB += sample.b;
    });
    
    const avgBgColor = {
      r: Math.round(totalR / edgeSamples.length),
      g: Math.round(totalG / edgeSamples.length),
      b: Math.round(totalB / edgeSamples.length)
    };
    
    // Also calculate deviation to determine sensitivity dynamically
    let devR = 0, devG = 0, devB = 0;
    edgeSamples.forEach(sample => {
      devR += Math.abs(sample.r - avgBgColor.r);
      devG += Math.abs(sample.g - avgBgColor.g);
      devB += Math.abs(sample.b - avgBgColor.b);
    });
    
    // Base sensitivity on color deviation in the background (with a minimum value)
    const baseSensitivity = 30; // Minimum sensitivity
    const adaptiveSensitivity = Math.max(
      baseSensitivity,
      Math.round((devR + devG + devB) / (edgeSamples.length * 3) * 1.5)
    );
    
    // Apply a radial distance factor - pixels further from edges get higher threshold
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    
    // Process each pixel with enhanced logic
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate distance from center (normalized 0-1)
        const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) / maxDistance;
        
        // Adjust sensitivity based on distance from center
        // (objects tend to be in the center, background on edges)
        const distFactor = 1 - Math.min(distFromCenter * 0.7, 0.5); // Reduce sensitivity by up to 50% for center pixels
        const adjustedSensitivity = adaptiveSensitivity * distFactor;
        
        // Color difference calculation with weighted channels (human eye is more sensitive to green)
        const colorDiff = (
          Math.abs(r - avgBgColor.r) * 0.3 +
          Math.abs(g - avgBgColor.g) * 0.59 +
          Math.abs(b - avgBgColor.b) * 0.11
        );
        
        // If the pixel color is close to the average background color, make it transparent
        if (colorDiff < adjustedSensitivity) {
          // Use semi-transparency for borderline cases for smoother edges
          const transparencyFactor = Math.min(1, colorDiff / adjustedSensitivity);
          data[i + 3] = Math.round(data[i + 3] * transparencyFactor);
        }
      }
    }
    
    // Apply a subtle edge smoothing pass for better results
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] < 128) { // If mostly transparent
          // Look at the 8 surrounding pixels
          let alphaSurround = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const ni = ((y + dy) * width + (x + dx)) * 4;
              alphaSurround += data[ni + 3];
            }
          }
          alphaSurround /= 8; // Average alpha of surrounding pixels
          
          // If surrounded by opaque pixels, make this a bit more opaque for smoother edges
          if (alphaSurround > 200) {
            data[i + 3] = Math.min(data[i + 3] + 50, 255);
          }
        }
      }
    }
    
    // Put the modified image data back to the canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Convert canvas to Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to convert canvas to blob'));
      }, file.type);
    });
    
    // Create a new File object from the Blob
    const processedFile = new File([blob], file.name, { type: file.type });
    
    // Create a data URL as the preview
    const dataUrl = canvas.toDataURL(file.type);
    
    // Return a FileWithPreview object
    const resultFile = processedFile as FileWithPreview;
    resultFile.preview = dataUrl;
    
    return resultFile;
  } catch (error) {
    console.error('Error removing background:', error);
    // If anything fails, return the original file
    return file;
  }
};

/**
 * Determines if background removal should be attempted based on file type and size
 * @param file The file to check
 * @returns boolean indicating if background removal should be attempted
 */
export const shouldAttemptBackgroundRemoval = (file: File | null): boolean => {
  if (!file) return false;
  
  // Only attempt for these image types
  const supportedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  
  // Only attempt for files smaller than 5MB to prevent performance issues
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return supportedTypes.includes(file.type) && file.size < maxSize;
};
