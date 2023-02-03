import React, {
  ComponentProps,
  ComponentType,
  createContext,
  useContext,
} from 'react';

/** 创建context组合useState状态Store */
function createStore<T>(store: () => T) {
  // eslint-disable-next-line
  const ModelContext: any = {};

  /** 使用model */
  function useModel<K extends keyof T>(key: K) {
    return useContext(ModelContext[key]) as T[K];
  }

  /** 当前的状态 */
  let currentStore: T;
  /** 上一次的状态 */
  let prevStore: T;

  /** 创建状态注入组件 */
  function StoreProvider(props: { children: React.ReactNode }) {
    currentStore = store();
    /** 如果有上次的context状态，做一下浅对比，
     * 如果状态没变，就复用上一次context的value指针，避免context重新渲染
     */
    if (prevStore) {
      for (const key in prevStore) {
        // @ts-ignore
        if (shallow(prevStore[key], currentStore[key])) {
          // @ts-ignore
          currentStore[key] = prevStore[key];
        }
      }
    }
    prevStore = currentStore;
    // @ts-ignore
    let keys: any[] = Object.keys(currentStore);
    let i = 0;
    const length = keys.length;
    /** 遍历状态，递归形成多层级嵌套Context */
    function getContext<T, K extends keyof T>(
      key: K,
      val: T,
      children: React.ReactNode,
    ): JSX.Element {
      const Context =
        ModelContext[key] || (ModelContext[key] = createContext(val[key]));
      const currentIndex = ++i;
      /** 返回嵌套的Context */
      return React.createElement(
        Context.Provider,
        {
          value: val[key],
        },
        currentIndex < length
          ? getContext(keys[currentIndex], val, children)
          : children,
      );
    }
    return getContext(keys[i], currentStore, props.children);
  }

  /** 获取当前状态, 方便在组件外部使用,也不会引起页面更新 */
  function getModel<K extends keyof T>(key: K): T[K] {
    return currentStore[key];
  }

  /** 连接Model注入到组件中 */
  function connectModel<Selected, K extends keyof T>(
    key: K,
    selector: (state: T[K]) => Selected,
  ) {
    // eslint-disable-next-line func-names
    // @ts-ignore
    return function <P, C extends ComponentType<any>>(
      WarpComponent: C,
    ): ComponentType<Omit<ComponentProps<C>, keyof Selected>> {
      const Connect = (props: P) => {
        const val = useModel(key);
        const state = selector(val);
        // @ts-ignore
        return React.createElement(WarpComponent, {
          ...props,
          ...state,
        });
      };
      return Connect as unknown as ComponentType<
        Omit<ComponentProps<C>, keyof Selected>
      >;
    };
  }

  return {
    useModel,
    connectModel,
    StoreProvider,
    getModel,
  };
}

export default createStore;

function shallow(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}
