<template>
  <input v-bind="$attrs" v-model="str" type="color" />
</template>

<script setup lang="ts">
import { vec4 } from 'gl-matrix'
import { ref, watchEffect } from 'vue'
import colorString from 'color-string'

const str = ref('')
const model = defineModel<vec4>()

watchEffect(() => {
  const colors = model.value?.slice(0, 3) ?? [0, 0, 0]
  str.value = colorString.to.hex(colors[0], colors[1], colors[2]) ?? ''
})

watchEffect(() => {
  const color = colorString.get(str.value)
  model.value = vec4.fromValues(
    color?.value[0] ?? 0,
    color?.value[1] ?? 0,
    color?.value[2] ?? 0,
    255,
  )
})
</script>

<style scoped></style>
