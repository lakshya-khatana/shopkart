import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());

  const refresh = useCallback(async () => {
    if (!user) return setIds(new Set());
    try {
      const { data } = await api.get("/auth/wishlist");
      setIds(new Set(data.map((p) => p._id)));
    } catch {
      setIds(new Set());
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = async (productId) => {
    const { data } = await api.post(`/auth/wishlist/${productId}`);
    setIds(new Set(data.wishlist.map(String)));
  };

  const isWishlisted = (productId) => ids.has(productId);

  return (
    <WishlistContext.Provider value={{ toggle, isWishlisted, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);