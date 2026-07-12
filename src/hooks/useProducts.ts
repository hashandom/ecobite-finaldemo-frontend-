import { useState, useEffect, useCallback } from 'react';
import { Product, LowStockSupplier } from '@/types';
import { ProductService } from '@/services/product.service';
import { ReorderService } from '@/services/reorder.service';
import toast from 'react-hot-toast';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [lowStockItems, setLowStockItems] = useState<LowStockSupplier[]>([]);

  const fetchLowStockData = useCallback(async (currentProducts?: Product[]) => {
    try {
      const activeProducts = currentProducts || [];
      const [count, items] = await Promise.all([
        ProductService.getLowStockCount().catch(() => {
          return activeProducts.filter(p => (p.stock || 0) <= (p.reorderLevel || 0)).length;
        }),
        ReorderService.getLowStockSuppliers().catch((err) => {
          console.warn('API error fetching low stock suppliers, falling back to local calculation:', err);
          return activeProducts
            .filter(p => (p.stock || 0) <= (p.reorderLevel || 0))
            .map(p => ({
              productId: p.id,
              productName: p.name,
              currentStock: p.stock || 0,
              reorderLevel: p.reorderLevel || 0,
              supplierId: null,
              supplierName: null,
              supplierEmail: null,
              supplierPhone: null
            }));
        })
      ]);
      setLowStockCount(count);
      setLowStockItems(items);
    } catch (err) {
      console.error('Error fetching low stock data', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductService.getAll();
      setProducts(data);
      fetchLowStockData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [fetchLowStockData]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductError = (errorResponse: any) => {
    if (typeof errorResponse === 'object' && errorResponse !== null) {
      if (errorResponse.error) {
        toast.error(errorResponse.error);
        return;
      }
      
      const errorKeys = Object.keys(errorResponse);
      const validationKeys = errorKeys.filter(k => k !== 'status' && k !== 'message' && k !== 'data');
      if (validationKeys.length > 0) {
        validationKeys.forEach(key => {
          toast.error(errorResponse[key]);
        });
        return;
      }
    }
    toast.error(errorResponse?.message || 'An unexpected error occurred');
  };

  const createProduct = async (productData: Partial<Product>) => {
    try {
      await ProductService.create(productData);
      await fetchProducts();
      toast.success('Product created successfully');
      return true;
    } catch (err: any) {
      handleProductError(err.response?.data || err);
      return false;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await ProductService.update(id, productData);
      await fetchProducts();
      toast.success('Product updated successfully');
      return true;
    } catch (err: any) {
      handleProductError(err.response?.data || err);
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await ProductService.delete(id);
      await fetchProducts();
      toast.success('Product deleted successfully');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete product');
      return false;
    }
  };

  const searchProducts = async (name: string) => {
    setLoading(true);
    try {
      const data = await ProductService.search(name);
      setProducts(data);
    } catch (err: any) {
      toast.error('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const fetchByCategory = async (category: string) => {
    setLoading(true);
    try {
      const data = await ProductService.getByCategory(category);
      setProducts(data);
    } catch (err: any) {
      toast.error('Failed to fetch category');
    } finally {
      setLoading(false);
    }
  };

  const updateProductStock = async (id: string, stock: number) => {
    try {
      await ProductService.updateStock(id, stock);
      await fetchProducts();
      toast.success('Stock updated');
      return true;
    } catch (err: any) {
      toast.error('Failed to update stock');
      return false;
    }
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    fetchByCategory,
    updateProductStock,
    lowStockCount,
    lowStockItems,
    fetchLowStockData
  };
};
