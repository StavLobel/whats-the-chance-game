import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChallengeModal({ open, onOpenChange }: CreateChallengeModalProps) {
  const [task, setTask] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || !targetUser.trim()) return;

    // Mock challenge creation
    toast({
      title: "Challenge sent! 🎲",
      description: `${targetUser} has been challenged to: ${task}`,
      duration: 3000,
    });

    // Reset form
    setTask("");
    setTargetUser("");
    setTags([]);
    onOpenChange(false);
  };

  const addTag = () => {
    if (targetUser.trim() && !tags.includes(targetUser.trim())) {
      setTags([...tags, targetUser.trim()]);
      setTargetUser("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">?</span>
            </div>
            Create Challenge
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="task" className="text-foreground font-medium">
              What's the challenge?
            </Label>
            <Textarea
              id="task"
              placeholder="e.g., Do a handstand for 30 seconds"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Target User */}
          <div className="space-y-2">
            <Label htmlFor="user" className="text-foreground font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Challenge someone
            </Label>
            <div className="flex gap-2">
              <Input
                id="user"
                placeholder="@username"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm" variant="outline">
                Add
              </Button>
            </div>
          </div>

          {/* Tagged Users */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Tagged users:</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    @{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="game"
              disabled={!task.trim() || tags.length === 0}
              className="flex-1"
            >
              Send Challenge
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}