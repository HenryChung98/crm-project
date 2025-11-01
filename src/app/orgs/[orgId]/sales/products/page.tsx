"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useDBProducts } from "./hook/useDBProducts";
import { removeBulkProducts } from "./update/[id]/action";
import { updateProductField } from "./hook/products";

//  ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { Dropdown } from "@/components/ui/Dropdown";
import { showSuccess, showError } from "@/utils/feedback";

export default function ProductPage() {
  const params = useParams<{ orgId: string }>();
  const currentOrgId = params.orgId || "";
  const { confirm, ConfirmModal } = useConfirm();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const { data: products, isLoading, error, refetch, isFetching } = useDBProducts(currentOrgId);
  const [localProducts, setLocalProducts] = useState(products || []);

  useEffect(() => {
    if (products) {
      setLocalProducts(products);
    }
  }, [products]);

  const handleBulkRemove = async () => {
    if (!products || selectedIndices.length === 0) return;
    const selectedIds = selectedIndices.map((i) => products[i].id);

    confirm(
      async () => {
        try {
          const result = await removeBulkProducts(selectedIds, currentOrgId);

          if (result.success) {
            showSuccess(`${selectedIds.length} products removed successfully!`);
            refetch();
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

  const handleSelectionChange = (indices: number[]) => {
    setSelectedIndices(indices);
  };

  const handleCellEdit = async (rowIndex: number, columnIndex: number, newValue: string) => {
    const columnMap: { [key: number]: string } = {
      0: "name",
      1: "sku",
      2: "description",
      4: "price",
      5: "cost",
      8: "note",
    };

    const fieldName = columnMap[columnIndex];
    if (!fieldName) return;

    const product = localProducts[rowIndex];
    const productId = product.id;
    const previousValue = product[fieldName as keyof typeof product];

    setLocalProducts((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [fieldName]: newValue,
      };
      return updated;
    });

    try {
      const result = await updateProductField({
        productId,
        fieldName,
        newValue,
        orgId: currentOrgId,
      });

      if (!result.success) {
        throw new Error(result.error || "Update failed");
      }

      showSuccess(`${fieldName} updated successfully!`);
    } catch (error) {
      setLocalProducts((prev) => {
        const rollback = [...prev];
        rollback[rowIndex] = {
          ...rollback[rowIndex],
          [fieldName]: previousValue,
        };
        return rollback;
      });
      showError("Update failed");
      console.error("Cell edit error:", error);
    }
  };

  const handleStatusChange = (productId: string, newStatus: string) => {
    const rowIndex = localProducts.findIndex((p) => p.id === productId);
    if (rowIndex === -1) return;

    const previousValue = localProducts[rowIndex].status;

    confirm(
      async () => {
        setLocalProducts((prev) => {
          const updated = [...prev];
          updated[rowIndex] = { ...updated[rowIndex], status: newStatus };
          return updated;
        });

        try {
          const result = await updateProductField({
            productId,
            fieldName: "status",
            newValue: newStatus,
            orgId: currentOrgId,
          });

          if (!result.success) {
            throw new Error(result.error || "Update failed");
          }

          showSuccess("Status updated successfully!");
        } catch (error) {
          setLocalProducts((prev) => {
            const rollback = [...prev];
            rollback[rowIndex] = { ...rollback[rowIndex], status: previousValue };
            return rollback;
          });
          showError("Failed to update status");
          console.error("Status change error:", error);
        }
      },
      {
        title: "Change Status",
        message: `Are you sure you want to change status to ${newStatus}?`,
        confirmText: "Change",
        variant: "primary",
      }
    );
  };

  const handleTypeChange = (productId: string, newType: string) => {
    const rowIndex = localProducts.findIndex((p) => p.id === productId);
    if (rowIndex === -1) return;

    const previousValue = localProducts[rowIndex].type;

    confirm(
      async () => {
        setLocalProducts((prev) => {
          const updated = [...prev];
          updated[rowIndex] = { ...updated[rowIndex], type: newType };
          return updated;
        });

        try {
          const result = await updateProductField({
            productId,
            fieldName: "type",
            newValue: newType,
            orgId: currentOrgId,
          });

          if (!result.success) {
            throw new Error(result.error || "Update failed");
          }

          showSuccess("Type updated successfully!");
        } catch (error) {
          setLocalProducts((prev) => {
            const rollback = [...prev];
            rollback[rowIndex] = { ...rollback[rowIndex], type: previousValue };
            return rollback;
          });
          showError("Failed to update type");
          console.error("Type change error:", error);
        }
      },
      {
        title: "Change Type",
        message: `Are you sure you want to change type to ${newType}?`,
        confirmText: "Change",
        variant: "primary",
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
            onChange={(e) => handleTypeChange(product.id, e.target.value)}
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
            className={product.status === "active" ? "text-green-500" : "text-gray-200"}
            onChange={(e) => handleStatusChange(product.id, e.target.value)}
          >
            <option value="active" className="text-gray-200">
              Active
            </option>
            <option value="inactive" className="text-gray-200">
              Inactive
            </option>
            <option value="discontinued" className="text-gray-200">
              Discontinued
            </option>
          </Dropdown>
        ),
        rawValue: product.status,
      },
      product.note || "",
      <Link key={`update-${product.id}`} href={`/sales/products/update/${product.id}`}>
        <Button>Update</Button>
      </Link>,
    ]) || [];

  if (isLoading) return <FetchingSpinner />;
  if (error) return <QueryErrorUI error={error} onRetry={refetch} />;

  return (
    <>
      <div>product page</div>
      <Button onClick={refetch} disabled={isFetching}>
        {isFetching ? "loading.." : "refresh"}
      </Button>
      <Button
        onClick={handleBulkRemove}
        variant={selectedIndices.length === 0 ? "muted" : "danger"}
        disabled={selectedIndices.length === 0 || isFetching}
      >
        Delete
      </Button>
      <Table
        headers={[
          "name",
          "SKU",
          "description",
          "type",
          "price",
          "cost",
          "margin",
          "status",
          "note",
        ]}
        data={data}
        searchable
        pagination
        pageSize={20}
        exportable
        columnCount={10}
        selectable
        filterOptions={["TEST", "PROD"]}
        filterColumn={1}
        editable
        editableColumns={[0, 1, 2, 4, 5, 8]}
        onSelectionChange={handleSelectionChange}
        onCellEdit={handleCellEdit}
      />

      <Link href={`/sales/products/create?org=${currentOrgId}`}>create</Link>
      <ConfirmModal />
    </>
  );
}
