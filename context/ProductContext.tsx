'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { PRODUCTS, Product } from '@/data/mock/products'

type ProductContextType = {
  product: Product
  setProductId: (id: string) => void
  products: Product[]
}

const ProductContext = createContext<ProductContextType>({
  product: PRODUCTS[0],
  setProductId: () => {},
  products: PRODUCTS,
})

export function ProductProvider({ children }: { children: ReactNode }) {
  const [productId, setProductId] = useState(PRODUCTS[0].id)
  const product = PRODUCTS.find(p => p.id === productId) ?? PRODUCTS[0]
  return (
    <ProductContext.Provider value={{ product, setProductId, products: PRODUCTS }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct() {
  return useContext(ProductContext)
}
