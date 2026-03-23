<template>
  <div class="flex flex-wrap items-center gap-4">
    <label class="cursor-pointer label gap-2">
      <input 
        type="checkbox" 
        class="checkbox checkbox-sm checkbox-primary"
        v-model="options.encodeSpace"
      />
      <span class="label-text">空格编码为%20</span>
    </label>
    <label class="cursor-pointer label gap-2">
      <input 
        type="checkbox" 
        class="checkbox checkbox-sm checkbox-primary"
        v-model="options.encodeAll"
      />
      <span class="label-text">编码所有字符</span>
    </label>
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
