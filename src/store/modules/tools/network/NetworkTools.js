import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNetworkToolsStore = defineStore('networkTools', () => {
  // 状态
  const pingHost = ref('');
  const pingResult = ref(null);
  const portToScan = ref('');
  const portScanResult = ref([]);
  const dnsQuery = ref('');
  const dnsResult = ref(null);
  const whoisQuery = ref('');
  const whoisResult = ref('');
  
  // 计算属性
  const canPing = computed(() => {
    return pingHost.value.trim().length > 0;
  });
  
  const canScanPort = computed(() => {
    return portToScan.value.trim().length > 0;
  });
  
  const canQueryDns = computed(() => {
    return dnsQuery.value.trim().length > 0;
  });
  
  const canQueryWhois = computed(() => {
    return whoisQuery.value.trim().length > 0;
  });
  
  // Ping功能（模拟）
  const ping = async () => {
    if (!canPing.value) return;
    
    pingResult.value = {
      host: pingHost.value,
      status: '正在ping...',
      time: 0
    };
    
    try {
      // 模拟ping延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟ping结果
      const success = Math.random() > 0.2; // 80%成功率
      
      if (success) {
        const responseTime = Math.floor(Math.random() * 100) + 10; // 10-110ms
        pingResult.value = {
          host: pingHost.value,
          status: '成功',
          time: responseTime,
          ttl: Math.floor(Math.random() * 64) + 64,
          packets: 4,
          received: 4,
          loss: 0
        };
      } else {
        pingResult.value = {
          host: pingHost.value,
          status: '超时',
          time: 0,
          packets: 4,
          received: 0,
          loss: 100
        };
      }
      
    } catch (err) {
      pingResult.value = {
        host: pingHost.value,
        status: '失败',
        time: 0,
        error: err.message
      };
    }
  };
  
  // 端口扫描（模拟）
  const scanPort = async () => {
    if (!canScanPort.value) return;
    
    const host = portToScan.value.trim();
    const ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3306, 3389, 5432, 8080];
    
    portScanResult.value = [];
    
    for (const port of ports) {
      // 模拟扫描延迟
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 模拟端口状态（随机开放/关闭）
      const isOpen = Math.random() > 0.7; // 30%开放率
      const service = getServiceByPort(port);
      
      portScanResult.value.push({
        port,
        status: isOpen ? '开放' : '关闭',
        service,
        protocol: 'TCP'
      });
    }
  };
  
  // 根据端口获取服务名称
  const getServiceByPort = (port) => {
    const services = {
      21: 'FTP',
      22: 'SSH',
      23: 'Telnet',
      25: 'SMTP',
      53: 'DNS',
      80: 'HTTP',
      110: 'POP3',
      143: 'IMAP',
      443: 'HTTPS',
      993: 'IMAPS',
      995: 'POP3S',
      3306: 'MySQL',
      3389: 'RDP',
      5432: 'PostgreSQL',
      8080: 'HTTP-Alt'
    };
    
    return services[port] || '未知';
  };
  
  // DNS查询（模拟）
  const queryDns = async () => {
    if (!canQueryDns.value) return;
    
    const query = dnsQuery.value.trim();
    
    try {
      // 模拟DNS查询延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟DNS记录
      dnsResult.value = {
        domain: query,
        aRecords: [
          { type: 'A', value: '192.0.2.1', ttl: 3600 },
          { type: 'A', value: '192.0.2.2', ttl: 3600 }
        ],
        aaaaRecords: [
          { type: 'AAAA', value: '2001:db8::1', ttl: 3600 }
        ],
        mxRecords: [
          { type: 'MX', value: 'mail.example.com', priority: 10, ttl: 3600 }
        ],
        nsRecords: [
          { type: 'NS', value: 'ns1.example.com', ttl: 86400 },
          { type: 'NS', value: 'ns2.example.com', ttl: 86400 }
        ],
        cnameRecords: [
          { type: 'CNAME', value: 'www.example.com', ttl: 3600 }
        ],
        txtRecords: [
          { type: 'TXT', value: 'v=spf1 include:_spf.example.com ~all', ttl: 3600 }
        ]
      };
      
    } catch (err) {
      dnsResult.value = {
        domain: query,
        error: 'DNS查询失败：' + err.message
      };
    }
  };
  
  // WHOIS查询（模拟）
  const queryWhois = async () => {
    if (!canQueryWhois.value) return;
    
    const query = whoisQuery.value.trim();
    
    try {
      // 模拟WHOIS查询延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 模拟WHOIS信息
      whoisResult.value = `Domain Name: ${query}
Registrar: Example Registrar, Inc.
Whois Server: whois.example-registrar.com
Referral URL: http://www.example-registrar.com
Name Server: NS1.EXAMPLE.COM
Name Server: NS2.EXAMPLE.COM
Status: clientDeleteProhibited
Status: clientRenewProhibited
Status: clientTransferProhibited
Status: clientUpdateProhibited
Updated Date: 2023-01-01T00:00:00Z
Creation Date: 2020-01-01T00:00:00Z
Expiration Date: 2025-01-01T00:00:00Z`;
      
    } catch (err) {
      whoisResult.value = 'WHOIS查询失败：' + err.message;
    }
  };
  
  // 清空所有结果
  const clearAll = () => {
    pingResult.value = null;
    portScanResult.value = [];
    dnsResult.value = null;
    whoisResult.value = '';
  };
  
  // 加载示例
  const loadExample = (tool) => {
    const examples = {
      ping: '8.8.8.8',
      portScan: 'example.com',
      dns: 'google.com',
      whois: 'example.com'
    };
    
    switch (tool) {
      case 'ping':
        pingHost.value = examples.ping;
        break;
      case 'portScan':
        portToScan.value = examples.portScan;
        break;
      case 'dns':
        dnsQuery.value = examples.dns;
        break;
      case 'whois':
        whoisQuery.value = examples.whois;
        break;
    }
  };
  
  return {
    // 状态
    pingHost,
    pingResult,
    portToScan,
    portScanResult,
    dnsQuery,
    dnsResult,
    whoisQuery,
    whoisResult,
    
    // 计算属性
    canPing,
    canScanPort,
    canQueryDns,
    canQueryWhois,
    
    // 方法
    ping,
    scanPort,
    queryDns,
    queryWhois,
    clearAll,
    loadExample
  };
});