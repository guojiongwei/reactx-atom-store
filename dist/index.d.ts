import React from 'react';
declare function createStore<T>(store: () => T): {
    useModel: <K extends keyof T>(key: K) => T[K];
    StoreProvider: (props: {
        children: React.ReactNode;
    }) => React.FunctionComponentElement<React.ProviderProps<T>>;
};
export default createStore;
