'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity_unit: string;
  description: string | null;
  meeting_point: string | null;
  created_at: string;
}

export default function MyProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/products/my-products');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);

      const response = await fetch('/api/products/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productToDelete.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      // Remove the product from the list
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              My Products
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">
              Manage your listed products
            </p>
          </div>
          <Button onClick={() => router.push('/')} variant="outline" size="sm" className="text-xs sm:text-sm flex-shrink-0">
            Back
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Loading your products...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-3 sm:mb-4">{error}</div>
            <Button onClick={fetchProducts} className="mt-4" variant="outline" size="sm">
              Retry
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              You haven't listed any products yet.
            </div>
            <Button onClick={() => router.push('/')} size="sm" className="w-full sm:w-auto">
              Go to Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">{product.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Listed on {formatDate(product.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pb-3">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        ${product.price.toFixed(2)}
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1">
                          per {product.quantity_unit}
                        </span>
                      </p>
                    </div>
                    {product.description && (
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                          {product.description}
                        </p>
                      </div>
                    )}
                    {product.meeting_point && (
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Meeting Point
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {product.meeting_point}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button
                    onClick={() => handleDeleteClick(product)}
                    variant="destructive"
                    size="sm"
                    className="w-full text-xs sm:text-sm"
                  >
                    Delete Product
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{productToDelete?.name}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
