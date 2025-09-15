'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

interface CartItem {
  id: string
  name_en: string
  name_ka: string
  price: number
  currency: string
  image?: string
  quantity: number
  stock: number
  min_order_quantity: number
  selectedSize?: string
  cartItemId: string // Unique ID for cart item (product + size combination)
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity' | 'cartItemId'> & { quantity?: number; selectedSize?: string } }
  | { type: 'REMOVE_ITEM'; payload: string } // cartItemId
  | { type: 'UPDATE_QUANTITY'; payload: { cartItemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const quantityToAdd = action.payload.quantity || 1
      const selectedSize = action.payload.selectedSize || ''
      
      // Create unique cart item ID based on product ID + size
      const cartItemId = `${action.payload.id}${selectedSize ? `-${selectedSize}` : ''}`
      
      const existingItem = state.items.find(item => item.cartItemId === cartItemId)
      
      if (existingItem) {
        // If item exists (same product + same size), increase quantity (up to stock limit)
        const newQuantity = Math.min(existingItem.quantity + quantityToAdd, existingItem.stock)
        const updatedItems = state.items.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
        
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
      } else {
        // Add new item with specified quantity and size
        const { quantity, ...itemWithoutQuantity } = action.payload
        const newItem: CartItem = { 
          ...itemWithoutQuantity, 
          quantity: quantityToAdd,
          selectedSize,
          cartItemId
        }
        const updatedItems = [...state.items, newItem]
        
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.cartItemId !== action.payload)
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }

    case 'UPDATE_QUANTITY': {
      const { cartItemId, quantity } = action.payload
      
      const item = state.items.find(item => item.cartItemId === cartItemId)
      if (!item) return state
      
      // Respect minimum order quantity - don't allow below min_order_quantity
      const minQuantity = item.min_order_quantity || 1
      
      if (quantity < minQuantity) {
        // Don't allow decreasing below minimum order quantity
        return state
      }
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: cartItemId })
      }
      
      const updatedItems = state.items.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }

    case 'CLEAR_CART':
      return {
        ...initialState
      }

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
        totalItems: action.payload.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'> & { quantity?: number; selectedSize?: string }) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [mounted, setMounted] = React.useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        // Ensure all cart items have cartItemId for backward compatibility
        const updatedCartItems = cartItems.map((item: any) => ({
          ...item,
          cartItemId: item.cartItemId || `${item.id}${item.selectedSize ? `-${item.selectedSize}` : ''}`
        }))
        dispatch({ type: 'LOAD_CART', payload: updatedCartItems })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        localStorage.removeItem('cart') // Clear corrupted data
      }
    }
  }, [])

  // Save cart to localStorage whenever items change (only after mounted)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(state.items))
    }
  }, [state.items, mounted])

  const addItem = (item: Omit<CartItem, 'quantity' | 'cartItemId'> & { quantity?: number; selectedSize?: string }) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (cartItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartItemId })
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
