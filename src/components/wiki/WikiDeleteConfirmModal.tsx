import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WikiDeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  itemType: "arquivo" | "pasta";
  isLoading?: boolean;
}

export function WikiDeleteConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemType,
  isLoading,
}: WikiDeleteConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-['Krona_One']">Excluir {itemType}?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir "{itemName}"?
            {itemType === "pasta" && (
              <span className="block mt-2 text-destructive font-medium">
                Atenção: Todos os arquivos e subpastas serão excluídos permanentemente.
              </span>
            )}
            <span className="block mt-2">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
