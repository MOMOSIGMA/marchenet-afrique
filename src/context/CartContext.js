import { createContext, useContext, useState, useEffect } from "react";
import { getCart, toggleCart, updateCartItem, removeCartItem } from "../api/cart";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCart();
        setCart(res.data);
      } catch {
        setCart([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    await toggleCart(productId, quantity);
    const res = await getCart();
    setCart(res.data);
  };

  const updateQuantity = async (cartItemId, quantity) => {
    await updateCartItem(cartItemId, quantity);
    const res = await getCart();
    setCart(res.data);
  };

  const removeFromCart = async (cartItemId) => {
    await removeCartItem(cartItemId);
    const res = await getCart();
    setCart(res.data);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}