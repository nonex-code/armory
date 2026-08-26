import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCsvToJsonStore = defineStore('csvToJson', () => {
  // 状态定义
  const inputCsv = ref('');
  const outputJson = ref('');
  const errorMessage = ref('');
  const delimiter = ref(','); // ',', ';', '\t', '|'
  const hasHeader = ref(true);
  const trimValues = ref(true);

  // 示例CSV数据
  const exampleCsv = `姓名,年龄,城市,是否会员
张三,25,北京,true
李四,30,上海,false
王五,28,广州,true`;

  // 计算属性
  const hasInput = computed(() => !!inputCsv.value);
  const hasOutput = computed(() => !!outputJson.value);
  const hasError = computed(() => !!errorMessage.value);

  // 转换CSV为JSON
  const convertToJson = () => {
    try {
      errorMessage.value = '';
      
      if (!inputCsv.value.trim()) {
        errorMessage.value = '请输入CSV数据';
        return;
      }
      
      // 处理分隔符
      const actualDelimiter = delimiter.value === '\\t' ? '\t' : delimiter.value;
      
      // 解析完整 CSV（RFC 4180：支持引号字段内的换行、转义引号、CRLF、BOM）
      const parsedLines = parseCsv(inputCsv.value, actualDelimiter);
      
      if (parsedLines.length === 0) {
        errorMessage.value = 'CSV数据为空';
        return;
      }
      
      // 检查所有行的字段数量是否一致
      const fieldCounts = parsedLines.map(line => line.length);
      const uniqueCounts = [...new Set(fieldCounts)];
      
      if (uniqueCounts.length > 1) {
        errorMessage.value = `CSV数据格式错误：行之间字段数量不一致（${uniqueCounts.join(', ')}个字段）`;
        return;
      }
      
      const fieldCount = uniqueCounts[0];
      
      // 转换为JSON
      let result;
      
      if (hasHeader.value && parsedLines.length > 1) {
        // 使用第一行作为标题
        const headers = parsedLines[0];
        const dataRows = parsedLines.slice(1);
        
        result = dataRows.map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            let value = row[index] || '';
            if (trimValues.value) {
              value = typeof value === 'string' ? value.trim() : value;
            }
            obj[header] = parseValue(value);
          });
          return obj;
        });
      } else {
        // 不使用标题，生成数组数组
        result = parsedLines.map(row => {
          return row.map(value => {
            if (trimValues.value && typeof value === 'string') {
              value = value.trim();
            }
            return parseValue(value);
          });
        });
      }
      
      // 格式化JSON
      outputJson.value = JSON.stringify(result, null, 2);
      return true;
    } catch (error) {
      errorMessage.value = `转换失败: ${error.message}`;
      outputJson.value = '';
      return false;
    }
  };

  // 解析完整 CSV 文本（RFC 4180）
  const parseCsv = (text, delimiter) => {
    // 去除 UTF-8 BOM
    let csvText = text;
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
    }
    
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < csvText.length) {
      const char = csvText[i];
      
      if (inQuotes) {
        if (char === '"') {
          if (csvText[i + 1] === '"') {
            // 转义的引号（""）
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        // 引号内内容（包括换行、分隔符）原样保留
        field += char;
        i++;
        continue;
      }
      
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      
      if (char === delimiter) {
        row.push(field);
        field = '';
        i++;
        continue;
      }
      
      if (char === '\r') {
        // CRLF 或 单独 CR 均视为行结束
        if (csvText[i + 1] === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
        continue;
      }
      
      if (char === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
        continue;
      }
      
      field += char;
      i++;
    }
    
    // 最后一行（无结尾换行）
    if (field !== '' || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    
    // 过滤完全空白的行
    return rows.filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
  };

  // 解析CSV行（保留给外部调用；新解析器已支持多行字段）
  const parseCsvLine = (line, delimiter) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // 转义的引号
          current += '"';
          i++; // 跳过下一个引号
        } else {
          // 开始或结束引号
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // 字段分隔符
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // 添加最后一个字段
    result.push(current);
    
    return result;
  };

  // 解析值的类型（避免前导零、大数精度、Infinity 误转换）
  const parseValue = (value) => {
    if (value === '') {
      return null;
    }
    
    // 布尔值
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }
    
    // 整数（仅标准十进制形态；拒绝前导零（"007"）与超长数字，保持字符串避免精度丢失）
    if (/^-?(0|[1-9]\d*)$/.test(value)) {
      const digits = value.replace(/^-/, '');
      // 超过 15 位的大数保留为字符串，避免精度丢失
      if (digits.length > 15) {
        return value;
      }
      return parseInt(value, 10);
    }
    
    // 小数（标准形态，拒绝前导零如 "007.5"）
    if (/^-?(0|[1-9]\d*)\.\d+$/.test(value)) {
      return parseFloat(value);
    }
    
    // 其他（含 Infinity、科学计数法等）保持字符串
    return value;
  };

  // 处理文件上传
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return false;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        inputCsv.value = e.target.result;
        resolve(true);
      };
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      reader.readAsText(file);
    });
  };

  // 加载示例
  const loadExample = () => {
    inputCsv.value = exampleCsv;
    errorMessage.value = '';
    outputJson.value = '';
  };

  // 清空所有内容
  const clearAll = () => {
    inputCsv.value = '';
    outputJson.value = '';
    errorMessage.value = '';
  };

  // 复制到剪贴板
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  };

  // 下载JSON文件
  const downloadJson = () => {
    if (!outputJson.value) return false;
    
    try {
      const blob = new Blob([outputJson.value], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('下载失败:', error);
      return false;
    }
  };

  // 重置为初始状态
  const reset = () => {
    inputCsv.value = '';
    outputJson.value = '';
    errorMessage.value = '';
    delimiter.value = ',';
    hasHeader.value = true;
    trimValues.value = true;
  };

  return {
    // 状态
    inputCsv,
    outputJson,
    errorMessage,
    delimiter,
    hasHeader,
    trimValues,
    exampleCsv,
    
    // 计算属性
    hasInput,
    hasOutput,
    hasError,
    
    // 方法
    convertToJson,
    parseCsv,
    parseCsvLine,
    parseValue,
    handleFileUpload,
    loadExample,
    clearAll,
    copyToClipboard,
    downloadJson,
    reset
  };
});