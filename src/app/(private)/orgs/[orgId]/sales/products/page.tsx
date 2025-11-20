"use client";
import { useState, useEffect } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useProductsDB } from "./_internal/useProductsDB";
import { ProductForm } from "./_internal/ProductForm";
import { updateProductField, removeBulkProducts } from "./_internal/server/update-actions";

// ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { showSuccess, showError } from "@/components/feedback";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/pages/QueryErrorUI";
import { CRMHeader } from "@/components/pages/CRMHeader";
import { EmptyState } from "@/components/pages/EmptyState";

export default function ProductPage() {
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);
  const { currentOrganizationId } = useOrganization();
  const {
    data: products,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useProductsDB(currentOrganizationId);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const { confirm, ConfirmModal } = useConfirm();

  // for optimistic update
  const [localProducts, setLocalProducts] = useState(products || []);
  useEffect(() => {
    if (products) {
      setLocalProducts(products);
    }
  }, [products]);

  const handleDropdownChange = async (productId: string, fieldName: string, newValue: string) => {
    const product = localProducts.find((p) => p.id === productId);
    const previousValue = product?.[fieldName as keyof typeof product];

    confirm(
      async () => {
        try {
          const result = await updateProductField({
            productId,
            fieldName,
            newValue,
            oldValue: String(previousValue ?? ""),
            orgId: currentOrganizationId,
          });

          if (result.success) {
            showSuccess(`${fieldName} updated successfully!`);
            refetch!();
          } else {
            showError(result.error || `Failed to update ${fieldName}`);
          }
        } catch (error) {
          showError(`Failed to update ${fieldName}`);
          console.error("Update dropdown error:", error);
        }
      },
      {
        title: `Change ${fieldName}`,
        message: `Are you sure you want to change ${fieldName} from "${previousValue}" to "${newValue}"? This action cannot be undone.`,
        confirmText: "Change",
        variant: "primary",
      }
    );
  };

  const handleCellEdit = async (rowIndex: number, columnIndex: number, newValue: string) => {
    const columnMap: { [key: number]: string } = {
      0: "name",
      1: "sku",
      2: "description",
      3: "type",
      4: "price",
      5: "cost",
      7: "status",
      8: "note",
    };

    const fieldName = columnMap[columnIndex];
    if (!fieldName) return;

    const product = localProducts[rowIndex];
    const productId = product.id;
    const previousValue = product[fieldName as keyof typeof product];

    // 1. Optimistic Update
    setLocalProducts((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [fieldName]: newValue,
      };
      return updated;
    });

    try {
      // 2. Server Action
      const result = await updateProductField({
        productId,
        fieldName,
        newValue,
        oldValue: String(previousValue ?? ""),
        orgId: currentOrganizationId,
      });

      if (!result.success) {
        showError(result.error || "Update failed");
        throw new Error(result.error || "Update failed");
      }

      showSuccess(`${fieldName} updated successfully!`);
    } catch (error) {
      // 3. Rollback
      setLocalProducts((prev) => {
        const rollback = [...prev];
        rollback[rowIndex] = {
          ...rollback[rowIndex],
          [fieldName]: previousValue,
        };
        return rollback;
      });
      console.error("Cell edit error:", error);
    }
  };

  const handleBulkRemove = async () => {
    if (!localProducts || selectedIndices.length === 0) return;

    const selectedIds = selectedIndices.map((i) => localProducts[i].id);

    confirm(
      async () => {
        try {
          const result = await removeBulkProducts(selectedIds, currentOrganizationId);

          if (result.success) {
            showSuccess(`${selectedIds.length} products removed successfully!`);
            refetch!();
            setSelectedIndices([]);
          } else {
            showError(`Failed to remove products: ${result.error}`);
          }
        } catch (error) {
          showError("An error occurred while removing");
          console.error("Remove products error:", error);
        }
      },
      {
        title: "Remove Products",
        message: `Are you sure you want to remove ${selectedIds.length} product(s)? This action cannot be undone.`,
        confirmText: "Remove",
        variant: "danger",
      }
    );
  };

  const data =
    localProducts?.map((product) => [
      product.name,
      product.sku,
      product.description,
      {
        value: (
          <Dropdown
            value={product.type}
            onChange={(e) => handleDropdownChange(product.id, "type", e.target.value)}
          >
            <option value="inventory">Inventory</option>
            <option value="non-inventory">Non-Inventory</option>
            <option value="service">Service</option>
          </Dropdown>
        ),
        rawValue: product.type,
      },
      product.price,
      product.cost,
      product.price - product.cost,
      {
        value: (
          <Dropdown
            value={product.status}
            onChange={(e) => handleDropdownChange(product.id, "status", e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </Dropdown>
        ),
        rawValue: product.status,
      },
      product.note ?? "-",
    ]) || [];

  if (isLoading) return <FetchingSpinner />;

  return (
    <>
      <CRMHeader
        title="Product"
        actions={
          <>
            <Button onClick={refetch} disabled={isFetching}>
              {isFetching ? "refeshing.." : "refresh"}
            </Button>
            <Button onClick={() => setIsFormCollapsed(!isFormCollapsed)}>create</Button>
          </>
        }
      />
      {localProducts && localProducts.length > 0 ? (
        <Table
          headers={[
            "Name",
            "SKU",
            "Description",
            "Type",
            "Price",
            "Cost",
            "Margin",
            "Status",
            "Note",
          ]}
          data={data}
          pageSize={15}
          filterOptions={["TEST", "PROD"]}
          filterColumn={1}
          columnCount={9}
          isEditable
          editableColumns={[0, 1, 2, 4, 5, 8]}
          onCellEdit={handleCellEdit}
          selectedIndices={selectedIndices}
          onSelectionChange={setSelectedIndices}
          isDeletable
          onBulkRemove={handleBulkRemove}
        />
      ) : (
        <EmptyState title="products" />
      )}
      {error && <QueryErrorUI data="product" error={error} onRetry={refetch} />}
      <div
        className={`
          w-130 pt-22 h-screen bg-navbar border-l border-border p-4 fixed right-0 top-0 overflow-y-auto z-40
          transition-transform duration-300 ease-in-out
          ${isFormCollapsed ? "translate-x-full" : "translate-x-0"}
        `}
      >
        <ProductForm
          currentOrgId={currentOrganizationId}
          setFormCollapsed={() => {
            setIsFormCollapsed(true);
          }}
        />
      </div>
      <ConfirmModal />
    </>
  );
}
