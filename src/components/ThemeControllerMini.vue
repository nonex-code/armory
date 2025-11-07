<script setup>
import { Themes } from "@/utils/Themes.js";
import BaseIcon from "@/components/BaseIcon.vue";

const availableThemes = Themes.availableThemes;
const theme = Themes.currentTheme;

const setTheme = (newTheme) => {
	Themes.apply(newTheme);
}
</script>

<template>
	<div class="dropdown dropdown-top w-full">
		<div tabindex="0" role="button" class="flex items-center w-full px-3 py-2 text-xs rounded-lg transition-all duration-200 hover:bg-base-300/30 border border-transparent hover:border-base-300/30">
			<BaseIcon name="cog" custom-class="size-4 opacity-80 mr-2" />
			<span class="font-medium text-base-content">主题设置</span>
		</div>
		<ul tabindex="0" class="dropdown-content bg-base-100/95 backdrop-blur-sm rounded-lg border border-base-300/30 z-1 mt-2 w-full p-1 shadow-xl">
			<li v-for="t in availableThemes" :key="t.name">
				<label class="flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-all duration-200 hover:bg-base-300/30" :class="{ 'bg-primary/10 text-primary': theme === t.name }">
					<span v-if="t.icon" v-html="t.icon"></span>
					<span v-else class="size-4"></span>
					<input
						type="radio"
						name="theme-dropdown"
						class="theme-controller hidden"
						:aria-label="t.name"
						:value="t.name"
						:checked="theme === t.name"
						@change="setTheme(t.name)"
					/>
					<span class="font-medium">{{ t.name }}</span>
				</label>
			</li>
		</ul>
	</div>
</template>

<style scoped lang="scss">

</style>