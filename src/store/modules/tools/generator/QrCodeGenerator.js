import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import QRCode from 'qrcode';

export const useQrCodeGeneratorStore = defineStore('qrCodeGenerator', () => {
  // 状态
  const qrContent = ref('');
  const qrOptions = ref({
    size: 256,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  const qrCodeUrl = ref('');
  const isGenerating = ref(false);
  const errorMessage = ref('');

  // 计算属性
  const hasContent = computed(() => qrContent.value.trim().length > 0);
  const hasQrCode = computed(() => qrCodeUrl.value.length > 0);
  const canGenerate = computed(() => hasContent.value && !isGenerating.value);

  // 生成二维码
  const generateQrCode = async () => {
    if (!hasContent.value) {
      errorMessage.value = '请输入要生成二维码的内容';
      return false;
    }

    isGenerating.value = true;
    errorMessage.value = '';

    try {
      // 配置二维码选项
      const options = {
        width: parseInt(qrOptions.value.size),
        margin: 2,
        color: {
          dark: qrOptions.value.color.dark,
          light: qrOptions.value.color.light
        },
        errorCorrectionLevel: qrOptions.value.errorCorrectionLevel
      };

      // 生成二维码
      const url = await QRCode.toDataURL(qrContent.value, options);
      qrCodeUrl.value = url;
      return true;
    } catch (error) {
      errorMessage.value = `生成二维码失败: ${error.message}`;
      qrCodeUrl.value = '';
      return false;
    } finally {
      isGenerating.value = false;
    }
  };

  // 下载二维码
  const downloadQrCode = () => {
    if (!hasQrCode.value) {
      errorMessage.value = '请先生成二维码';
      return false;
    }

    try {
      const link = document.createElement('a');
      link.href = qrCodeUrl.value;
      link.download = `qrcode_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (error) {
      errorMessage.value = `下载失败: ${error.message}`;
      return false;
    }
  };

  // 复制二维码到剪贴板
  const copyQrCodeToClipboard = async () => {
    if (!hasQrCode.value) {
      errorMessage.value = '请先生成二维码';
      return false;
    }

    try {
      // 将base64转换为Blob
      const response = await fetch(qrCodeUrl.value);
      const blob = await response.blob();

      // 复制到剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } catch (error) {
      errorMessage.value = `复制失败: ${error.message}`;
      return false;
    }
  };

  // 加载示例
  const loadExample = async () => {
    qrContent.value = 'https://example.com';
    errorMessage.value = '';
    return await generateQrCode();
  };

  // 清空输入
  const clearInput = () => {
    qrContent.value = '';
    errorMessage.value = '';
  };

  // 清空二维码
  const clearQrCode = () => {
    qrCodeUrl.value = '';
    errorMessage.value = '';
  };

  // 清空所有内容
  const clearAll = () => {
    qrContent.value = '';
    qrCodeUrl.value = '';
    errorMessage.value = '';
  };

  // 重置选项
  const resetOptions = () => {
    qrOptions.value = {
      size: 256,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };
  };

  return {
    // 状态
    qrContent,
    qrOptions,
    qrCodeUrl,
    isGenerating,
    errorMessage,

    // 计算属性
    hasContent,
    hasQrCode,
    canGenerate,

    // 方法
    generateQrCode,
    downloadQrCode,
    copyQrCodeToClipboard,
    loadExample,
    clearInput,
    clearQrCode,
    clearAll,
    resetOptions
  };
});