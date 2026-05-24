import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { AppDispatch, RootState } from "../../../store";
import { createDesignation } from "./services/designationSlice";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/UI/button/Button";
import { Label } from "@/components/layout/label";
import TextArea from "@/components/form/input/TextArea";

interface AddDesignationForm {
    name: string;
    description: string;
}

const AddDesignation: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { submitting } = useSelector((state: RootState) => state.designation);

    const { register, handleSubmit, formState: { errors } } = useForm<AddDesignationForm>({
        defaultValues: { name: "", description: "" }
    });

    const onSubmit = async (values: AddDesignationForm) => {
        // Send isActive: true implicitly as requested
        const payload = {
            ...values,
            isActive: true,
        };

        try {
            await dispatch(createDesignation(payload)).unwrap();
            navigate("/designations");
        } catch (error) {
            console.error("Failed to add designation:", error);
        }
    };

    return (
        <div className="mx-auto">
            <PageMeta title="Add Designation | VyaparSetu" description="Add a new designation" />
            <ComponentCard title="Add Designation">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    <div>
                        <Label >
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
                        <Label >
                            Description
                        </Label>
                        <TextArea
                            {...register("description")}
                            placeholder="Enter designation description"
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
                            {submitting ? "Saving..." : "Save Designation"}
                        </Button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default AddDesignation;
