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
  
  // 基础统计
  const basicStats = computed(() => {
    if (!inputText.value) return null;
    
    const text = inputText.value;
    const characters = text.length;
    const charactersWithoutSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    
    return {
      characters,
      charactersWithoutSpaces,
      words,
      lines,
      sentences,
      paragraphs
    };
  });
  
  // 高级统计
  const advancedStats = computed(() => {
    if (!inputText.value || !showAdvancedStats.value) return null;
    
    const text = inputText.value;
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    
    // 单词长度统计
    const wordLengths = words.map(word => word.length);
    const avgWordLength = words.length > 0 
      ? wordLengths.reduce((sum, length) => sum + length, 0) / words.length 
      : 0;
    const maxWordLength = words.length > 0 ? Math.max(...wordLengths) : 0;
    const minWordLength = words.length > 0 ? Math.min(...wordLengths) : 0;
    
    // 字符类型统计
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/\d/g) || []).length;
    const spaces = (text.match(/\s/g) || []).length;
    const punctuation = (text.match(/[.,!?;:"'\-]/g) || []).length;
    const specialChars = (text.match(/[^\w\s]/g) || []).length;
    
    // 阅读时间估算
    const readingTimeMinutes = Math.ceil(words.length / 200); // 假设每分钟阅读200个单词
    const speakingTimeMinutes = Math.ceil(words.length / 130); // 假设每分钟说130个单词
    
    return {
      avgWordLength: Math.round(avgWordLength * 100) / 100,
      maxWordLength,
      minWordLength,
      letters,
      digits,
      spaces,
      punctuation,
      specialChars,
      readingTimeMinutes,
      speakingTimeMinutes
    };
  });
  
  // 字符频率统计
  const characterFrequency = computed(() => {
    if (!inputText.value || !showCharacterFrequency.value) return [];
    
    const text = inputText.value;
    const frequency = {};
    
    for (const char of text) {
      if (char !== ' ') {
        frequency[char] = (frequency[char] || 0) + 1;
      }
    }
    
    return Object.entries(frequency)
      .map(([char, count]) => ({
        char,
        count,
        percentage: Math.round((count / text.length) * 100 * 100) / 100
      }))
      .sort((a, b) => b.count - a.count);
  });
  
  // 单词频率统计
  const wordFrequency = computed(() => {
    if (!inputText.value || !showWordFrequency.value) return [];
    
    const text = inputText.value.toLowerCase();
    const words = text.match(/\b\w+\b/g) || [];
    const frequency = {};
    
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
    
    return Object.entries(frequency)
      .map(([word, count]) => ({
        word,
        count,
        percentage: Math.round((count / words.length) * 100 * 100) / 100
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
  const copyStatistics = () => {
    if (!basicStats.value) return;
    
    const stats = basicStats.value;
    const text = `文本统计结果：
字符数：${stats.characters}
字符数（不含空格）：${stats.charactersWithoutSpaces}
单词数：${stats.words}
行数：${stats.lines}
句子数：${stats.sentences}
段落数：${stats.paragraphs}`;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        // 可以添加一个toast通知
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
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