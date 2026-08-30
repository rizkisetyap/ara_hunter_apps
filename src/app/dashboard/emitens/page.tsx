"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { emitenSchema, type Emiten } from "@/lib/schemas/emiten";
import { z } from "zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

const formSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10),
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmitensDashboard() {
  const [emitens, setEmitens] = useState<Emiten[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingEmiten, setEditingEmiten] = useState<Emiten | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "",
      name: "",
      is_active: true,
    },
  });

  const fetchEmitens = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/emitens");
      const json = await res.json();
      if (res.ok) {
        setEmitens(json.data || []);
      } else {
        toast.error(`Failed to fetch: ${json.error}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmitens();
  }, []);

  const handleOpenCreate = () => {
    setEditingEmiten(null);
    reset({ symbol: "", name: "", is_active: true });
    setOpenModal(true);
  };

  const handleOpenEdit = (emiten: Emiten) => {
    setEditingEmiten(emiten);
    setValue("symbol", emiten.symbol);
    setValue("name", emiten.name);
    setValue("is_active", emiten.is_active);
    setOpenModal(true);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const upperValues = {
      ...values,
      symbol: values.symbol.toUpperCase(),
    };

    try {
      if (editingEmiten) {
        const res = await fetch(`/api/emitens/${editingEmiten.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(upperValues),
        });
        const json = await res.json();
        if (res.ok) {
          toast.success("Emiten updated successfully!");
          setOpenModal(false);
          fetchEmitens();
        } else {
          toast.error(json.error || "Failed to update emiten");
        }
      } else {
        const res = await fetch("/api/emitens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(upperValues),
        });
        const json = await res.json();
        if (res.ok) {
          toast.success("Emiten created successfully!");
          setOpenModal(false);
          fetchEmitens();
        } else {
          if (json.error && json.error.includes("unique constraint")) {
            toast.error(`Symbol '${upperValues.symbol}' already exists!`);
          } else {
            toast.error(json.error || "Failed to create emiten");
          }
        }
      }
    } catch (err: any) {
      toast.error(`Error submitting form: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, symbol: string) => {
    if (!confirm(`Are you sure you want to delete ${symbol}?`)) return;

    try {
      const res = await fetch(`/api/emitens/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Emiten ${symbol} deleted successfully!`);
        fetchEmitens();
      } else {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || "Failed to delete emiten");
      }
    } catch (err: any) {
      toast.error(`Error deleting: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Emiten Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage stock symbols, active status, and information.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus size={16} /> Add Emiten
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading emitens...
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emitens.length > 0 ? (
                emitens.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {item.symbol}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      {item.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.symbol)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No emitens found. Click "Add Emiten" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingEmiten ? "Edit Emiten" : "Add New Emiten"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Symbol
              </label>
              <input
                {...register("symbol")}
                placeholder="e.g. BBCA"
                disabled={!!editingEmiten}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 uppercase focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              {errors.symbol && (
                <p className="text-xs text-red-500">{errors.symbol.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Name
              </label>
              <input
                {...register("name")}
                placeholder="e.g. Bank Central Asia Tbk"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                {...register("is_active")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Status
              </label>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingEmiten ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
