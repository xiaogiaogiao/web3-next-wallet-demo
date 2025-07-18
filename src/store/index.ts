
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import walletReducer from './walletSlice'

// 配置Redux持久化
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['providerType'] // 只持久化providerType
}

// 创建持久化的Redux reducer
const persistedReducer = persistReducer(persistConfig, walletReducer)


export const store = configureStore({
  reducer: {
    wallet: persistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'] // 忽略redux-persist的警告
      }
    })
})


export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch