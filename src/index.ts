import React, { createContext, useContext } from 'react'

function createStore<T>(store: () => T) {

  const ModelContext = createContext({} as T)

  function useModel<K extends keyof T>(key: K) {
    return useContext(ModelContext)[key]
  }

  function StoreProvider(props: { children: React.ReactNode }) {
    return React.createElement(ModelContext.Provider, {
      value: store(),
      children: props.children
    })
  }

  return {
    useModel,
    StoreProvider,
  }
}

export default createStore