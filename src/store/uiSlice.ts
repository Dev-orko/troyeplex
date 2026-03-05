import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  searchQuery: string
  activeSection: string
}

const initialState: UIState = {
  sidebarOpen: false,
  searchQuery: '',
  activeSection: 'home',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    setActiveSection(state, action: PayloadAction<string>) {
      state.activeSection = action.payload
    },
  },
})

export const { setSidebarOpen, setSearchQuery, setActiveSection } = uiSlice.actions
export default uiSlice.reducer
