import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useXmlFormatterStore = defineStore('xmlFormatter', () => {
  // 状态
  const inputXml = ref('');
  const outputXml = ref('');
  const validationResult = ref(null);
  const options = ref({
    indent: true,
    selfClosing: true,
    attributesBreak: false,
    removeComments: false,
    indentSize: '2'
  });

  // 示例XML
  const exampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="web">
    <title lang="en">Learning XML</title>
    <author>Erik T. Ray</author>
    <year>2003</year>
    <price>39.95</price>
  </book>
  <book category="children">
    <title lang="en">Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
</bookstore>`;

  // 计算属性
  const hasInput = computed(() => inputXml.value.trim() !== '');
  const hasOutput = computed(() => outputXml.value.trim() !== '');
  const hasValidationResult = computed(() => validationResult.value !== null);

  // 加载示例
  const loadExample = () => {
    inputXml.value = exampleXml;
    outputXml.value = '';
    validationResult.value = null;
  };

  // 清空输入
  const clearInput = () => {
    inputXml.value = '';
    outputXml.value = '';
    validationResult.value = null;
  };

  // 格式化XML
  const formatXml = () => {
    try {
      if (!inputXml.value.trim()) {
        return;
      }

      // 使用浏览器内置的DOMParser解析XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml.value, 'application/xml');
      
      // 检查解析错误
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error('XML格式错误: ' + parseError[0].textContent);
      }

      // 序列化XML
      const serializer = new XMLSerializer();
      let formattedXml = serializer.serializeToString(xmlDoc);

      // 应用格式化选项
      if (options.value.indent) {
        formattedXml = prettyPrintXml(formattedXml, options.value.indentSize);
      }

      if (options.value.removeComments) {
        formattedXml = formattedXml.replace(/<!--[\s\S]*?-->/g, '');
      }

      outputXml.value = formattedXml;
      validationResult.value = {
        isValid: true,
        message: 'XML格式正确，已成功格式化'
      };
    } catch (error) {
      validationResult.value = {
        isValid: false,
        message: error.message
      };
    }
  };

  // 压缩XML
  const compressXml = () => {
    try {
      if (!inputXml.value.trim()) {
        return;
      }

      // 使用浏览器内置的DOMParser解析XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml.value, 'application/xml');
      
      // 检查解析错误
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error('XML格式错误: ' + parseError[0].textContent);
      }

      // 序列化XML
      const serializer = new XMLSerializer();
      let compressedXml = serializer.serializeToString(xmlDoc);

      // 移除多余的空白和换行
      compressedXml = compressedXml.replace(/>\s+</g, '><');
      compressedXml = compressedXml.replace(/^\s+|\s+$/gm, '');

      outputXml.value = compressedXml;
      validationResult.value = {
        isValid: true,
        message: 'XML格式正确，已成功压缩'
      };
    } catch (error) {
      validationResult.value = {
        isValid: false,
        message: error.message
      };
    }
  };

  // 验证XML
  const validateXml = () => {
    try {
      if (!inputXml.value.trim()) {
        return;
      }

      // 使用浏览器内置的DOMParser解析XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml.value, 'application/xml');
      
      // 检查解析错误
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error('XML格式错误: ' + parseError[0].textContent);
      }

      validationResult.value = {
        isValid: true,
        message: 'XML格式正确'
      };
    } catch (error) {
      validationResult.value = {
        isValid: false,
        message: error.message
      };
    }
  };

  // 美化XML
  const prettyPrintXml = (xml, indentSize) => {
    const PADDING = indentSize === 'tab' ? '\t' : ' '.repeat(parseInt(indentSize) || 2);
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;
    
    xml = xml.replace(reg, '$1\r\n$2$3');
    
    return xml.split('\r\n').map((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/) && pad > 0) {
        pad -= 1;
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      
      const padding = PADDING.repeat(pad);
      pad += indent;
      
      return padding + node;
    }).join('\r\n');
  };

  // 复制结果
  const copyResult = async () => {
    if (!outputXml.value) return false;
    
    try {
      await navigator.clipboard.writeText(outputXml.value);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  };

  // 重置所有状态
  const reset = () => {
    inputXml.value = '';
    outputXml.value = '';
    validationResult.value = null;
    options.value = {
      indent: true,
      selfClosing: true,
      attributesBreak: false,
      removeComments: false,
      indentSize: '2'
    };
  };

  return {
    // 状态
    inputXml,
    outputXml,
    validationResult,
    options,
    
    // 计算属性
    hasInput,
    hasOutput,
    hasValidationResult,
    
    // 方法
    loadExample,
    clearInput,
    formatXml,
    compressXml,
    validateXml,
    copyResult,
    reset
  };
});