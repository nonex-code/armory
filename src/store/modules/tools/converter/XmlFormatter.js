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

  // 格式化XML（基于 DOM 递归遍历，保护 CDATA/注释/混合内容）
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

      const indentSize = options.value.indentSize === 'tab' ? '\t' : ' '.repeat(Math.max(parseInt(options.value.indentSize, 10) || 2, 1));
      
      // 递归格式化节点
      const formatNode = (node, depth) => {
        const pad = indentSize.repeat(depth);
        const lines = [];
        
        // 文本节点
        if (node.nodeType === 3) { // TEXT_NODE
          const text = node.nodeValue;
          if (text.trim() !== '') {
            lines.push(pad + text.trim());
          }
          return lines;
        }
        
        // CDATA 节点
        if (node.nodeType === 4) {
          lines.push(pad + `<![CDATA[${node.nodeValue}]]>`);
          return lines;
        }
        
        // 注释节点
        if (node.nodeType === 8) { // COMMENT_NODE
          if (!options.value.removeComments) {
            lines.push(pad + `<!--${node.nodeValue}-->`);
          }
          return lines;
        }
        
        // 元素节点
        const tagName = node.tagName;
        const children = Array.from(node.childNodes);
        const elementChildren = children.filter(c => c.nodeType === 1);
        const hasTextContent = children.some(c => (c.nodeType === 3 || c.nodeType === 4) && c.nodeValue.trim() !== '');
        
        // 属性序列化（可选每属性换行）
        const attrs = Array.from(node.attributes || []);
        const attrStr = attrs.length > 0
          ? ' ' + attrs.map(attr => `${attr.name}="${attr.value.replace(/"/g, '&quot;')}"`).join(' ')
          : '';
        
        // 混合内容（既有文本又有子元素）：原样序列化，保持内容不变
        if (hasTextContent && elementChildren.length > 0) {
          const serializer = new XMLSerializer();
          lines.push(pad + serializer.serializeToString(node));
          return lines;
        }
        
        // 空元素
        if (elementChildren.length === 0 && !hasTextContent) {
          if (options.value.selfClosing) {
            lines.push(pad + `<${tagName}${attrStr}/>`);
          } else {
            lines.push(pad + `<${tagName}${attrStr}></${tagName}>`);
          }
          return lines;
        }
        
        // 有子元素的节点
        lines.push(pad + `<${tagName}${attrStr}>`);
        for (const child of children) {
          lines.push(...formatNode(child, depth + 1));
        }
        lines.push(pad + `</${tagName}>`);
        return lines;
      };
      
      const formattedLines = [];
      // 处理 XML 声明和 DOCTYPE
      const xmlDeclaration = inputXml.value.match(/^<\?xml[^>]*\?>/);
      if (xmlDeclaration) {
        formattedLines.push(xmlDeclaration[0]);
      }
      const doctype = inputXml.value.match(/^<!DOCTYPE[^>]*>/i);
      if (doctype) {
        formattedLines.push(doctype[0]);
      }
      
      formattedLines.push(...formatNode(xmlDoc.documentElement, 0));
      
      outputXml.value = options.value.indent ? formattedLines.join('\n') : formattedLines.join('');
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

  // 压缩XML（基于 DOM 删除纯空白文本节点，保留文本内容中的有意义空白）
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

      // 删除仅含空白的文本节点（格式化缩进），保留有意义的文本空白
      const removeWhitespaceNodes = (node) => {
        const children = Array.from(node.childNodes);
        for (const child of children) {
          if (child.nodeType === 3) { // TEXT_NODE
            if (child.nodeValue.trim() === '') {
              node.removeChild(child);
            }
          } else if (child.nodeType === 1) { // ELEMENT_NODE
            removeWhitespaceNodes(child);
          }
        }
      };
      if (options.value.removeComments) {
        const removeComments = (node) => {
          const children = Array.from(node.childNodes);
          for (const child of children) {
            if (child.nodeType === 8) {
              node.removeChild(child);
            } else if (child.nodeType === 1) {
              removeComments(child);
            }
          }
        };
        removeComments(xmlDoc.documentElement);
      }
      removeWhitespaceNodes(xmlDoc.documentElement);

      // 序列化XML
      const serializer = new XMLSerializer();
      const body = serializer.serializeToString(xmlDoc.documentElement);
      
      // 处理 XML 声明和 DOCTYPE（保留）
      const declaration = inputXml.value.match(/^<\?xml[^>]*\?>/);
      const doctype = inputXml.value.match(/^<!DOCTYPE[^>]*>/i);
      
      outputXml.value = (declaration ? declaration[0] : '') + (doctype ? doctype[0] : '') + body;
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