<template>
  <pro-radio-button
    v-model="labelPosition"
    :data="data"
    style="margin-bottom: 18px"
  />
  <pro-form
    v-model="form"
    :columns="columns"
    :label-position="labelPosition"
    label-width="100px"
    @submit="submit"
  />
</template>

<script>
import { defineComponent, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { defineFormColumns, defineFormSubmit } from 'element-pro-components'

export default defineComponent({
  setup() {
    const labelPosition = ref('left')
    const form = ref({})
    const columns = defineFormColumns([
      {
        label: 'Name',
        prop: 'name',
        component: 'el-input',
      },
      {
        label: 'Address',
        prop: 'address',
        component: 'el-input',
      },
    ])
    const data = [
      { label: 'Left', value: 'left' },
      { label: 'Right', value: 'right' },
      { label: 'Top', value: 'top' },
    ]
    const submit = defineFormSubmit((done, isValid, invalidFields) => {
      ElMessage(`submit: ${isValid}`)
      console.log(form.value, isValid, invalidFields)
      setTimeout(() => {
        done()
      }, 1000)
    })

    return {
      labelPosition,
      data,
      form,
      columns,
      submit,
    }
  },
})
</script>
