import { reactive, computed } from "vue";

export interface CustomOrderDetails {
  type: string;
  flavors: string[];
  text: string;
  occasion: string;
  motif: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  qty: number;
  isCustom?: boolean;
  customDetails?: CustomOrderDetails;
  inspirationImageFile?: File;
}

const state = reactive({
  items: [] as CartItem[],
  open: false,
  checkoutStep: false,
});

export function useCart() {
  const cartCount = computed(() =>
    state.items.reduce((sum, i) => sum + i.qty, 0)
  );

  const cartTotal = computed(() =>
    state.items.reduce((sum, i) => (i.isCustom ? sum : sum + i.price * i.qty), 0)
  );

  const hasCustomItems = computed(() => state.items.some((i) => i.isCustom));

  function addToCart(product: Omit<CartItem, "qty"> & { qty?: number }) {
    const existing = state.items.find((i) => i.id === product.id);
    if (existing && !product.isCustom) {
      existing.qty += product.qty ?? 1;
    } else {
      state.items.push({ ...product, qty: product.qty ?? 1 });
    }
    state.open = true;
    state.checkoutStep = false;
  }

  function removeFromCart(id: string) {
    const idx = state.items.findIndex((i) => i.id === id);
    if (idx >= 0) state.items.splice(idx, 1);
  }

  function setQty(id: string, qty: number) {
    const item = state.items.find((i) => i.id === id);
    if (!item) return;
    if (qty < 1) removeFromCart(id);
    else item.qty = qty;
  }

  function clearCart() {
    state.items.splice(0);
    state.checkoutStep = false;
  }

  function openCart() {
    state.open = true;
  }

  function closeCart() {
    state.open = false;
    state.checkoutStep = false;
  }

  function goToCheckout() {
    state.checkoutStep = true;
  }

  function goBackToCart() {
    state.checkoutStep = false;
  }

  return {
    items: state.items,
    isOpen: computed(() => state.open),
    isCheckoutStep: computed(() => state.checkoutStep),
    cartCount,
    cartTotal,
    hasCustomItems,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    openCart,
    closeCart,
    goToCheckout,
    goBackToCart,
  };
}
