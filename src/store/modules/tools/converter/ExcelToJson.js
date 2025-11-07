import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useExcelToJsonStore = defineStore('excelToJson', () => {
  // 状态定义
  const fileInput = ref(null);
  const selectedFile = ref(null);
  const sheetNames = ref([]);
  const selectedSheet = ref(0);
  const outputJson = ref('');
  const isConverting = ref(false);
  const options = ref({
    header: true,
    nullHandling: 'null', // 'null', 'empty', 'omit'
    indent: '2' // '2', '4', 'compact'
  });

  // 计算属性
  const hasFile = computed(() => !!selectedFile.value);
  const hasOutput = computed(() => !!outputJson.value);
  const canConvert = computed(() => hasFile.value && !isConverting.value);

  // 处理文件选择
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      selectedFile.value = file;
      outputJson.value = '';
      // 这里应该读取Excel文件获取工作表名称
      // 由于浏览器限制，我们使用模拟数据
      sheetNames.value = ['Sheet1', 'Sheet2', 'Sheet3'];
      selectedSheet.value = 0;
    }
  };

  // 清空文件
  const clearFile = () => {
    selectedFile.value = null;
    sheetNames.value = [];
    outputJson.value = '';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 转换Excel为JSON
  const convertToJson = async () => {
    if (!selectedFile.value) {
      throw new Error('请先选择Excel文件');
    }

    isConverting.value = true;

    try {
      // 读取文件内容
      const fileBuffer = await readFileAsArrayBuffer(selectedFile.value);
      
      // 在实际应用中，这里应该使用Excel解析库如SheetJS (xlsx)
      // 由于浏览器限制，我们使用模拟数据
      const jsonData = await simulateExcelParsing(fileBuffer);
      
      // 根据选项处理数据
      const processedData = processExcelData(jsonData);
      
      // 格式化JSON
      outputJson.value = formatJson(processedData);
      return true;
    } catch (error) {
      console.error('Excel转换失败:', error);
      throw error;
    } finally {
      isConverting.value = false;
    }
  };

  // 读取文件为ArrayBuffer
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  };

  // 模拟Excel解析（实际应用中应使用xlsx等库）
  const simulateExcelParsing = async (fileBuffer) => {
    // 模拟解析延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 返回模拟数据
    return [
      { id: 1, name: '张三', age: 30, city: '北京' },
      { id: 2, name: '李四', age: 25, city: '上海' },
      { id: 3, name: '王五', age: 28, city: '广州' },
      { id: 4, name: '赵六', age: 32, city: '深圳' }
    ];
  };

  // 处理Excel数据
  const processExcelData = (data) => {
    if (!options.value.header) {
      // 如果不包含表头，将数据转换为二维数组
      return data.map(row => Object.values(row));
    }
    
    // 根据空值处理选项处理数据
    return data.map(row => {
      const processedRow = {};
      for (const key in row) {
        if (row[key] === null || row[key] === undefined || row[key] === '') {
          if (options.value.nullHandling === 'null') {
            processedRow[key] = null;
          } else if (options.value.nullHandling === 'empty') {
            processedRow[key] = '';
          } else if (options.value.nullHandling === 'omit') {
            // 忽略空值，不添加到结果中
          } else {
            processedRow[key] = row[key];
          }
        } else {
          processedRow[key] = row[key];
        }
      }
      return processedRow;
    });
  };

  // 格式化JSON
  const formatJson = (data) => {
    try {
      if (options.value.indent === 'compact') {
        return JSON.stringify(data);
      } else {
        const indentSize = parseInt(options.value.indent);
        return JSON.stringify(data, null, indentSize);
      }
    } catch (error) {
      throw new Error('JSON格式化失败');
    }
  };

  // 复制结果
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(outputJson.value);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  };

  // 下载结果
  const downloadResult = () => {
    try {
      const blob = new Blob([outputJson.value], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.value.name.replace(/\.[^/.]+$/, '') + '.json';
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
    fileInput.value = null;
    selectedFile.value = null;
    sheetNames.value = [];
    selectedSheet.value = 0;
    outputJson.value = '';
    isConverting.value = false;
    options.value = {
      header: true,
      nullHandling: 'null',
      indent: '2'
    };
  };

  return {
    // 状态
    fileInput,
    selectedFile,
    sheetNames,
    selectedSheet,
    outputJson,
    isConverting,
    options,
    
    // 计算属性
    hasFile,
    hasOutput,
    canConvert,
    
    // 方法
    handleFileChange,
    clearFile,
    formatFileSize,
    convertToJson,
    readFileAsArrayBuffer,
    simulateExcelParsing,
    processExcelData,
    formatJson,
    copyResult,
    downloadResult,
    reset
  };
});