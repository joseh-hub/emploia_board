import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

interface TimeEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle?: string;
  onSave: (hours: number, minutes: number, description: string, billable: boolean) => void;
  onSkip: () => void;
}

export function TimeEntryModal({
  open,
  onOpenChange,
  taskTitle,
  onSave,
  onSkip,
}: TimeEntryModalProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [description, setDescription] = useState("");
  const [billable, setBillable] = useState(true);

  const handleSave = () => {
    onSave(hours, minutes, description, billable);
    resetForm();
  };

  const handleSkip = () => {
    onSkip();
    resetForm();
  };

  const resetForm = () => {
    setHours(0);
    setMinutes(0);
    setDescription("");
    setBillable(true);
  };

  const handleHoursChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setHours(num);
    } else if (value === "") {
      setHours(0);
    }
  };

  const handleMinutesChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num < 60) {
      setMinutes(num);
    } else if (value === "") {
      setMinutes(0);
    }
  };

  const hasTimeEntered = hours > 0 || minutes > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-['Krona_One']">
            <CheckCircle className="h-5 w-5 text-success" />
            Tarefa Concluída!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {taskTitle && (
            <p className="text-sm text-muted-foreground truncate">
              {taskTitle}
            </p>
          )}

          <div className="space-y-2">
            <Label>Quantas horas você gastou nesta tarefa?</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="hours" className="text-xs text-muted-foreground">
                  Horas
                </Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => handleHoursChange(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="minutes" className="text-xs text-muted-foreground">
                  Minutos
                </Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => handleMinutesChange(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Ex: Desenvolvimento e testes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="billable"
              checked={billable}
              onCheckedChange={(checked) => setBillable(!!checked)}
            />
            <Label htmlFor="billable" className="text-sm cursor-pointer">
              Cobrável
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip}>
            Pular
          </Button>
          <Button onClick={handleSave} disabled={!hasTimeEntered} className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0">
            Salvar Horas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
