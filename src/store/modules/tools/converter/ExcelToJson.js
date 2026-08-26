import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';

export const useExcelToJsonStore = defineStore('excelToJson', () => {
  // 状态定义
  const fileInput = ref(null);
  const selectedFile = ref(null);
  const sheetNames = ref([]);
  const selectedSheet = ref(0);
  const outputJson = ref('');
  const isConverting = ref(false);
  const fileError = ref('');
  const options = ref({
    header: true,
    nullHandling: 'null', // 'null', 'empty', 'omit'
    indent: '2' // '2', '4', 'compact'
  });

  // 计算属性
  const hasFile = computed(() => !!selectedFile.value);
  const hasOutput = computed(() => !!outputJson.value);
  const canConvert = computed(() => hasFile.value && !isConverting.value);

  // 处理文件选择（读取真实工作表名称）
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      selectedFile.value = null;
      sheetNames.value = [];
      outputJson.value = '';
      fileError.value = '';
      return;
    }
    
    selectedFile.value = file;
    outputJson.value = '';
    fileError.value = '';
    sheetNames.value = [];
    selectedSheet.value = 0;
    
    // 读取文件获取工作表名称
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('文件中没有工作表');
        }
        sheetNames.value = workbook.SheetNames;
      } catch (error) {
        console.error('读取Excel文件失败:', error);
        sheetNames.value = [];
        fileError.value = '无法读取Excel文件，请确认文件格式正确（.xlsx/.xls）';
      }
    };
    reader.onerror = () => {
      fileError.value = '文件读取失败，请重试';
    };
    reader.readAsArrayBuffer(file);
  };

  // 清空文件
  const clearFile = () => {
    selectedFile.value = null;
    sheetNames.value = [];
    outputJson.value = '';
    fileError.value = '';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 转换Excel为JSON（使用 SheetJS 真实解析）
  const convertToJson = async () => {
    if (!selectedFile.value) {
      throw new Error('请先选择Excel文件');
    }

    isConverting.value = true;

    try {
      // 读取文件内容
      const fileBuffer = await readFileAsArrayBuffer(selectedFile.value);
      
      // 使用 SheetJS 解析 Excel
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('文件中没有工作表');
      }
      
      const sheetName = workbook.SheetNames[selectedSheet.value] || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new Error(`无法读取工作表: ${sheetName}`);
      }
      
      // 按行读取原始数据（header:1 得到二维数组）
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      if (rawRows.length === 0) {
        throw new Error(`工作表 "${sheetName}" 为空`);
      }
      
      let processedData;
      if (options.value.header) {
        // 首行作为表头
        const headers = rawRows[0].map(String);
        processedData = rawRows.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            if (!header) return; // 跳过空表头列
            let value = row[index];
            if (value === null || value === undefined || value === '') {
              if (options.value.nullHandling === 'null') {
                value = null;
              } else if (options.value.nullHandling === 'empty') {
                value = '';
              } else {
                return; // 'omit'：忽略空值
              }
            }
            obj[header] = value;
          });
          return obj;
        });
      } else {
        // 不含表头：直接输出二维数组
        processedData = rawRows;
      }
      
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

  // 格式化JSON
  const formatJson = (data) => {
    try {
      if (options.value.indent === 'compact') {
        return JSON.stringify(data);
      } else {
        const indentSize = parseInt(options.value.indent, 10);
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
    fileError,
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
    formatJson,
    copyResult,
    downloadResult,
    reset
  };
});