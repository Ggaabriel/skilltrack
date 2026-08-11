import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginDto } from "../model/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "../api/auth.queries";
import { authTokenStore } from "@/shared/api/auth/authToken";

type Props = {};

const LoginForm = (props: Props) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const login = useLogin();
  const onSubmit = (dto: LoginDto) => {
    login.mutate(dto);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("email")} />

      <Input {...register("password")} />

      <Button>Login</Button>
    </form>
  );
};

export default LoginForm;
