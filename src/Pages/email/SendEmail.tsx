import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/UI/button/Button";
import Input from "../../components/form/input/InputField";
import { Label } from "../../components/layout/label";
import Select from "../../components/form/Select";
import Radio from "../../components/form/input/Radio";

import type { AppDispatch, RootState } from "../../store";
import { sendEmailAction } from "./services/emailSlice";
import { getEmailTemplates } from "../settings/emailTemplate/services/emailTemplateService";

interface EmailFormData {
  type: "custom" | "manual";
  subtype?: string;
  templateSelection?: string;
  to?: string;
  subject: string;
  cc?: string;
  bcc?: string;
  content: string;
}

const SUBTYPES = [
  { value: "all", label: "All Admins" },
  { value: "expired", label: "Expired" },
  { value: "ExpiringSoonUsers", label: "Expiring Soon (7 days)" },
  { value: "activeUsers", label: "Active Users" },
  { value: "inActiveUsers", label: "Inactive Users" },
  { value: "trialing", label: "Trialing" },
  { value: "pastDue", label: "Past Due" },
  { value: "pendingOnboarding", label: "Pending Onboarding" },
  { value: "activePaid", label: "Active Paid" },
  { value: "cancelled", label: "Cancelled" },
];

const SendEmail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSending } = useSelector((state: RootState) => state.email || { isSending: false });
  const editor = useRef(null);

  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    defaultValues: {
      type: "custom",
      subtype: "all",
      content: "",
      subject: "",
    },
  });

  const type = watch("type");
  const templateSelection = watch("templateSelection");

  useEffect(() => {
    const loadTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await getEmailTemplates(1, 10000);
        if (response?.data) {
          setTemplates(response.data);
        }
      } catch (err) {
        toast.error("Failed to load email templates.");
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

  useEffect(() => {
    if (templateSelection) {
      const selectedTpl = templates.find((t) => t._id === templateSelection);
      if (selectedTpl) {
        setValue("subject", selectedTpl.subject);
        setValue("content", selectedTpl.content);
      }
    }
  }, [templateSelection, templates, setValue]);

  const onSubmit = async (data: EmailFormData) => {
    if (!data.content) {
      toast.error("Content is required.");
      return;
    }

    let payload: any = {
      type: data.type,
      subject: data.subject,
      content: data.content,
    };

    if (data.cc) payload.cc = data.cc;
    if (data.bcc) payload.bcc = data.bcc;

    if (data.type === "custom") {
      if (!data.subtype) {
        toast.error("Please select a subtype for custom email.");
        return;
      }
      payload.subtype = data.subtype;
      // payload.templateId = null;
    } else {
      if (!data.to) {
        toast.error("To email is required for manual send.");
        return;
      }
      payload.to = data.to;
    }

    const resultAction = await dispatch(sendEmailAction(payload));
    if (sendEmailAction.fulfilled.match(resultAction)) {
      reset({
        type: "custom",
        subtype: "all",
        content: "",
        subject: "",
        cc: "",
        bcc: "",
        templateSelection: "",
        to: "",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Send Email | VyaparSetu" description="Send automated or manual emails" />

      <ComponentCard title="Send Email">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Type Selection */}
          <div className="space-y-2">
            <Label>Email Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="flex space-x-6">
                  <Radio
                    id="type-custom"
                    name="type"
                    value="custom"
                    label="Custom (Bulk to Users)"
                    checked={field.value === "custom"}
                    onChange={field.onChange}
                  />
                  <Radio
                    id="type-manual"
                    name="type"
                    value="manual"
                    label="Manual (Single Email)"
                    checked={field.value === "manual"}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {type === "custom" && (
              <div className="space-y-2">
                <Label>Subtype (Target Audience)</Label>
                <Controller
                  name="subtype"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={SUBTYPES}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select target audience"
                    />
                  )}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Template (Auto-fills Subject & Content)</Label>
              <Controller
                name="templateSelection"
                control={control}
                render={({ field }) => (
                  <Select
                    options={templates.map(tpl => ({ value: tpl._id, label: `${tpl.name} (${tpl.subject})` }))}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder={loadingTemplates ? "Loading templates..." : "Select Template"}
                    disabled={loadingTemplates}
                  />
                )}
              />
            </div>

            {type === "manual" && (
              <div className="space-y-2">
                <Label>To (Recipient Email)</Label>
                <Input
                  {...register("to", { required: type === "manual" ? "Recipient is required" : false })}
                  placeholder="client@example.com"
                  error={!!errors.to}
                  hint={errors.to?.message}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>CC (Optional)</Label>
              <Input
                {...register("cc")}
                placeholder="admin-cc@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>BCC (Optional)</Label>
              <Input
                {...register("bcc")}
                placeholder="admin-bcc@example.com"
              />
            </div>

            {type === "manual" && (
              <div className="space-y-2 md:col-span-2">
                <Label>Subject</Label>
                <Input
                  {...register("subject", { required: "Subject is required" })}
                  placeholder="Custom Email from Platform"
                  error={!!errors.subject}
                  hint={errors.subject?.message}
                />
              </div>
            )}

            {type === "custom" && (
              <div className="space-y-2 md:col-span-2">
                <Label>Subject (From Template)</Label>
                <Input
                  {...register("subject")}
                  placeholder="Subject will auto-fill from template"
                // disabled
                />
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label>Content <span className="text-red-500">*</span></Label>
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
                  onChange={() => { }}
                />
              )}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
              }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSending}>
              {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Email
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default SendEmail;
