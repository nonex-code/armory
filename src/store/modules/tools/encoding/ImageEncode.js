import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useImageEncodeStore = defineStore('imageEncode', () => {
  // 状态
  const processing = ref(false);
  const errorMessage = ref('');
  const base64Output = ref('');
  const decodedImage = ref('');
  const isEncodeMode = ref(true);
  const imagePreview = ref('');
  const base64Input = ref('');
  
  // 计算属性
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
  
  // 设置错误信息
  const setError = (message) => {
    errorMessage.value = message;
  };
  
  // 清除错误信息
  const clearError = () => {
    errorMessage.value = '';
  };
  
  // 清除输出
  const clearOutput = () => {
    base64Output.value = '';
    decodedImage.value = '';
  };
  
  // 编码图片为Base64
  const encodeImage = async (imageDataUrl) => {
    processing.value = true;
    clearError();
    
    try {
      // 图片已经是DataURL格式，只需要处理即可
      base64Output.value = imageDataUrl;
      decodedImage.value = '';
    } catch (error) {
      setError(`编码失败: ${error.message}`);
      base64Output.value = '';
    } finally {
      processing.value = false;
    }
  };
  
  // 解码Base64为图片
  const decodeBase64 = async (base64String) => {
    processing.value = true;
    clearError();
    
    try {
      // 验证Base64字符串是否是有效的图片格式
      if (!isValidImageBase64(base64String)) {
        throw new Error('无效的图片Base64字符串');
      }
      
      // 如果Base64字符串没有前缀，添加默认的PNG前缀
      let imageDataUrl = base64String.trim();
      if (!imageDataUrl.startsWith('data:image/')) {
        imageDataUrl = `data:image/png;base64,${imageDataUrl}`;
      }
      
      // 直接使用Base64字符串作为图片
      decodedImage.value = imageDataUrl;
      base64Output.value = '';
    } catch (error) {
      setError(`解码失败: ${error.message}`);
      decodedImage.value = '';
    } finally {
      processing.value = false;
    }
  };
  
  // 验证Base64字符串是否是有效的图片
  const isValidImageBase64 = (base64) => {
    if (!base64 || base64.trim().length === 0) {
      return false;
    }
    
    const trimmed = base64.trim();
    
    // 检查是否包含有效的图片格式前缀
    const imagePrefixes = [
      'data:image/jpeg;base64,',
      'data:image/png;base64,',
      'data:image/gif;base64,',
      'data:image/webp;base64,',
      'data:image/bmp;base64,',
      'data:image/tiff;base64,',
      'data:image/svg+xml;base64,'
    ];
    
    // 如果有前缀，检查前缀是否有效
    if (imagePrefixes.some(prefix => trimmed.startsWith(prefix))) {
      return true;
    }
    
    // 如果没有前缀，检查是否是有效的Base64字符串
    // Base64字符串应该只包含A-Z, a-z, 0-9, +, /, =字符
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    return base64Pattern.test(trimmed);
  };
  
  // 复制Base64字符串
  const copyBase64 = () => {
    if (base64Output.value) {
      navigator.clipboard.writeText(base64Output.value)
        .then(() => {
          // 可以添加toast通知
          console.log('Base64已复制到剪贴板');
        })
        .catch(err => {
          setError(`复制失败: ${err.message}`);
        });
    }
  };
  
  // 下载Base64字符串为文件
  const downloadBase64 = () => {
    if (!base64Output.value) return;
    
    const link = document.createElement('a');
    link.href = base64Output.value;
    link.download = `image_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 下载解码后的图片
  const downloadImage = () => {
    if (!decodedImage.value) return;
    
    const link = document.createElement('a');
    link.href = decodedImage.value;
    link.download = `decoded_image_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 处理文件上传
  const handleFileUpload = (file) => {
    if (!file) return;
    
    // 检查文件大小 (限制10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过10MB');
      return;
    }
    
    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  // 清空图片预览
  const clearImage = () => {
    imagePreview.value = '';
  };
  
  // 清空所有内容
  const clearAll = () => {
    imagePreview.value = '';
    base64Input.value = '';
    clearOutput();
    clearError();
  };
  
  // 处理图片
  const processImage = async () => {
    clearError();
    
    if (currentMode.value === 'encode') {
      // 编码图片
      await encodeImage(imagePreview.value);
    } else {
      // 解码Base64
      await decodeBase64(base64Input.value);
    }
  };
  
  return {
    // 状态
    processing,
    errorMessage,
    base64Output,
    decodedImage,
    isEncodeMode,
    imagePreview,
    base64Input,
    
    // 计算属性
    isProcessing,
    hasError,
    hasOutput,
    currentMode,
    canProcess,
    
    // 方法
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
    downloadImage
  };
});