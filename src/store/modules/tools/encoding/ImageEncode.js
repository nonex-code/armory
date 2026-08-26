import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useImageEncodeStore = defineStore('imageEncode', () => {
  const processing = ref(false);
  const errorMessage = ref('');
  const base64Output = ref('');
  const decodedImage = ref('');
  const isEncodeMode = ref(true);
  const imagePreview = ref('');
  const base64Input = ref('');
  const imageInfo = ref(null);
  const outputFormat = ref('png');
  const includeDataPrefix = ref(true);
  
  const supportedFormats = ref([
    { value: 'png', label: 'PNG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'webp', label: 'WebP' }
    // 注意：浏览器 canvas 不支持 GIF 编码，故不提供 GIF 输出选项
  ]);

  const isProcessing = computed(() => processing.value);
  const hasError = computed(() => errorMessage.value.length > 0);
  const hasOutput = computed(() => base64Output.value || decodedImage.value);
  const currentMode = computed(() => isEncodeMode.value ? 'encode' : 'decode');
  const canProcess = computed(() => {
    if (currentMode.value === 'encode') {
      return imagePreview.value && !processing.value;
    } else {
      return base64Input.value.trim() && !processing.value;
    }
  });

  const setError = (message) => {
    errorMessage.value = message;
  };

  const clearError = () => {
    errorMessage.value = '';
  };

  const clearOutput = () => {
    base64Output.value = '';
    decodedImage.value = '';
    imageInfo.value = null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageInfo = (file, dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          aspectRatio: img.height > 0 ? (img.width / img.height).toFixed(2) : '—',
          formattedSize: formatFileSize(file.size)
        });
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  };

  const encodeImage = async (imageDataUrl, file) => {
    processing.value = true;
    clearError();
    
    try {
      if (file) {
        imageInfo.value = await getImageInfo(file, imageDataUrl);
      }
      
      if (outputFormat.value !== 'png' || !includeDataPrefix.value) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageDataUrl;
        });
        
        // 超大图片防护：canvas 尺寸过大会耗尽内存
        if (img.width * img.height > 160 * 1024 * 1024) {
          throw new Error('图片像素尺寸过大（超过1.6亿像素），已拒绝编码');
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const mimeType = `image/${outputFormat.value}`;
        const quality = outputFormat.value === 'jpeg' ? 0.92 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        if (includeDataPrefix.value) {
          base64Output.value = dataUrl;
        } else {
          base64Output.value = dataUrl.split(',')[1] || dataUrl;
        }
      } else {
        base64Output.value = imageDataUrl;
      }
      
      decodedImage.value = '';
    } catch (error) {
      setError(`编码失败: ${error.message}`);
      base64Output.value = '';
    } finally {
      processing.value = false;
    }
  };

  const decodeBase64 = async (base64String) => {
    processing.value = true;
    clearError();
    
    try {
      if (!isValidImageBase64(base64String)) {
        throw new Error('无效的图片Base64字符串');
      }
      
      let imageDataUrl = base64String.trim();
      if (!imageDataUrl.startsWith('data:image/')) {
        // 无前缀时按文件头魔数推断真实图片类型
        const mimeType = guessImageMimeType(imageDataUrl);
        imageDataUrl = `data:${mimeType};base64,${imageDataUrl}`;
      }
      
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('无法加载图片，请检查Base64字符串是否正确'));
        img.src = imageDataUrl;
      });
      
      // 超大图片防护：防止解压炸弹（尺寸极大而文件很小）
      if (img.width * img.height > 160 * 1024 * 1024) {
        throw new Error('图片像素尺寸过大（超过1.6亿像素），已拒绝解码');
      }
      
      decodedImage.value = imageDataUrl;
      base64Output.value = '';
      
      imageInfo.value = {
        width: img.width,
        height: img.height,
        aspectRatio: img.height > 0 ? (img.width / img.height).toFixed(2) : '—',
        type: imageDataUrl.match(/data:image\/([^;]+)/)?.[1] || 'unknown'
      };
    } catch (error) {
      setError(`解码失败: ${error.message}`);
      decodedImage.value = '';
    } finally {
      processing.value = false;
    }
  };

  // 根据 Base64 文件头魔数推断图片 MIME 类型
  const guessImageMimeType = (base64) => {
    const clean = base64.replace(/\s+/g, '');
    if (clean.startsWith('/9j/')) return 'image/jpeg';
    if (clean.startsWith('iVBOR')) return 'image/png';
    if (clean.startsWith('R0lGOD')) return 'image/gif';
    if (clean.startsWith('UklGR')) return 'image/webp';
    if (clean.startsWith('Qk')) return 'image/bmp';
    if (clean.startsWith('SUkq')) return 'image/tiff';
    return 'image/png'; // 无法识别时默认 PNG
  };

  const isValidImageBase64 = (base64) => {
    if (!base64 || base64.trim().length === 0) {
      return false;
    }
    
    const trimmed = base64.trim();
    
    const imagePrefixes = [
      'data:image/jpeg;base64,',
      'data:image/png;base64,',
      'data:image/gif;base64,',
      'data:image/webp;base64,',
      'data:image/bmp;base64,',
      'data:image/tiff;base64,',
      'data:image/svg+xml;base64,'
    ];
    
    if (imagePrefixes.some(prefix => trimmed.toLowerCase().startsWith(prefix.toLowerCase()))) {
      return true;
    }
    
    const base64Pattern = /^[A-Za-z0-9+/=\s]+$/;
    return base64Pattern.test(trimmed);
  };

  const copyBase64 = async () => {
    if (base64Output.value) {
      try {
        await navigator.clipboard.writeText(base64Output.value);
        return true;
      } catch (err) {
        setError(`复制失败: ${err.message}`);
        return false;
      }
    }
    return false;
  };

  const downloadBase64 = () => {
    if (!base64Output.value) return false;
    
    try {
      let dataUrl = base64Output.value;
      if (!dataUrl.startsWith('data:')) {
        dataUrl = `data:image/${outputFormat.value};base64,${dataUrl}`;
      }
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `image_${Date.now()}.${outputFormat.value}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (err) {
      setError(`下载失败: ${err.message}`);
      return false;
    }
  };

  const downloadImage = () => {
    if (!decodedImage.value) return false;
    
    try {
      const link = document.createElement('a');
      link.href = decodedImage.value;
      const ext = decodedImage.value.match(/data:image\/([^;]+)/)?.[1] || 'png';
      link.download = `decoded_image_${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (err) {
      setError(`下载失败: ${err.message}`);
      return false;
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    if (file.size > 20 * 1024 * 1024) {
      setError('图片大小不能超过20MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      imagePreview.value = e.target.result;
      imageInfo.value = await getImageInfo(file, e.target.result);
    };
    reader.onerror = () => {
      setError('图片读取失败，请重试');
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    imagePreview.value = '';
    imageInfo.value = null;
  };

  const clearAll = () => {
    imagePreview.value = '';
    base64Input.value = '';
    clearOutput();
    clearError();
  };

  const processImage = async () => {
    clearError();
    
    if (currentMode.value === 'encode') {
      await encodeImage(imagePreview.value, null);
    } else {
      await decodeBase64(base64Input.value);
    }
  };

  const loadExample = () => {
    base64Input.value = 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAADklEQVQI12Ng+M+AARUDJQARJQCv2gH5JwAAAABJRU5ErkJggg==';
    return true;
  };

  return {
    processing,
    errorMessage,
    base64Output,
    decodedImage,
    isEncodeMode,
    imagePreview,
    base64Input,
    imageInfo,
    outputFormat,
    includeDataPrefix,
    supportedFormats,
    
    isProcessing,
    hasError,
    hasOutput,
    currentMode,
    canProcess,
    
    setError,
    clearError,
    clearOutput,
    clearImage,
    clearAll,
    encodeImage,
    decodeBase64,
    handleFileUpload,
    processImage,
    copyBase64,
    downloadBase64,
    downloadImage,
    formatFileSize,
    loadExample
  };
});
