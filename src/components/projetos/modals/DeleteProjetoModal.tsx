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
import { useDeleteProjeto, Projeto } from "@/hooks/useProjetos";

interface DeleteProjetoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto: Projeto | null;
}

export function DeleteProjetoModal({
  open,
  onOpenChange,
  projeto,
}: DeleteProjetoModalProps) {
  const deleteProjeto = useDeleteProjeto();

  const handleDelete = async () => {
    if (!projeto) return;
    
    try {
      await deleteProjeto.mutateAsync(projeto.project_id);
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-['Krona_One']">Excluir projeto?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o projeto{" "}
            <span className="font-semibold">{projeto?.project_name || projeto?.company_name}</span>? Esta
            ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteProjeto.isPending}
          >
            {deleteProjeto.isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
