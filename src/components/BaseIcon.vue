<template>
  <!-- 如果是emoji图标，直接显示 -->
  <span 
    v-if="isEmojiIcon" 
    :class="iconClasses"
    v-bind="attributes"
  >{{ props.name }}</span>
  <!-- 如果是自定义URL图标 -->
  <img 
    v-else-if="isCustomUrlIcon" 
    :src="props.name" 
    :class="iconClasses"
    v-bind="attributes"
    @error="handleImageError"
  />
  <!-- 否则使用Heroicons组件 -->
  <component 
    v-else
    :is="iconComponent" 
    :class="iconClasses" 
    v-bind="attributes"
  />
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';

// 定义组件选项
defineOptions({
  name: 'BaseIcon',
  inheritAttrs: false
});

// 定义属性
const props = defineProps({
  /**
   * 图标名称或emoji或URL
   */
  name: {
    type: String,
    required: true
  },
  /**
   * 是否使用实心图标
   */
  solid: {
    type: Boolean,
    default: false
  },
  /**
   * 自定义类名
   */
  customClass: {
    type: String,
    default: ''
  },
  /**
   * 图标类型：'auto'（自动检测）、'heroicon'、'emoji'、'url'
   */
  type: {
    type: String,
    default: 'auto',
    validator: (value) => ['auto', 'heroicon', 'emoji', 'url'].includes(value)
  },
  /**
   * 自定义图标回退选项
   */
  fallback: {
    type: String,
    default: ''
  }
});

// 图标名称映射，将简短名称映射到Heroicons组件路径
const iconNameMap = {
  // 通用图标
  'home': () => import('@heroicons/vue/24/outline/HomeIcon'),
  'settings': () => import('@heroicons/vue/24/outline/CogIcon'),
  'document': () => import('@heroicons/vue/24/outline/DocumentIcon'),
  'folder': () => import('@heroicons/vue/24/outline/FolderIcon'),
  'arrow-left': () => import('@heroicons/vue/24/outline/ArrowLeftIcon'),
  'arrow-right': () => import('@heroicons/vue/24/outline/ArrowRightIcon'),
  'chevron-left': () => import('@heroicons/vue/24/outline/ChevronLeftIcon'),
  'chevron-right': () => import('@heroicons/vue/24/outline/ChevronRightIcon'),
  'chevron-down': () => import('@heroicons/vue/24/outline/ChevronDownIcon'),
  'chevron-up': () => import('@heroicons/vue/24/outline/ChevronUpIcon'),
  'close': () => import('@heroicons/vue/24/outline/XMarkIcon'),
  'x': () => import('@heroicons/vue/24/outline/XMarkIcon'),
  'check': () => import('@heroicons/vue/24/outline/CheckIcon'),
  'check-circle': () => import('@heroicons/vue/24/outline/CheckCircleIcon'),
  'x-mark': () => import('@heroicons/vue/24/outline/XMarkIcon'),
  'x-circle': () => import('@heroicons/vue/24/outline/XCircleIcon'),
  'info': () => import('@heroicons/vue/24/outline/InformationCircleIcon'),
  'warning': () => import('@heroicons/vue/24/outline/ExclamationTriangleIcon'),
  'error': () => import('@heroicons/vue/24/outline/ExclamationCircleIcon'),
  'exclamation-circle': () => import('@heroicons/vue/24/outline/ExclamationCircleIcon'),
  'question': () => import('@heroicons/vue/24/outline/QuestionMarkCircleIcon'),
  
  // 导航图标
  'menu': () => import('@heroicons/vue/24/outline/Bars3Icon'),
  'bars-3': () => import('@heroicons/vue/24/outline/Bars3Icon'),
  'search': () => import('@heroicons/vue/24/outline/MagnifyingGlassIcon'),
  'magnifying-glass': () => import('@heroicons/vue/24/outline/MagnifyingGlassIcon'),
  'notification': () => import('@heroicons/vue/24/outline/BellIcon'),
  'user': () => import('@heroicons/vue/24/outline/UserIcon'),
  
  // 操作图标
  'edit': () => import('@heroicons/vue/24/outline/PencilIcon'),
  'delete': () => import('@heroicons/vue/24/outline/TrashIcon'),
  'show': () => import('@heroicons/vue/24/outline/EyeIcon'),
  'hide': () => import('@heroicons/vue/24/outline/EyeSlashIcon'),
  'copy': () => import('@heroicons/vue/24/outline/ClipboardDocumentIcon'),
  'clipboard-document': () => import('@heroicons/vue/24/outline/ClipboardDocumentIcon'),
  'download': () => import('@heroicons/vue/24/outline/ArrowDownTrayIcon'),
  'arrow-down-tray': () => import('@heroicons/vue/24/outline/ArrowDownTrayIcon'),
  'upload': () => import('@heroicons/vue/24/outline/ArrowUpTrayIcon'),
  'arrow-up-tray': () => import('@heroicons/vue/24/outline/ArrowUpTrayIcon'),
  'duplicate': () => import('@heroicons/vue/24/outline/DocumentDuplicateIcon'),
  'document-duplicate': () => import('@heroicons/vue/24/outline/DocumentDuplicateIcon'),
  'link': () => import('@heroicons/vue/24/outline/LinkIcon'),
  'share': () => import('@heroicons/vue/24/outline/ShareIcon'),
  
  // 状态图标
  'success': () => import('@heroicons/vue/24/outline/CheckCircleIcon'),
  'fail': () => import('@heroicons/vue/24/outline/XCircleIcon'),
  'time': () => import('@heroicons/vue/24/outline/ClockIcon'),
  'secure': () => import('@heroicons/vue/24/outline/ShieldCheckIcon'),
  'shield-check': () => import('@heroicons/vue/24/outline/ShieldCheckIcon'),
  'lock': () => import('@heroicons/vue/24/outline/LockClosedIcon'),
  'key': () => import('@heroicons/vue/24/outline/KeyIcon'),
  'lock-closed': () => import('@heroicons/vue/24/outline/LockClosedIcon'),
  
  // 工具图标
  'tool': () => import('@heroicons/vue/24/outline/WrenchIcon'),
  'adjust': () => import('@heroicons/vue/24/outline/AdjustmentsHorizontalIcon'),
  'adjustments-horizontal': () => import('@heroicons/vue/24/outline/AdjustmentsHorizontalIcon'),
  'filter': () => import('@heroicons/vue/24/outline/FunnelIcon'),
  'refresh': () => import('@heroicons/vue/24/outline/ArrowPathIcon'),
  'swap': () => import('@heroicons/vue/24/outline/ArrowsRightLeftIcon'),
  'arrows-right-left': () => import('@heroicons/vue/24/outline/ArrowsRightLeftIcon'),
  'text': () => import('@heroicons/vue/24/outline/DocumentTextIcon'),
  'code': () => import('@heroicons/vue/24/outline/CodeBracketIcon'),
  'code-bracket': () => import('@heroicons/vue/24/outline/CodeBracketIcon'),
  'code-xml': () => import('@heroicons/vue/24/outline/CodeBracketIcon'),
  'cpu': () => import('@heroicons/vue/24/outline/CpuChipIcon'),
  'cpu-chip': () => import('@heroicons/vue/24/outline/CpuChipIcon'),
  'server': () => import('@heroicons/vue/24/outline/ServerIcon'),
  'cloud': () => import('@heroicons/vue/24/outline/CloudIcon'),
  
  // 主题图标
  'sun': () => import('@heroicons/vue/24/outline/SunIcon'),
  'moon': () => import('@heroicons/vue/24/outline/MoonIcon'),
  'desktop': () => import('@heroicons/vue/24/outline/ComputerDesktopIcon'),
  'computer-desktop': () => import('@heroicons/vue/24/outline/ComputerDesktopIcon'),
  'mobile': () => import('@heroicons/vue/24/outline/DevicePhoneMobileIcon'),
  'device-phone-mobile': () => import('@heroicons/vue/24/outline/DevicePhoneMobileIcon'),
  
  // 数据图标
  'chart': () => import('@heroicons/vue/24/outline/ChartBarIcon'),
  'table': () => import('@heroicons/vue/24/outline/TableCellsIcon'),
  'table-cells': () => import('@heroicons/vue/24/outline/TableCellsIcon'),
  'calendar': () => import('@heroicons/vue/24/outline/CalendarIcon'),
  'tag': () => import('@heroicons/vue/24/outline/TagIcon'),
  'star': () => import('@heroicons/vue/24/outline/StarIcon'),
  'heart': () => import('@heroicons/vue/24/outline/HeartIcon'),
  'bookmark': () => import('@heroicons/vue/24/outline/BookmarkIcon'),
  
  // 加密和安全相关
  'fingerprint': () => import('@heroicons/vue/24/outline/FingerPrintIcon'),
  'lock-open': () => import('@heroicons/vue/24/outline/LockOpenIcon'),
  'security-key': () => import('@heroicons/vue/24/outline/KeyIcon'),
  
  // 格式转换相关
  'import': () => import('@heroicons/vue/24/outline/DocumentArrowDownIcon'),
  'document-arrow-down': () => import('@heroicons/vue/24/outline/DocumentArrowDownIcon'),
  'export': () => import('@heroicons/vue/24/outline/DocumentArrowUpIcon'),
  'document-arrow-up': () => import('@heroicons/vue/24/outline/DocumentArrowUpIcon'),
  'external-link': () => import('@heroicons/vue/24/outline/ArrowTopRightOnSquareIcon'),
  'arrow-top-right-on-square': () => import('@heroicons/vue/24/outline/ArrowTopRightOnSquareIcon'),
  
  // 生成器相关
  'qrcode': () => import('@heroicons/vue/24/outline/QrCodeIcon'),
  'qr-code': () => import('@heroicons/vue/24/outline/QrCodeIcon'),
  'sparkles': () => import('@heroicons/vue/24/outline/SparklesIcon'),
  'emoji': () => import('@heroicons/vue/24/outline/FaceSmileIcon'),
  'face-smile': () => import('@heroicons/vue/24/outline/FaceSmileIcon'),
  'image': () => import('@heroicons/vue/24/outline/PhotoIcon'),
  
  // 测试相关
  'beaker': () => import('@heroicons/vue/24/outline/BeakerIcon'),
  'flask': () => import('@heroicons/vue/24/outline/BeakerIcon'),
  'test': () => import('@heroicons/vue/24/outline/BeakerIcon'),
  
  // 哈希相关
  'hash': () => import('@heroicons/vue/24/outline/HashtagIcon'),
  'file-hash': () => import('@heroicons/vue/24/outline/FingerPrintIcon'),
  
  // 时间相关
  'clock': () => import('@heroicons/vue/24/outline/ClockIcon'),
  'timestamp': () => import('@heroicons/vue/24/outline/ClockIcon'),
  
  // 数据库相关
  'database': () => import('@heroicons/vue/24/outline/CircleStackIcon'),
  'circle-stack': () => import('@heroicons/vue/24/outline/CircleStackIcon'),
  
  // 颜色相关
  'color': () => import('@heroicons/vue/24/outline/SwatchIcon'),
  'palette': () => import('@heroicons/vue/24/outline/SwatchIcon'),
  'swatch': () => import('@heroicons/vue/24/outline/SwatchIcon'),
  
  // 正则相关
  'regex': () => import('@heroicons/vue/24/outline/CodeBracketSquareIcon'),
  'code-bracket-square': () => import('@heroicons/vue/24/outline/CodeBracketSquareIcon'),
  
  // 标识符相关
  'uuid': () => import('@heroicons/vue/24/outline/IdentificationIcon'),
  'identifier': () => import('@heroicons/vue/24/outline/IdentificationIcon'),
  'fingerprint': () => import('@heroicons/vue/24/outline/FingerPrintIcon'),
  
  // CTF相关
  'ctf': () => import('@heroicons/vue/24/outline/PuzzlePieceIcon'),
  'cipher': () => import('@heroicons/vue/24/outline/PuzzlePieceIcon'),
  'puzzle-piece': () => import('@heroicons/vue/24/outline/PuzzlePieceIcon'),
  
  // 文件相关
  'file': () => import('@heroicons/vue/24/outline/DocumentIcon'),
  'folder-open': () => import('@heroicons/vue/24/outline/FolderOpenIcon'),
  'archive-box': () => import('@heroicons/vue/24/outline/ArchiveBoxIcon'),
  'document-text': () => import('@heroicons/vue/24/outline/DocumentTextIcon'),
  
  // 警告相关
  'alert': () => import('@heroicons/vue/24/outline/ExclamationTriangleIcon'),
  'exclamation-triangle': () => import('@heroicons/vue/24/outline/ExclamationTriangleIcon'),
  
  // 对齐相关
  'align-left': () => import('@heroicons/vue/24/outline/Bars3Icon'),
  
  // 补充图标（此前缺失，回退到默认图标）
  'trash': () => import('@heroicons/vue/24/outline/TrashIcon'),
  'arrow-up': () => import('@heroicons/vue/24/outline/ArrowUpIcon'),
  'arrow-down': () => import('@heroicons/vue/24/outline/ArrowDownIcon'),
  'play': () => import('@heroicons/vue/24/outline/PlayIcon'),
  'wifi': () => import('@heroicons/vue/24/outline/WifiIcon'),
  'globe': () => import('@heroicons/vue/24/outline/GlobeAltIcon'),
  'radar': () => import('@heroicons/vue/24/outline/RadioIcon'),
  'volume-up': () => import('@heroicons/vue/24/outline/SpeakerWaveIcon'),
  'clipboard': () => import('@heroicons/vue/24/outline/ClipboardDocumentIcon'),
  'paper-plane': () => import('@heroicons/vue/24/outline/PaperAirplaneIcon'),
  'rocket': () => import('@heroicons/vue/24/outline/RocketLaunchIcon'),
  'bolt': () => import('@heroicons/vue/24/outline/BoltIcon'),
  'academic-cap': () => import('@heroicons/vue/24/outline/AcademicCapIcon'),
  'shield': () => import('@heroicons/vue/24/outline/ShieldCheckIcon'),
  
  // 设置相关
  'cog-6-tooth': () => import('@heroicons/vue/24/outline/Cog6ToothIcon'),
  'photo': () => import('@heroicons/vue/24/outline/PhotoIcon'),
  'information-circle': () => import('@heroicons/vue/24/outline/InformationCircleIcon')
};

// 默认图标组件
const DefaultIcon = defineAsyncComponent(() => import('@heroicons/vue/24/outline/InformationCircleIcon'));

// 判断是否为emoji图标
const isEmojiIcon = computed(() => {
  if (props.type === 'emoji') return true;
  if (props.type === 'heroicon' || props.type === 'url') return false;
  
  // 自动检测emoji
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(props.name);
});

// 判断是否为自定义URL图标
const isCustomUrlIcon = computed(() => {
  if (props.type === 'url') return true;
  if (props.type === 'heroicon' || props.type === 'emoji') return false;
  
  // 自动检测URL
  try {
    new URL(props.name);
    return true;
  } catch {
    return false;
  }
});

// 处理图片加载错误
const handleImageError = (event) => {
  console.warn(`Failed to load image icon: ${props.name}`);
  
  // 如果有回退图标，尝试使用回退图标
  if (props.fallback) {
    event.target.src = props.fallback;
  } else {
    // 否则隐藏图片并显示默认图标
    event.target.style.display = 'none';
    
    // 创建默认图标元素
    const defaultIcon = document.createElement('div');
    defaultIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    event.target.parentNode.appendChild(defaultIcon.firstChild);
  }
};

// 计算图标组件
const iconComponent = computed(() => {
  // 如果是emoji或URL图标，不需要加载Heroicons组件
  if (isEmojiIcon.value || isCustomUrlIcon.value) {
    return null;
  }
  
  // 获取对应的图标导入函数
  const iconImporter = iconNameMap[props.name];
  
  if (!iconImporter) {
    console.warn(`Icon "${props.name}" not found in iconNameMap`);
    return DefaultIcon; // 默认图标
  }
  
  // 使用动态导入创建异步组件
  return defineAsyncComponent({
    loader: iconImporter,
    loadingComponent: DefaultIcon, // 加载时显示默认图标
    errorComponent: DefaultIcon,   // 错误时显示默认图标
    delay: 200,                    // 延迟显示加载组件
    timeout: 3000                  // 超时时间
  });
});

// 计算图标类名
const iconClasses = computed(() => {
  const classes = [];
  
  // 根据图标类型设置默认大小
  if (isEmojiIcon.value) {
    classes.push('inline-block'); // emoji需要inline-block
  } else if (isCustomUrlIcon.value) {
    classes.push('object-contain'); // 图片需要object-contain
  } else {
    classes.push('h-5', 'w-5'); // Heroicons的默认大小
  }
  
  // 添加自定义类名
  if (props.customClass) {
    classes.push(props.customClass);
  }
  
  return classes.join(' ');
});

// 传递给图标组件的属性
const attributes = computed(() => {
  const attrs = { ...props };
  
  // 移除已处理的属性
  delete attrs.name;
  delete attrs.solid;
  delete attrs.customClass;
  
  return attrs;
});
</script>