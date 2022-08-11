# reactx-atom-store

基于**react-context**的**react**原子化状态管理器，具有完整的**ts**类型推测。

## 一. 安装

```
npm i reactx-atom-store -S
```

## 二. 配置

### 2.1 在**store/index.ts**中引入

```tsx
import { useState } from 'react'

/** 1. 引入reactx-atom-store */
import createStore from 'reactx-atom-store'

/** 2. 定义各个原子化状态 */
// user
const userModel = () => {
  const [ userInfo, setUserInfo ] = useState<{ name: string }>({ name: 'name' })
  return { userInfo, setUserInfo }
}

// other
const otherModel = () => {
  const [ other, setOther ] = useState<number>(20)
  return { other, setOther }
}

/** 3. 组合所有状态 */
const store = createStore(() => ({
  user: userModel(),
  other: otherModel(),
}))

/** 向外暴露useModel, StoreProvider, getModel, connectModel */
export const { useModel, StoreProvider, getModel, connectModel } = store
```

### 2.3 在顶层通过StoreProvider注入状态

```tsx
// src/main.ts
import React from 'react'
import ReactDOM from 'react-dom'
import App from '@/App'
// 1. 引入StoreProvider
import { StoreProvider } from '@/store'

// 2. 使用StoreProvider包裹App组件
ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById('root')
)
```

## 三. 使用

### 3.1 在函数组件中使用，借助useModel

```tsx
import React from 'react'
import { useModel } from '@/store'

function FunctionDemo() {

  /** 通过useModel取出user状态 */
  const { userInfo, setUserInfo } = useModel('user')

  /** 在点击事件中调用setUserInfo改变状态 */
  const onChangeUser = () => {
    setUserInfo({
      name: userInfo.name + '1',
    })
  }

  // 展示userInfo.name
  return (
    <button onClick={onChangeUser}>{userInfo.name}--改变user中的状态</button>
  )
}

export default FunctionDemo
```

### 3.2 在class组件中使用,借助connectModel

```tsx
import React, { Component } from 'react'
import { connectModel } from '@/store'

// 定义class组件props
interface IClassDemoProps {
  setOther: React.Dispatch<React.SetStateAction<string>>
  other: number
  num: number
}

class ClassDemo extends Component<IClassDemoProps> {

  // 通过this.props获取到方法修改状态
  onChange = () => {
    this.props.setOther(this.props.other + 1)
  }

  render() {
    console.log(this.props.num)
    // 通过this.props获取到状态进行展示
    return <button onClick={this.onChange}>{this.props.other}</button>
  }
}

// 通过高阶组件connectModel把other状态中的属性和方法注入到类组件中
export default connectModel('other',state => ({
  other: state.other,
  setOther: state.setOther
}))(ClassDemo)
```

### 3.3 在组件外使用, 借助getModel

```tsx
import { getModel } from '@/store'

export const onChangeUser = () => {
	// 通过getModel读取usel状态，进行操作
  const user = getModel('user')
  user.setUserInfo({
    name: user.userInfo.name + '1'
  })
}

// 1秒后执行onChangeUser方法
setTimeout(onChangeUser, 1000)
```

