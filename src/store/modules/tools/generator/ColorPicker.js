import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useColorPickerStore = defineStore('colorPicker', () => {
  // 状态
  const selectedColor = ref('#FF0000');
  const opacity = ref(1);
  const recentColors = ref([]);

  // 预设颜色
  const presetColors = ref([
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
    '#9999FF', '#993366', '#FFFFCC', '#CCFFFF', '#660066', '#FF8080', '#0066CC', '#CCCCFF',
    '#F0F8FF', '#FAEBD7', '#F0FFFF', '#F5F5DC', '#FFE4C4', '#FFEBCD', '#00008B', '#8B4513'
  ]);

  // 计算属性
  const hasRecentColors = computed(() => recentColors.value.length > 0);

  // 计算颜色格式
  const colorFormats = computed(() => {
    const hex = selectedColor.value;
    const rgb = hexToRgb(hex);
    
    if (!rgb) {
      return {
        hex: '#000000',
        rgb: 'rgb(0, 0, 0)',
        rgba: 'rgba(0, 0, 0, 1)',
        hsl: 'hsl(0, 0%, 0%)'
      };
    }
    
    const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity.value})`;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgba,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    };
  });

  // HEX转RGB（支持 3 位短格式 #RGB）
  const hexToRgb = (hex) => {
    let value = String(hex || '').trim();
    if (value.startsWith('#')) {
      value = value.slice(1);
    }
    if (/^[a-f\d]{3}$/i.test(value)) {
      value = value.split('').map(char => char + char).join('');
    }
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // RGB转HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // 选择预设颜色
  const selectPresetColor = (color) => {
    selectedColor.value = color;
    addToRecentColors(color);
  };

  // 添加到最近使用的颜色
  const addToRecentColors = (color) => {
    if (!recentColors.value.includes(color)) {
      recentColors.value.unshift(color);
      if (recentColors.value.length > 16) {
        recentColors.value = recentColors.value.slice(0, 16);
      }
    }
  };

  // 获取色相渐变
  const getHueGradient = () => {
    return 'background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)';
  };

  // 获取饱和度渐变
  const getSaturationGradient = () => {
    const rgb = hexToRgb(selectedColor.value);
    if (!rgb) {
      // 非法颜色输入时回退到黑色系渐变，避免渲染崩溃
      return 'background: linear-gradient(to right, #808080, #ff0000)';
    }
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return `background: linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`;
  };

  // 获取亮度渐变
  const getLightnessGradient = () => {
    const rgb = hexToRgb(selectedColor.value);
    if (!rgb) {
      return 'background: linear-gradient(to right, #000000, #808080, #ffffff)';
    }
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return `background: linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`;
  };

  // 获取RGB渐变
  const getRgbGradient = () => {
    return 'background: linear-gradient(to right, rgb(255,0,0), rgb(255,255,0), rgb(0,255,0), rgb(0,255,255), rgb(0,0,255), rgb(255,0,255), rgb(255,0,0))';
  };

  return {
    // 状态
    selectedColor,
    opacity,
    recentColors,
    presetColors,
    
    // 计算属性
    hasRecentColors,
    colorFormats,
    
    // 方法
    selectPresetColor,
    addToRecentColors,
    getHueGradient,
    getSaturationGradient,
    getLightnessGradient,
    getRgbGradient,
    hexToRgb,
    rgbToHsl
  };
});