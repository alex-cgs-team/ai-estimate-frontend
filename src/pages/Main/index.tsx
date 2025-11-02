import { Button, FileDropzone, FilesList, Input, TextArea } from "@/components";
import { useState } from "react";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import {
  ACCEPT_FILES,
  TEXT_FILES_LIMIT,
  VISUAL_FILES_LIMIT,
} from "@/shared/config/config";
import type { FileEntry } from "@/types/types";
import { getFileExt, getKind } from "@/utils";
import { ArrowRight } from "lucide-react";
import { useAuth, useError } from "@/hooks";
import { ref as dbRef, push, runTransaction, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { rtdb } from "@/firebase";
import { N8N_WEBHOOK_URL } from "@/shared/constants/env";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";

export const Main = () => {
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const { user, profile } = useAuth();
  const { setToastErrorText } = useError();

  const navigate = useNavigate();

  const imagesCount = items.filter((i) => i.kind === "image").length;
  const textsCount = items.filter((i) => i.kind === "text").length;

  const imgDisabled = imagesCount >= VISUAL_FILES_LIMIT;
  const textDisabled = textsCount >= TEXT_FILES_LIMIT;

  const isDisabled = projectName.length < 3 || items.length < 1;

  const handleDescriptionChange = (id: string, description: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, description } : item))
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const onFiles = (newFiles: File[]) =>
    setItems((prev) => [
      ...prev,
      ...newFiles.map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        kind: getKind(f),
        fileType: getFileExt(f),
        description: "",
      })),
    ]);

  const onSubmit = async () => {
    if (isDisabled || !user) {
      return;
    }
    setLoading(true);
    try {
      const executionId = uuidv4();
      const operationsRef = dbRef(
        rtdb,
        `profiles/${user.uid}/estimates/${executionId}/operations`
      );

      await push(operationsRef, {
        step: "Initializing estimate...",
        status: "pending",
        progress: 0,
      });

      const formData = new FormData();
      formData.append("executionId", executionId);
      formData.append("userId", user.uid);
      formData.append("project_name", projectName);
      formData.append("notes_to_ai", notes);
      formData.append("user_phone", user.phoneNumber || "");
      formData.append("user_name", profile?.name ?? "");
      formData.append("user_role", profile?.role ?? "");

      items.forEach((entry) => {
        formData.append("files", entry.file, entry.file.name);
        formData.append("types", entry.fileType);
        formData.append("descriptions", entry.description);
      });

      await push(operationsRef, {
        step: "Sending data to n8n...",
        status: "in_progress",
        progress: 20,
      });

      const resp = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) throw new Error(`Webhook error ${resp.status}`);
      const respJson = await resp.json();
      console.log(respJson);

      await push(operationsRef, {
        step: "n8n processing finished",
        status: "done",
        progress: 100,
      });

      const estimateRef = dbRef(
        rtdb,
        `profiles/${user.uid}/estimates/${executionId}`
      );
      await set(estimateRef, {
        projectName,
        notes,
        sharedLink: respJson.sharedLink || null,
        createdAt: Date.now(),
      });

      await runTransaction(
        dbRef(rtdb, `profiles/${user.uid}/usage/count`),
        (c) => (c ?? 0) + 1
      );
      navigate(ROUTES.progress, { state: { executionId } });
    } catch (error) {
      console.log(error);
      setToastErrorText(ERRORS_TEXT.submit_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-20 px-4">
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <p className="text-header">{TEXT.tell_us_about_project}</p>

        <div className="flex flex-col gap-2">
          <Input
            value={projectName}
            onChange={setProjectName}
            label={TEXT.project_name}
            placeholder={TEXT.enter_project_name}
          />

          <TextArea
            value={notes}
            onChange={setNotes}
            label={TEXT.notes_to_ai}
            placeholder={TEXT.enter_notes_ai}
            rows={10}
          />

          <FileDropzone
            accept={ACCEPT_FILES}
            imgDisabled={imgDisabled}
            textDisabled={textDisabled}
            onFiles={onFiles}
          />

          {items.length > 0 && (
            <FilesList
              items={items}
              onChangeDescription={handleDescriptionChange}
              onRemove={handleRemove}
            />
          )}
          <Button
            title={TEXT.submit}
            onClick={onSubmit}
            rightIcon={<ArrowRight size={16} color="white" />}
            className="mt-3"
            disabled={isDisabled}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
};
