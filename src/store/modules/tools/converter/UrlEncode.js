import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUrlEncodeStore = defineStore('urlEncode', () => {
  // 状态定义
  const inputUrl = ref('');
  const outputUrl = ref('');
  const encodingType = ref('uriComponent'); // 'uri', 'uriComponent', 'form'

  // 示例URL
  const exampleUrl = 'https://www.example.com/search?q=URL编码&category=开发工具&filter=特殊字符@#$%';

  // 计算属性
  const hasInput = computed(() => !!inputUrl.value);
  const hasOutput = computed(() => !!outputUrl.value);

  // URL编码
  const encodeUrl = () => {
    if (!inputUrl.value) return;
    
    try {
      switch (encodingType.value) {
        case 'uri':
          outputUrl.value = encodeURI(inputUrl.value);
          break;
        case 'uriComponent':
          outputUrl.value = encodeURIComponent(inputUrl.value);
          break;
        case 'form':
          // 表单编码：空格转为+，其他特殊字符转为%XX
          outputUrl.value = inputUrl.value.replace(/[^a-zA-Z0-9-_.!~*'()]/g, (char) => {
            return char === ' ' ? '+' : encodeURIComponent(char);
          });
          break;
        default:
          outputUrl.value = encodeURIComponent(inputUrl.value);
      }
    } catch (error) {
      outputUrl.value = `编码错误: ${error.message}`;
    }
  };

  // URL解码
  const decodeUrl = () => {
    if (!inputUrl.value) return;
    
    try {
      switch (encodingType.value) {
        case 'uri':
          outputUrl.value = decodeURI(inputUrl.value);
          break;
        case 'uriComponent':
          outputUrl.value = decodeURIComponent(inputUrl.value);
          break;
        case 'form':
          // 表单解码：+转为空格，其他%XX解码
          outputUrl.value = inputUrl.value.replace(/\+/g, ' ').replace(/%[0-9A-Fa-f]{2}/g, (match) => {
            return String.fromCharCode(parseInt(match.substring(1), 16));
          });
          break;
        default:
          outputUrl.value = decodeURIComponent(inputUrl.value);
      }
    } catch (error) {
      outputUrl.value = `解码错误: ${error.message}`;
    }
  };

  // 加载示例
  const loadExample = () => {
    inputUrl.value = exampleUrl;
    outputUrl.value = '';
  };

  // 清空输入
  const clearInput = () => {
    inputUrl.value = '';
    outputUrl.value = '';
  };

  // 复制结果
  const copyResult = async () => {
    if (!outputUrl.value) return false;
    
    try {
      await navigator.clipboard.writeText(outputUrl.value);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  };

  // 交换输入输出
  const swapInputOutput = () => {
    if (!outputUrl.value) return;
    
    const temp = inputUrl.value;
    inputUrl.value = outputUrl.value;
    outputUrl.value = temp;
  };

  // 重置为初始状态
  const reset = () => {
    inputUrl.value = '';
    outputUrl.value = '';
    encodingType.value = 'uriComponent';
  };

  return {
    // 状态
    inputUrl,
    outputUrl,
    encodingType,
    exampleUrl,
    
    // 计算属性
    hasInput,
    hasOutput,
    
    // 方法
    encodeUrl,
    decodeUrl,
    loadExample,
    clearInput,
    copyResult,
    swapInputOutput,
    reset
  };
});