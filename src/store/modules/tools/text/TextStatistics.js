import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTextStatisticsStore = defineStore('textStatistics', () => {
  // 状态
  const inputText = ref('');
  const showAdvancedStats = ref(false);
  const showCharacterFrequency = ref(false);
  const showWordFrequency = ref(false);
  
  // 示例文本
  const exampleText = `The quick brown fox jumps over the lazy dog. This is a sample text for statistical analysis.
It contains multiple sentences and words of varying lengths.`;
  
  // 计算属性
  const hasInput = computed(() => inputText.value.length > 0);
  
  // 英文单词 + 中文字符计数（中文每字计一词，避免整段中文算 1 个词）
  const countWords = (text) => {
    const englishWords = (text.match(/[a-zA-Z0-9]+(?:['-][a-zA-Z0-9]+)*/g) || []).length;
    const cjkChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    return englishWords + cjkChars;
  };
  
  // 句子数（排除常见缩写，如 Mr. / Dr. / etc.）
  const countSentences = (text) => {
    // 先保护常见缩写中的句号
    const protectedText = text.replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|vs|etc)\./gi, '$&');
    // 以 . ! ? 结尾且后跟空白或字符串末尾的片段计数
    const matches = protectedText.match(/[^.!?]*[.!?]+(?:\s|$)/g);
    if (matches && matches.length > 0) return matches.length;
    // 无标点但有内容时视为 0 句（与说明一致：按标点分隔）
    return 0;
  };
  
  // 基础统计
  const basicStats = computed(() => {
    if (!inputText.value) return null;
    
    const text = inputText.value;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? countWords(text) : 0;
    const lines = text.split('\n').length;
    const sentences = countSentences(text);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    
    // 字符类型统计
    const letters = (text.match(/[a-zA-Z\u4e00-\u9fa5]/g) || []).length;
    const digits = (text.match(/\d/g) || []).length;
    const spaces = (text.match(/\s/g) || []).length;
    const punctuations = (text.match(/[^\w\s\u4e00-\u9fa5]/g) || []).length;
    
    // 平均单词长度（用非空白字符数/单词数）
    const avgWordLength = words > 0 ? Math.round((charactersNoSpaces / words) * 10) / 10 : 0;
    // 平均句子长度
    const avgSentenceLength = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;
    // 阅读时间估算（200 词/分钟）
    const readingTime = Math.ceil(words / 200);
    
    // 密度
    const letterDensity = characters > 0 ? (letters / characters) * 100 : 0;
    const digitDensity = characters > 0 ? (digits / characters) * 100 : 0;
    const punctuationDensity = characters > 0 ? (punctuations / characters) * 100 : 0;
    const spaceDensity = characters > 0 ? (spaces / characters) * 100 : 0;
    
    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      spaces,
      letters,
      digits,
      punctuations,
      readingTime,
      avgWordLength,
      avgSentenceLength,
      letterDensity,
      digitDensity,
      punctuationDensity,
      spaceDensity
    };
  });
  
  // 高级统计
  const advancedStats = computed(() => {
    if (!inputText.value || !showAdvancedStats.value) return null;
    
    const text = inputText.value;
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    
    // 单词长度统计（用循环避免大数组 spread 爆栈）
    let maxWordLength = 0;
    let minWordLength = words.length > 0 ? Infinity : 0;
    let totalLength = 0;
    for (const word of words) {
      const len = word.length;
      totalLength += len;
      if (len > maxWordLength) maxWordLength = len;
      if (len < minWordLength) minWordLength = len;
    }
    const avgWordLength = words.length > 0 ? totalLength / words.length : 0;
    
    // 阅读时间估算
    const readingTimeMinutes = Math.ceil(words.length / 200);
    const speakingTimeMinutes = Math.ceil(words.length / 130);
    
    return {
      avgWordLength: Math.round(avgWordLength * 100) / 100,
      maxWordLength,
      minWordLength,
      letters: (text.match(/[a-zA-Z\u4e00-\u9fa5]/g) || []).length,
      digits: (text.match(/\d/g) || []).length,
      spaces: (text.match(/\s/g) || []).length,
      punctuation: (text.match(/[^\w\s\u4e00-\u9fa5]/g) || []).length,
      readingTimeMinutes,
      speakingTimeMinutes
    };
  });
  
  // 字符频率统计（排除全部空白字符；用普通对象计数避免 __proto__ 冲突）
  const characterFrequency = computed(() => {
    if (!inputText.value || !showCharacterFrequency.value) return [];
    
    const text = inputText.value;
    const frequency = Object.create(null);
    
    for (const char of text) {
      if (/\s/.test(char)) continue;
      frequency[char] = (frequency[char] || 0) + 1;
    }
    
    const totalCounted = Object.values(frequency).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(frequency)
      .map(([char, count]) => ({
        char,
        count,
        percentage: totalCounted > 0 ? Math.round((count / totalCounted) * 10000) / 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  });
  
  // 单词频率统计
  const wordFrequency = computed(() => {
    if (!inputText.value || !showWordFrequency.value) return [];
    
    const text = inputText.value.toLowerCase();
    const words = text.match(/[a-zA-Z0-9]+(?:['-][a-zA-Z0-9]+)*/g) || [];
    const frequency = Object.create(null);
    
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
    
    return Object.entries(frequency)
      .map(([word, count]) => ({
        word,
        count,
        percentage: words.length > 0 ? Math.round((count / words.length) * 10000) / 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // 只显示前20个最常见的单词
  });
  
  // 加载示例
  const loadExample = () => {
    inputText.value = exampleText;
  };
  
  // 清空输入
  const clearInput = () => {
    inputText.value = '';
  };
  
  // 复制统计结果
  const copyStatistics = async () => {
    if (!basicStats.value) return false;
    
    const stats = basicStats.value;
    const text = `文本统计结果：
字符数：${stats.characters}
字符数（不含空格）：${stats.charactersNoSpaces}
单词数：${stats.words}
行数：${stats.lines}
句子数：${stats.sentences}
段落数：${stats.paragraphs}
阅读时间（分钟）：${stats.readingTime}`;
    
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  };
  
  return {
    // 状态
    inputText,
    showAdvancedStats,
    showCharacterFrequency,
    showWordFrequency,
    
    // 计算属性
    hasInput,
    basicStats,
    advancedStats,
    characterFrequency,
    wordFrequency,
    
    // 方法
    loadExample,
    clearInput,
    copyStatistics
  };
});
