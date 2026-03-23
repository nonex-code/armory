<template>
  <div class="flex items-center gap-2">
    <span class="label-text">输出格式:</span>
    <select 
      v-model="options.format" 
      class="select select-sm select-bordered w-36"
    >
      <option value="escape">\uXXXX</option>
      <option value="html">&amp;#XXXX;</option>
      <option value="hex">\xXX</option>
      <option value="codepoint">U+XXXX</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  options: {
    type: Object,
    required: true
  }
});
</script>
