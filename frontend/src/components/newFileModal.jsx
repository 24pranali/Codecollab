import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";

const languageOptions = ["javascript", "python", "cpp", "java", "html"];

export function NewFileModal({ onCreate, open, onOpenChange }) {
  const [fileName, setFileName] = useState("");
  const [language, setLanguage] = useState("javascript");

  const handleCreate = () => {
    if (!fileName.trim()) {
      alert("Please enter a valid file name.");
      return;
    }
    onCreate({ name: fileName, language });
    setFileName("");
    setLanguage("javascript");
    onOpenChange(false); // Close modal
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <Select value={language} onValueChange={setLanguage}>
  <SelectTrigger>
    <SelectValue placeholder="Select language" />
  </SelectTrigger>
  <SelectContent className="bg-white text-black dark:bg-gray-800 dark:text-white">
    {languageOptions.map((lang) => (
      <SelectItem key={lang} value={lang}>
        {lang}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
          <Button onClick={handleCreate} className="w-full bg-green-600 hover:bg-green-700">
            Create File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
