<template>
  <div class="morse-code">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title">摩斯电码工具</h2>
        <p class="text-base-content/70">摩斯电码编码和解码，支持文本和电码互转</p>
        
        <!-- 操作模式选择 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">操作模式</span>
          </label>
          <div class="flex gap-4">
            <label class="cursor-pointer label">
              <input 
                type="radio" 
                v-model="operationMode" 
                value="encode" 
                class="radio radio-primary" 
              />
              <span class="label-text ml-2">编码</span>
            </label>
            <label class="cursor-pointer label">
              <input 
                type="radio" 
                v-model="operationMode" 
                value="decode" 
                class="radio radio-primary" 
              />
              <span class="label-text ml-2">解码</span>
            </label>
          </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">
              {{ operationMode === 'encode' ? '输入文本' : '输入摩斯电码' }}
            </span>
          </label>
          <textarea 
            v-model="inputText" 
            class="textarea textarea-bordered h-32" 
            :placeholder="operationMode === 'encode' ? '请输入要编码为摩斯电码的文本...' : '请输入摩斯电码（使用.和-，用空格分隔字符）...'"
          ></textarea>
        </div>
        
        <!-- 摩斯电码表参考 -->
        <div class="collapse collapse-arrow border border-base-300 mt-4">
          <input type="checkbox" />
          <div class="collapse-title font-medium">摩斯电码表参考</div>
          <div class="collapse-content">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div v-for="(code, char) in morseCodeTable" :key="char" class="flex justify-between">
                <span class="font-mono">{{ char }}</span>
                <span class="font-mono text-primary">{{ code }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex gap-2 mt-4">
          <button 
            class="btn btn-primary" 
            @click="processMorse" 
            :disabled="!inputText.trim()"
          >
            <BaseIcon 
              :name="operationMode === 'encode' ? 'arrow-up' : 'arrow-down'" 
              custom-class="h-5 w-5 mr-2" 
            />
            {{ operationMode === 'encode' ? '编码' : '解码' }}
          </button>
          <button class="btn btn-outline" @click="clearAll">
            <BaseIcon name="trash" custom-class="h-5 w-5 mr-2" />
            清空
          </button>
          <button 
            v-if="outputText" 
            class="btn btn-outline" 
            @click="copyToClipboard"
          >
            <BaseIcon name="clipboard" custom-class="h-5 w-5 mr-2" />
            复制
          </button>
          <button 
            class="btn btn-outline" 
            @click="playSound"
            :disabled="!outputText || operationMode === 'encode'"
          >
            <BaseIcon name="volume-up" custom-class="h-5 w-5 mr-2" />
            播放声音
          </button>
        </div>
        
        <!-- 输出结果 -->
        <div v-if="outputText" class="mt-6">
          <h3 class="text-lg font-semibold mb-3">
            {{ operationMode === 'encode' ? '摩斯电码' : '解码结果' }}
          </h3>
          <div class="form-control">
            <textarea 
              v-model="outputText" 
              class="textarea textarea-bordered h-32 font-mono" 
              readonly
            ></textarea>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="error" class="alert alert-error mt-4">
          <BaseIcon name="exclamation-triangle" custom-class="h-5 w-5" />
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义工具配置
defineOptions({
  name: 'MorseCodePage',
  meta: {
    tool: {
      id: 'morse-code',
      name: '摩斯电码工具',
      description: '摩斯电码编码和解码工具，支持文本和摩斯电码的相互转换',
      category: 'ctf',
      icon: '📡',
      tags: ['摩斯电码', '编码', '解码', '转换', 'CTF'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

// 摩斯电码表
const morseCodeTable = {
  'A': '.-',      'B': '-...',    'C': '-.-.',    'D': '-..',     'E': '.',
  'F': '..-.',    'G': '--.',     'H': '....',    'I': '..',      'J': '.---',
  'K': '-.-',     'L': '.-..',    'M': '--',      'N': '-.',      'O': '---',
  'P': '.--.',    'Q': '--.-',    'R': '.-.',     'S': '...',     'T': '-',
  'U': '..-',     'V': '...-',    'W': '.--',     'X': '-..-',    'Y': '-.--',
  'Z': '--..',    '0': '-----',   '1': '.----',   '2': '..---',   '3': '...--',
  '4': '....-',   '5': '.....',   '6': '-....',   '7': '--...',   '8': '---..',
  '9': '----.',   '.': '.-.-.-',  ',': '--..--',  '?': '..--..',  "'": '.----.',
  '!': '-.-.--',  '/': '-..-.',   '(': '-.--.',   ')': '-.--.-',  '&': '.-...',
  ':': '---...',  ';': '-.-.-.',  '=': '-...-',   '+': '.-.-.',   '-': '-....-',
  '_': '..--.-',  '"': '.-..-.',  '$': '...-..-', '@': '.--.-.',  ' ': '/'
};

// 响应式数据
const operationMode = ref('encode');
const inputText = ref('');
const outputText = ref('');
const error = ref('');

// 反转摩斯电码表（用于解码）
const reverseMorseTable = computed(() => {
  const reversed = {};
  for (const [char, code] of Object.entries(morseCodeTable)) {
    reversed[code] = char;
  }
  return reversed;
});

// 摩斯电码编码函数
const encodeMorse = (text) => {
  const upperText = text.toUpperCase();
  let result = '';
  
  for (let i = 0; i < upperText.length; i++) {
    const char = upperText[i];
    if (morseCodeTable[char]) {
      result += morseCodeTable[char] + ' ';
    } else if (char === ' ') {
      result += '/ ';
    } else {
      // 未知字符，保留原样
      result += char + ' ';
    }
  }
  
  return result.trim();
};

// 摩斯电码解码函数
const decodeMorse = (morseCode) => {
  const codes = morseCode.split(' ');
  let result = '';
  
  for (const code of codes) {
    if (code === '/') {
      result += ' ';
    } else if (reverseMorseTable.value[code]) {
      result += reverseMorseTable.value[code];
    } else if (code.trim() !== '') {
      // 未知电码，保留原样
      result += `[${code}]`;
    }
  }
  
  return result;
};

// 处理摩斯电码
const processMorse = () => {
  error.value = '';
  outputText.value = '';

  try {
    if (operationMode.value === 'encode') {
      // 编码模式
      if (!inputText.value.trim()) {
        throw new Error('请输入要编码的文本');
      }
      outputText.value = encodeMorse(inputText.value);
    } else {
      // 解码模式
      if (!inputText.value.trim()) {
        throw new Error('请输入要解码的摩斯电码');
      }
      outputText.value = decodeMorse(inputText.value);
    }
  } catch (err) {
    error.value = `处理失败: ${err.message}`;
  }
};

// 播放摩斯电码声音
const playSound = () => {
  if (!outputText.value || operationMode.value === 'encode') return;
  
  try {
    // 简单的音频播放实现
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const morseCodes = outputText.value.split(' ');
    
    let currentTime = audioContext.currentTime;
    
    morseCodes.forEach((code, index) => {
      if (code === '/') {
        // 单词间隔，暂停更长
        currentTime += 0.7;
      } else if (code.trim() !== '') {
        // 播放单个字符的电码
        code.split('').forEach((symbol, symbolIndex) => {
          if (symbol === '.') {
            // 短音（点）
            playBeep(audioContext, currentTime, 0.1);
            currentTime += 0.3;
          } else if (symbol === '-') {
            // 长音（划）
            playBeep(audioContext, currentTime, 0.3);
            currentTime += 0.7;
          }
          
          // 字符内间隔
          if (symbolIndex < code.length - 1) {
            currentTime += 0.1;
          }
        });
        
        // 字符间间隔
        if (index < morseCodes.length - 1) {
          currentTime += 0.3;
        }
      }
    });
  } catch (err) {
    console.error('播放声音失败:', err);
    error.value = '播放声音失败，请确保浏览器支持Web Audio API';
  }
};

// 播放蜂鸣声
const playBeep = (audioContext, startTime, duration) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 600; // 频率
  oscillator.type = 'sine'; // 正弦波
  
  gainNode.gain.setValueAtTime(0.3, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

// 清空所有
const clearAll = () => {
  inputText.value = '';
  outputText.value = '';
  error.value = '';
};

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value);
    console.log('复制成功');
  } catch (err) {
    error.value = '复制失败';
  }
};
</script>

<style scoped>
.morse-code {
  max-width: 800px;
  margin: 0 auto;
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.font-mono {
  font-family: 'Courier New', monospace;
}
</style>