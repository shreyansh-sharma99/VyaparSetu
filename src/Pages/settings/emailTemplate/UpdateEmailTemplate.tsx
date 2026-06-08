import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import JoditEditor from "jodit-react";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchEmailTemplateByIdAction,
  updateEmailTemplateAction,
  clearCurrentTemplate,
} from "./services/emailTemplateSlice";
import ComponentCard from "../../../components/common/ComponentCard";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/UI/button/Button";
import { Label } from "@/components/layout/label";
import PageMeta from "@/components/common/PageMeta";
import { decryptData } from "../../../utility/crypto";
import Loader from "../../../components/UI/Loader";

interface UpdateEmailTemplateFormData {
  name: string;
  subject: string;
  content: string;
}

const UpdateEmailTemplate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTemplate, loadingCurrent, updating } = useSelector(
    (state: RootState) => state.emailTemplate
  );
  const editor = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateEmailTemplateFormData>({
    defaultValues: {
      name: "",
      subject: "",
      content: "",
    },
  });

  const decryptedId = id ? decryptData(decodeURIComponent(id)) : null;

  useEffect(() => {
    if (decryptedId) {
      dispatch(fetchEmailTemplateByIdAction(decryptedId));
    }
    return () => {
      dispatch(clearCurrentTemplate());
    };
  }, [dispatch, decryptedId]);

  useEffect(() => {
    if (currentTemplate) {
      reset({
        name: currentTemplate.name,
        subject: currentTemplate.subject,
        content: currentTemplate.content,
      });
    }
  }, [currentTemplate, reset]);

  const onSubmit = async (data: UpdateEmailTemplateFormData) => {
    if (!decryptedId) return;
    const resultAction = await dispatch(updateEmailTemplateAction({ id: decryptedId, data }));
    if (updateEmailTemplateAction.fulfilled.match(resultAction)) {
      navigate("/settings/email-templates");
    }
  };

  if (loadingCurrent) {
    return (
      <div className="space-y-6">
        <PageMeta
          title="Edit Email Template | VyaparSetu"
          description="Edit an existing email template"
        />
        <ComponentCard title="Edit Email Template">
          <Loader className="h-64" />
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageMeta
        title="Edit Email Template | VyaparSetu"
        description="Edit an existing email template"
      />

      <ComponentCard
        title="Edit Email Template"
        rightButtonNode={
          <Button variant="danger" size="xs" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>
                Template Name <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("name", { required: "Template name is required" })}
                placeholder="e.g. Trial Ending Soon Notification"
                error={!!errors.name}
                hint={errors.name?.message}
              />
            </div>
            <div>
              <Label>
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("subject", { required: "Subject is required" })}
                placeholder="e.g. Hey {{name}}, your trial is ending in 2 days!"
                error={!!errors.subject}
                hint={errors.subject?.message}
              />
            </div>
          </div>

          <div>
            <Label>
              Content <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2">
              <Controller
                name="content"
                control={control}
                rules={{ required: "Content is required" }}
                render={({ field }) => (
                  <JoditEditor
                    ref={editor}
                    value={field.value}
                    config={{
                      readonly: false,
                      height: 400,
                    }}
                    onBlur={(newContent) => field.onChange(newContent)}
                    onChange={() => {}}
                  />
                )}
              />
              {errors.content && (
                <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => navigate("/settings/email-templates")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Template"
              )}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default UpdateEmailTemplate;
