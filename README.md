## reactx-atom-store

基于**react-context**的**react**原子化状态管理器，具有完整的**ts**类型推测。

### 安装

```
npm i reactx-atom-store -D
```

### 配置

在**store/index.ts**中引入

```
import { useState } from 'react'

/** 1. 引入reactx-atom-store */
import createStore from 'reactx-atom-store'

/** 2. 定义各个原子化状态 */
// user
const user = () => {
  const [ userInfo, setUserInfo ] = useState<{ name: string }>({ name: 'name' })
  return { userInfo, setUserInfo }
}

// other
const other = () => {
  const [ other, setOther ] = useState<{ age: number }>({ age: 20 })
  const [ list, setList ] = useState<number[]>([1])
  return { other, setOther, list, setList }
}

/** 3. 组合所有状态 */
const store = createStore(() => ({
  user: user(),
  other: other(),
}))

/** 向外暴露useModel和StoreProvider */
export const { useModel, StoreProvider } = store
```

### 在顶层注入context

```
// src/main.ts
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
// 引入StoreProvider
import { StoreProvider } from '@/store'

// 使用StoreProvider包裹App组件
ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById('root')
)
```

### 在组件中使用

```
// src/App.tsx
import React from 'react'
import { useModel } from '@/store'

function App() {

  /** 从useModel中取出user状态 */
  const { userInfo, setUserInfo } = useModel('user')

  /** 在点击事件中调用setUserInfo改变状态 */
  const onChange = () => {
    setUserInfo({
      name: userInfo.name + '1',
    })
  }

  // jsx中展示userInfo.name
  return (
    <button onClick={onChange}>{userInfo.name}</button>
  )
}

export default App
```

