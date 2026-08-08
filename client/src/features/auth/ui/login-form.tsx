import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginDto } from "../model/schemas";

type Props = {};

const LoginForm = (props: Props) => {
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginDto) => {
    
  }

  return <form onSubmit={() => 123}></form>;
};

export default LoginForm;
