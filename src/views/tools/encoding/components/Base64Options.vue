<template>
  <div class="flex items-center gap-2">
    <label class="cursor-pointer label gap-2">
      <input 
        type="checkbox" 
        class="checkbox checkbox-sm checkbox-primary"
        v-model="options.urlSafe"
      />
      <span class="label-text">URL安全模式</span>
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
