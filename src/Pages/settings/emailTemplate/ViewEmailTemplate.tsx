import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Calendar } from "lucide-react";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchEmailTemplateByIdAction,
  clearCurrentTemplate,
} from "./services/emailTemplateSlice";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/UI/button/Button";
import PageMeta from "@/components/common/PageMeta";
import { formatDateWithTiming } from "@/components/common/dateFormat";
import { decryptData } from "@/utility/crypto";
import Loader from "../../../components/UI/Loader";

const ViewEmailTemplate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTemplate, loadingCurrent } = useSelector(
    (state: RootState) => state.emailTemplate
  );

  const decryptedId = id ? decryptData(decodeURIComponent(id)) : null;

  useEffect(() => {
    if (decryptedId) {
      dispatch(fetchEmailTemplateByIdAction(decryptedId));
    }
    return () => {
      dispatch(clearCurrentTemplate());
    };
  }, [dispatch, decryptedId]);

  if (loadingCurrent || !currentTemplate) {
    return (
      <div className="space-y-6">
        <PageMeta
          title="View Email Template | VyaparSetu"
          description="View email template details"
        />
        <ComponentCard title="View Email Template">
          <Loader className="h-64" />
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageMeta
        title="View Email Template | VyaparSetu"
        description="View email template details"
      />

      <ComponentCard
        title="View Email Template"
        rightButtonNode={
          <div className="flex gap-2">
            <Button variant="outline" size="xs" onClick={() => navigate(`/settings/email-templates/edit/${id}`)}>
              Edit
            </Button>
            <Button variant="danger" size="xs" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        }
      >
        <div className="space-y-8 mt-4">
          {/* <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentTemplate.name}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${currentTemplate.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {currentTemplate.isActive ? "Active" : "Inactive"}
                </span>
                • Created {formatDateWithTiming(currentTemplate.createdAt)}
              </p>
            </div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Subject Line</p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {currentTemplate.subject}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Last Updated
              </p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDateWithTiming(currentTemplate.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Email Preview</p>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#0B1120]">
              <div className="p-6 md:p-8 min-h-[400px]">
                <div
                  className="prose dark:prose-invert max-w-none prose-sm sm:prose-base prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary-600"
                  dangerouslySetInnerHTML={{ __html: currentTemplate.content }}
                />
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
};

export default ViewEmailTemplate;
