import React, { createContext,  useContext, ComponentType, ComponentProps } from 'react'

/** 创建context组合useState状态Store */
function createStore<T>(store: () => T) {

  // eslint-disable-next-line
  const ModelContext: any = {}

  /** 使用model */
  function useModel<K extends keyof T>(key: K) {
    return useContext(ModelContext[key]) as T[K]
  }

  /** 当前的状态 */
  let currentStore: T
  /** 上一次的状态 */
  let prevStore: T

  /** 创建状态注入组件 */
  function StoreProvider(props: { children: React.ReactNode }) {
    currentStore = store()
    /** 如果有上次的context状态，做一下浅对比，
     * 如果状态没变，就复用上一次context的value指针，避免context重新渲染
    */
    if(!!prevStore) {
      for(let key in prevStore) {
        if(Shallow(prevStore[key], currentStore[key])) {
          currentStore[key] = prevStore[key]
        }
      }
    }
    prevStore = currentStore
    // eslint-disable-next-line
    let keys: any[] = Object.keys(currentStore)
    let i = 0, length = keys.length
    /** 遍历状态，递归形成多层级嵌套Context */
    function getContext<T, K extends keyof T>(key: K, val: T, children: React.ReactNode): JSX.Element {
      let Context = ModelContext[key] || (ModelContext[key] = createContext(val[key]))
      const currentIndex = ++i
      /** 返回嵌套的Context */
      return React.createElement(Context.Provider, {
        value: val[key],
      },
      currentIndex < length ? getContext(keys[currentIndex], val, children) : children
      )
    }
    return getContext(keys[i], currentStore, props.children)
  }

  /** 获取当前状态, 方便在组件外部使用 */
  function getModel<K extends keyof T>(key: K): T[K] {
    return currentStore[key]
  }

  /** 连接Model注入到组件中 */
  function connectModel<Selected, K extends keyof T>(key: K, selector: (state: T[K]) => Selected) {
    return function<P, C extends ComponentType<any>>(WarpComponent: C): ComponentType<Omit<ComponentProps<C>, keyof Selected>>{
      function Connect(props: P) {
        const val = useModel(key)
        const state = selector(val)
        /** @ts-ignore */
        return React.createElement(WarpComponent, {
          ...props,
          ...state
        })
      }
      return Connect as unknown as ComponentType<Omit<ComponentProps<C>, keyof Selected>>
    }
  }

  return {
    useModel,
    connectModel,
    StoreProvider,
    getModel,
  }
}

export default createStore

/** 浅对比对象 */
function Shallow<T>(obj1: T, obj2: T) {
  if(obj1 === obj2) return true
  if(Object.keys(obj1).length !== Object.keys(obj2).length) return false
  for(let key in obj1) {
    if(obj1[key] !== obj2[key]) return false
  }
  return true
}