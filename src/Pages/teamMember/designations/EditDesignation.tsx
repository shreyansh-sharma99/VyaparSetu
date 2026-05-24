import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import type { AppDispatch, RootState } from "../../../store";
import { updateDesignation } from "./services/designationSlice";
import { getDesignationByIdService } from "./services/designationService";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import Loader from "@/components/UI/Loader";
import { toast } from "react-toastify";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/UI/button/Button";
import { Label } from "@/components/layout/label";
import StatusToggle from "../../../components/form/input/StatusToggle";
import TextArea from "@/components/form/input/TextArea";

interface EditDesignationForm {
    name: string;
    description: string;
    isActive: string;
}

const EditDesignation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { submitting } = useSelector((state: RootState) => state.designation);
    const [isLoading, setIsLoading] = useState(true);

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<EditDesignationForm>({
        defaultValues: { name: "", description: "", isActive: "active" }
    });

    useEffect(() => {
        if (!id) return;

        const fetchDesignation = async () => {
            try {
                const res = await getDesignationByIdService(id);
                const data = res.data?.data || res.data;
                reset({
                    name: data.name,
                    description: data.description,
                    isActive: data.isActive ? "active" : "inactive",
                });
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to load designation");
                navigate("/designations");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDesignation();
    }, [id, reset, navigate]);

    const onSubmit = async (values: EditDesignationForm) => {
        if (!id) return;

        const payload = {
            name: values.name,
            description: values.description,
            isActive: values.isActive === "active",
        };

        try {
            await dispatch(updateDesignation({ id, data: payload })).unwrap();
            navigate("/designations");
        } catch (error) {
            console.error("Failed to update designation:", error);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-[50vh]"><Loader /></div>;
    }

    return (
        <div className="mx-auto">
            <PageMeta title="Edit Designation | VyaparSetu" description="Edit an existing designation" />
            <ComponentCard title="Edit Designation">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    <div>
                        <Label>
                            Designation Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            {...register("name", { required: "Designation name is required" })}
                            placeholder="Enter designation name"
                            error={!!errors.name}
                            hint={errors.name?.message}
                        />
                    </div>

                    <div>
                        <Label>
                            Description
                        </Label>
                        <TextArea
                            {...register("description")}
                            placeholder="Enter designation description"
                        />
                    </div>

                    <div>
                        <Label>
                            Status
                        </Label>
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <StatusToggle
                                    status={field.value}
                                    onStatusChange={field.onChange}
                                    showAll={false}
                                />
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/designations")}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                        >
                            {submitting ? "Updating..." : "Update Designation"}
                        </Button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default EditDesignation;
