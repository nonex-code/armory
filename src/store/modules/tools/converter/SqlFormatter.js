import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSqlFormatterStore = defineStore('sqlFormatter', () => {
  // 状态
  const inputSql = ref('');
  const outputSql = ref('');
  const options = ref({
    uppercase: true,
    indent: true,
    lineBreak: true,
    commaFirst: false
  });

  // SQL关键字列表
  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER',
    'DROP', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK',
    'DEFAULT', 'AUTO_INCREMENT', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS', 'DISTINCT', 'COUNT',
    'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'ALL',
    'EXISTS', 'ANY', 'SOME', 'ALL', 'TOP', 'WITH', 'ROW_NUMBER', 'OVER', 'PARTITION'
  ];

  // 示例SQL
  const exampleSql = `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= '2023-01-01' AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC LIMIT 10`;

  // 计算属性
  const hasInput = computed(() => inputSql.value.trim() !== '');
  const hasOutput = computed(() => outputSql.value.trim() !== '');

  // 格式化SQL
  const formatSql = () => {
    try {
      if (!inputSql.value.trim()) {
        return;
      }

      let formattedSql = inputSql.value;

      // 处理关键字大小写
      if (options.value.uppercase) {
        const keywordRegex = new RegExp(`\\b(${sqlKeywords.join('|')})\\b`, 'gi');
        formattedSql = formattedSql.replace(keywordRegex, (match) => match.toUpperCase());
      }

      // 添加换行和缩进
      if (options.value.lineBreak) {
        // 在关键字前添加换行
        formattedSql = formattedSql.replace(/\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|LIMIT|UNION|LEFT JOIN|INNER JOIN|RIGHT JOIN|FULL JOIN)\b/gi, '\n$1');
        
        // 在逗号后添加换行（如果选择了逗号前换行）
        if (options.value.commaFirst) {
          formattedSql = formattedSql.replace(/,/g, '\n,');
        }
      }

      // 添加缩进
      if (options.value.indent) {
        const lines = formattedSql.split('\n');
        let indentLevel = 0;
        const indentedLines = lines.map(line => {
          const trimmedLine = line.trim();
          
          // 减少缩进级别
          if (trimmedLine.match(/^(FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|LIMIT|UNION)$/i)) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          
          // 应用缩进
          const indentedLine = '  '.repeat(indentLevel) + trimmedLine;
          
          // 增加缩进级别
          if (trimmedLine.match(/^(SELECT|FROM|WHERE|ORDER BY|GROUP BY|HAVING|LEFT JOIN|INNER JOIN|RIGHT JOIN|FULL JOIN|CASE|WHEN|THEN|ELSE)$/i)) {
            indentLevel++;
          }
          
          return indentedLine;
        });
        
        formattedSql = indentedLines.join('\n');
      }

      outputSql.value = formattedSql;
    } catch (error) {
      console.error('格式化SQL时出错:', error);
    }
  };

  // 压缩SQL
  const compressSql = () => {
    try {
      if (!inputSql.value.trim()) {
        return;
      }

      // 移除多余的空格和换行
      let compressedSql = inputSql.value
        .replace(/\s+/g, ' ')  // 多个空格替换为一个
        .replace(/\s*,\s*/g, ',')  // 移除逗号前后的空格
        .replace(/\s*\(\s*/g, '(')  // 移除括号前后的空格
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*;\s*/g, ';')  // 移除分号前后的空格
        .trim();

      outputSql.value = compressedSql;
    } catch (error) {
      console.error('压缩SQL时出错:', error);
    }
  };

  // 加载示例
  const loadExample = () => {
    inputSql.value = exampleSql;
    outputSql.value = '';
  };

  // 清空输入
  const clearInput = () => {
    inputSql.value = '';
    outputSql.value = '';
  };

  // 复制结果
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(outputSql.value);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  };

  // 重置所有状态
  const reset = () => {
    inputSql.value = '';
    outputSql.value = '';
    options.value = {
      uppercase: true,
      indent: true,
      lineBreak: true,
      commaFirst: false
    };
  };

  return {
    // 状态
    inputSql,
    outputSql,
    options,
    
    // 计算属性
    hasInput,
    hasOutput,
    
    // 方法
    formatSql,
    compressSql,
    loadExample,
    clearInput,
    copyResult,
    reset
  };
});