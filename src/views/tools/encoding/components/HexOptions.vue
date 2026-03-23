<template>
  <div class="flex flex-wrap items-center gap-4">
    <label class="cursor-pointer label gap-2">
      <input 
        type="checkbox" 
        class="checkbox checkbox-sm checkbox-primary"
        v-model="options.uppercase"
      />
      <span class="label-text">大写</span>
    </label>
    <div class="flex items-center gap-2">
      <span class="label-text">分隔符:</span>
      <select 
        v-model="options.separator" 
        class="select select-sm select-bordered w-28"
      >
        <option value="space">空格</option>
        <option value="colon">冒号</option>
        <option value="none">无</option>
      </select>
    </div>
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
