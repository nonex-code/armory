import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { format } from 'sql-formatter';

export const useSqlFormatterStore = defineStore('sqlFormatter', () => {
  // 状态
  const inputSql = ref('');
  const outputSql = ref('');
  const selectedDialect = ref('sql'); // 默认SQL方言
  const isFormatting = ref(false);
  const formatError = ref(null);
  const formatStats = ref({
    originalSize: 0,
    formattedSize: 0,
    formatTime: 0 
  });
  
  // 格式化选项
  const options = ref({
    // 语言选项
    language: 'sql', // sql, mysql, postgresql, sqlserver, oracle, cassandra, mariadb, bigquery, sqlite, plsql
    
    // 缩进选项
    useTabs: false, // 是否使用制表符
    indentSize: 2, // 缩进大小（2-8个空格）
    
    // 关键字格式化
    keywordCase: 'upper', // upper, lower, capitalize
    
    // 换行策略
    linesBetweenQueries: 2, // 查询之间的空行数
    denseOperators: false, // 操作符周围是否使用紧凑模式
    
    // 括号样式
    bracketStyle: 'standard', // standard, k&r, allman
    
    // 特殊格式化选项
    semicolonNewline: false, // 分号是否换行
    
    // 高级选项
    logicalOperatorNewline: 'before', // before, after
    
    // 实时格式化
    enableLiveFormat: false,
    liveFormatDelay: 1000 // 延迟时间（毫秒）
  });

  // SQL方言选项（与 sql-formatter v15 实际支持的方言一致）
  const sqlDialects = [
    { value: 'sql', label: '标准 SQL', description: '通用标准SQL语法' },
    { value: 'mysql', label: 'MySQL', description: 'MySQL数据库语法' },
    { value: 'postgresql', label: 'PostgreSQL', description: 'PostgreSQL数据库语法' },
    { value: 'transactsql', label: 'SQL Server', description: 'Microsoft SQL Server (T-SQL)语法' },
    { value: 'plsql', label: 'PL/SQL', description: 'Oracle PL/SQL语法' },
    { value: 'mariadb', label: 'MariaDB', description: 'MariaDB数据库语法' },
    { value: 'bigquery', label: 'BigQuery', description: 'Google BigQuery语法' },
    { value: 'sqlite', label: 'SQLite', description: 'SQLite数据库语法' },
    { value: 'spark', label: 'Spark SQL', description: 'Apache Spark SQL语法' },
    { value: 'snowflake', label: 'Snowflake', description: 'Snowflake SQL语法' },
    { value: 'db2', label: 'DB2', description: 'IBM DB2语法' },
    { value: 'hive', label: 'Hive', description: 'Apache Hive SQL语法' }
  ];

  // 示例SQL语句库
  const exampleQueries = {
    sql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id 
WHERE u.created_at >= '2023-01-01' AND u.status = 'active' 
GROUP BY u.id, u.name, u.email 
HAVING COUNT(o.id) > 0 
ORDER BY total_spent DESC 
LIMIT 10`,
    
    mysql: `SELECT 
  u.id, 
  u.username, 
  u.email, 
  COUNT(p.id) AS post_count,
  MAX(p.created_at) AS last_post_date
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.status = 'active' AND u.created_at > DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY u.id, u.username, u.email
HAVING post_count > 0
ORDER BY post_count DESC, last_post_date DESC
LIMIT 20`,
    
    postgresql: `WITH user_stats AS (
  SELECT 
    u.id,
    u.name,
    COUNT(o.id) AS order_count,
    SUM(o.amount) AS total_amount,
    ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY o.created_at DESC) as recent_order_rank
  FROM users u
  JOIN orders o ON u.id = o.user_id
  WHERE o.status = 'completed'
  GROUP BY u.id, u.name
)
SELECT 
  id,
  name,
  order_count,
  total_amount,
  CASE 
    WHEN order_count > 10 THEN 'VIP'
    WHEN order_count > 5 THEN 'Regular'
    ELSE 'New'
  END AS customer_type
FROM user_stats
WHERE order_count > 0
ORDER BY total_amount DESC`,
    
    transactsql: `SELECT 
  c.CustomerID,
  c.CustomerName,
  COUNT(o.OrderID) AS OrderCount,
  SUM(o.TotalAmount) AS TotalSpent,
  AVG(o.TotalAmount) AS AverageOrderValue,
  ROW_NUMBER() OVER (ORDER BY SUM(o.TotalAmount) DESC) AS CustomerRank
FROM 
  Customers c
  INNER JOIN Orders o ON c.CustomerID = o.CustomerID
WHERE 
  o.OrderDate >= DATEADD(YEAR, -1, GETDATE())
  AND o.Status = 'Completed'
GROUP BY 
  c.CustomerID, c.CustomerName
HAVING 
  COUNT(o.OrderID) >= 5
ORDER BY 
  TotalSpent DESC`,
    
    mariadb: `SELECT 
  p.id,
  p.title,
  p.content,
  u.username,
  c.category_name,
  COUNT(cm.id) AS comment_count,
  AVG(cm.rating) AS average_rating
FROM 
  posts p
  JOIN users u ON p.user_id = u.id
  JOIN categories c ON p.category_id = c.id
  LEFT JOIN comments cm ON p.id = cm.post_id
WHERE 
  p.status = 'published'
  AND p.created_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY 
  p.id, p.title, p.content, u.username, c.category_name
ORDER BY 
  average_rating DESC, comment_count DESC
LIMIT 20`,
    
    bigquery: `WITH daily_sales AS (
  SELECT 
    DATE(transaction_date) AS sale_date,
    product_id,
    product_name,
    SUM(quantity) AS total_quantity,
    SUM(amount) AS total_amount
  FROM 
    sales.transactions
  WHERE 
    transaction_date >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  GROUP BY 
    sale_date, product_id, product_name
)
SELECT 
  sale_date,
  product_id,
  product_name,
  total_quantity,
  total_amount,
  RANK() OVER (PARTITION BY sale_date ORDER BY total_amount DESC) AS daily_rank
FROM 
  daily_sales
ORDER BY 
  sale_date DESC, daily_rank`,
    
    sqlite: `SELECT 
  a.id,
  a.title,
  a.content,
  a.created_at,
  u.username,
  COUNT(c.id) AS comment_count,
  GROUP_CONCAT(c.content, ' | ') AS recent_comments
FROM 
  articles a
  JOIN users u ON a.user_id = u.id
  LEFT JOIN comments c ON a.id = c.article_id
WHERE 
  a.status = 'published'
  AND a.created_at > date('now', '-30 days')
GROUP BY 
  a.id, a.title, a.content, a.created_at, u.username
ORDER BY 
  a.created_at DESC
LIMIT 20`,
    
    plsql: `DECLARE
  CURSOR c_orders IS
    SELECT 
      o.order_id,
      o.customer_id,
      o.order_date,
      o.total_amount,
      c.customer_name
    FROM 
      orders o
      JOIN customers c ON o.customer_id = c.customer_id
    WHERE 
      o.order_date >= ADD_MONTHS(SYSDATE, -3)
      AND o.status = 'COMPLETED';
  
  v_total_orders NUMBER := 0;
  v_total_amount NUMBER := 0;
BEGIN
  FOR r_order IN c_orders LOOP
    v_total_orders := v_total_orders + 1;
    v_total_amount := v_total_amount + r_order.total_amount;
    
    DBMS_OUTPUT.PUT_LINE('Order: ' || r_order.order_id || 
                        ', Customer: ' || r_order.customer_name || 
                        ', Amount: ' || r_order.total_amount);
  END LOOP;
  
  DBMS_OUTPUT.PUT_LINE('Total Orders: ' || v_total_orders);
  DBMS_OUTPUT.PUT_LINE('Total Amount: ' || v_total_amount);
END;`
  };

  // 计算属性
  const hasInput = computed(() => inputSql.value.trim() !== '');
  const hasOutput = computed(() => outputSql.value.trim() !== '');
  const currentExample = computed(() => exampleQueries[selectedDialect.value] || exampleQueries.sql);

  // 格式化SQL
  const formatSql = async () => {
    try {
      if (!inputSql.value.trim()) {
        return;
      }

      isFormatting.value = true;
      formatError.value = null;
      
      const startTime = performance.now();
      formatStats.value.originalSize = inputSql.value.length;

      // 准备格式化选项（与 sql-formatter v15 的选项一致）
      const formatOptions = {
        language: options.value.language,
        useTabs: options.value.useTabs,
        tabWidth: Math.min(Math.max(parseInt(options.value.indentSize, 10) || 2, 1), 8),
        keywordCase: options.value.keywordCase === 'capitalize' ? 'upper' : options.value.keywordCase,
        linesBetweenQueries: Math.max(parseInt(options.value.linesBetweenQueries, 10) || 0, 0),
        denseOperators: options.value.denseOperators,
        newlineBeforeSemicolon: options.value.semicolonNewline,
        logicalOperatorNewline: options.value.logicalOperatorNewline
      };

      // 执行格式化
      outputSql.value = format(inputSql.value, formatOptions);
      
      // 计算格式化统计
      const endTime = performance.now();
      formatStats.value.formattedSize = outputSql.value.length;
      formatStats.value.formatTime = Math.round(endTime - startTime);
      formatStats.value.originalLines = inputSql.value.split('\n').length;
      formatStats.value.formattedLines = outputSql.value.split('\n').length;
      formatStats.value.compressionRatio = inputSql.value.length > 0
        ? Math.max(0, Math.round((1 - outputSql.value.length / inputSql.value.length) * 100))
        : 0;
      
    } catch (error) {
      console.error('格式化SQL时出错:', error);
      formatError.value = {
        message: error.message || '格式化过程中发生未知错误',
        line: error.line || null,
        column: error.column || null
      };
    } finally {
      isFormatting.value = false;
    }
  };

  // 压缩SQL
  const compressSql = () => {
    try {
      if (!inputSql.value.trim()) {
        return;
      }

      isFormatting.value = true;
      formatError.value = null;
      
      const startTime = performance.now();
      formatStats.value.originalSize = inputSql.value.length;

      // 使用最小化的格式化选项进行压缩
      const compressOptions = {
        language: options.value.language,
        useTabs: false,
        tabWidth: 2,
        keywordCase: 'preserve',
        linesBetweenQueries: 0,
        denseOperators: true,
        newlineBeforeSemicolon: false,
        logicalOperatorNewline: 'after'
      };

      outputSql.value = format(inputSql.value, compressOptions);
      
      // 计算格式化统计
      const endTime = performance.now();
      formatStats.value.formattedSize = outputSql.value.length;
      formatStats.value.formatTime = Math.round(endTime - startTime);
      formatStats.value.originalLines = inputSql.value.split('\n').length;
      formatStats.value.formattedLines = outputSql.value.split('\n').length;
      formatStats.value.compressionRatio = inputSql.value.length > 0
        ? Math.max(0, Math.round((1 - outputSql.value.length / inputSql.value.length) * 100))
        : 0;
      
    } catch (error) {
      console.error('压缩SQL时出错:', error);
      formatError.value = {
        message: error.message || '压缩过程中发生未知错误',
        line: error.line || null,
        column: error.column || null
      };
    } finally {
      isFormatting.value = false;
    }
  };

  // 加载示例
  const loadExample = () => {
    inputSql.value = currentExample.value;
    outputSql.value = '';
    formatError.value = null;
  };

  // 清空输入
  const clearInput = () => {
    inputSql.value = '';
    outputSql.value = '';
    formatError.value = null;
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

  // 更新SQL方言
  const updateDialect = (dialect) => {
    selectedDialect.value = dialect;
    options.value.language = dialect;
  };

  // 重置所有状态
  const reset = () => {
    inputSql.value = '';
    outputSql.value = '';
    selectedDialect.value = 'sql';
    isFormatting.value = false;
    formatError.value = null;
    formatStats.value = {
      originalSize: 0,
      formattedSize: 0,
      formatTime: 0
    };
    options.value = {
      language: 'sql',
      useTabs: false,
      indentSize: 2,
      keywordCase: 'upper',
      linesBetweenQueries: 2,
      denseOperators: false,
      bracketStyle: 'standard',
      semicolonNewline: false,
      logicalOperatorNewline: 'before',
      enableLiveFormat: false,
      liveFormatDelay: 1000
    };
  };

  // 导出配置
  const exportConfig = () => {
    return JSON.stringify(options.value, null, 2);
  };

  // 导入配置
  const importConfig = (configString) => {
    try {
      const config = JSON.parse(configString);
      options.value = { ...options.value, ...config };
      return true;
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  };

  return {
    // 状态
    inputSql,
    outputSql,
    selectedDialect,
    isFormatting,
    formatError,
    formatStats,
    options,
    sqlDialects,
    exampleQueries,
    
    // 计算属性
    hasInput,
    hasOutput,
    currentExample,
    
    // 方法
    formatSql,
    compressSql,
    loadExample,
    clearInput,
    copyResult,
    updateDialect,
    reset,
    exportConfig,
    importConfig
  };
});