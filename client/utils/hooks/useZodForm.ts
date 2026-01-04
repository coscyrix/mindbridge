"use client";
import { z, ZodSchema } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UseMutateFunction } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

const useZodForm = (
  schema: ZodSchema,
  mutation?: UseMutateFunction,
  defaultValues?: any
) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues },
  });

  const {
    register,
    watch,
    reset,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const onFormSubmit = mutation
    ? handleSubmit(async (values) => mutation({ ...values }))
    : handleSubmit(() => {});

  return {
    register,
    watch,
    reset,
    onFormSubmit,
    errors,
    control,
    setValue,
    getValues,
    ...form, // Spread the entire form object to expose all methods
  };
};

export default useZodForm;
