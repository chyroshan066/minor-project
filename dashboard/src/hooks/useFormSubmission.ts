import { useCallback, useMemo } from "react";
import { useForm, FieldValues, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAlert } from "./useAlert";

interface FormSubmissionConfig<T extends FieldValues> {
    schema: z.ZodType<T>;
    defaultValues: DefaultValues<T>;
    onSubmit: (data: T) => Promise<void>;
    successMessage: string;
    successTitle?: string;
    errorTitle?: string;
    errorMessage?: string;
}

export const useFormSubmission = <T extends FieldValues>({
    schema,
    defaultValues,
    onSubmit,
    successMessage,
    successTitle,
    errorTitle = "Submission Failed",
    errorMessage = "Something went wrong. Please try again.",
}: FormSubmissionConfig<T>) => {
    const { alertState, showAlert, hideAlert } = useAlert();

    const formMethods = useForm<T>({
        defaultValues,
        // @ts-expect-error - zodResolver has complex generic constraints that work correctly at runtime
        resolver: zodResolver(schema),
        mode: "onChange",
        reValidateMode: "onChange",
        criteriaMode: "all",
        shouldFocusError: true,
    });

    const { handleSubmit, reset, formState: { isSubmitting } } = formMethods;

    const handleFormSubmit = useCallback(
        async (data: T) => {
            try {
                await onSubmit(data);

                showAlert("success", successMessage, successTitle);

                reset(defaultValues);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : errorMessage;

                showAlert("error", errorMsg, errorTitle);

                console.error("Form submission error:", error);
            }
        },
        [onSubmit, showAlert, reset, defaultValues, successMessage, successTitle, errorMessage, errorTitle]
    );

    // @ts-expect-error - handleSubmit has strict generic constraints but works correctly at runtime
    const onFormSubmit = handleSubmit(handleFormSubmit);

    const isButtonDisabled = useMemo(() => isSubmitting, [isSubmitting]);

    return {
        ...formMethods,
        onFormSubmit,
        isButtonDisabled,
        alertState,
        hideAlert,
    };
};