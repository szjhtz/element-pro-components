import {
  defineComponent,
  h,
  toRefs,
  markRaw,
  Slot,
  VNode,
  mergeProps,
} from 'vue'
import { ElFormItem, ElButton } from 'element-plus'
import { Plus, Minus } from '@element-plus/icons-vue'
import { useCol } from '../composables/index'
import { useFormItemBind, useFormChild } from './useForm'
import { get, set, has, isArray } from '../utils/index'
import ProFormItem from './FormItem'
import ProFormComponent from './FormComponent'
import { formItemProps } from './props'
import type { UnknownObject } from '../types/index'
import type { IFormColumns } from './type'

export default defineComponent({
  name: 'ProFormItem',
  props: formItemProps,
  emits: ['update:modelValue'],
  setup(props, { slots, emit }) {
    const { item, prop, modelValue, inline } = toRefs(props)
    const bindItem = useFormItemBind(item)
    const { colStyle, colClass } = useCol(item)
    const { hasChild, showAddBtn, add, del, upChildData } = useFormChild(
      props,
      emit
    )

    function upData(value: unknown) {
      emit('update:modelValue', set(modelValue.value, item.value.prop, value))
    }

    function createLabel() {
      if (slots[item.value.prop + '-label']) {
        return (slots[item.value.prop + '-label'] as Slot)({ item: item.value })
      }
    }

    function createError(scope: UnknownObject) {
      if (slots[item.value.prop + '-error']) {
        return (slots[item.value.prop + '-error'] as Slot)({
          ...scope,
          item: item.value,
        })
      }
    }

    function createDefault() {
      !has(modelValue.value, item.value.prop) && upData(undefined)
      const currentValue = get(modelValue.value, item.value.prop, undefined)
      let list: VNode[] = []

      if (hasChild.value) {
        if (isArray(currentValue)) {
          const child = (currentValue as UnknownObject[]).map(
            (value, index) => {
              return h('div', { class: 'children-form' }, [
                h(
                  'div',
                  {
                    class: [
                      !inline.value ? 'el-row' : '',
                      'children-form-item',
                    ],
                  },
                  (item.value.children as IFormColumns).map((child) => {
                    return h(
                      ProFormItem,
                      {
                        modelValue: value,
                        item: child,
                        prop: `${prop.value}.${index}.${child.prop}`,
                        'onUpdate:modelValue': (childValue: UnknownObject) =>
                          upChildData(childValue, index),
                      },
                      slots
                    )
                  })
                ),
                h(ElButton, {
                  icon: markRaw(Minus),
                  type: 'danger',
                  circle: true,
                  class: 'delete-bth',
                  onClick: () => del(index),
                }),
              ])
            }
          )
          list = list.concat(child)
        }
        showAddBtn.value &&
          list.push(
            h(ElButton, {
              icon: markRaw(Plus),
              type: 'primary',
              circle: true,
              onClick: add,
            })
          )
      } else if (slots[item.value.prop]) {
        list = list.concat(
          (slots[item.value.prop] as Slot)({
            item,
            value: currentValue,
            setValue: upData,
          })
        )
      } else {
        list.push(
          h(
            ProFormComponent,
            mergeProps(item.value.props || {}, {
              is: item.value.component,
              modelValue: currentValue,
              'onUpdate:modelValue': upData,
            })
          )
        )
      }

      return list
    }

    return () =>
      h(
        ElFormItem,
        mergeProps(bindItem.value, {
          prop: hasChild.value ? undefined : prop.value,
          style: !inline.value ? colStyle.value : undefined,
          class: ['pro-form-item', !inline.value ? colClass.value : ''],
        }),
        {
          label: () => createLabel(),
          error: (scope: UnknownObject) => createError(scope),
          default: () => createDefault(),
        }
      )
  },
})
