import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginDto } from "../model/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "../api/auth.queries";
import { useCloseAuth } from "../model/selectors";

type Props = {};

const LoginForm = (props: Props) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const closeAuth = useCloseAuth()
  const login = useLogin();
  const onSubmit = (dto: LoginDto) => {
    login.mutate(dto);
    closeAuth()
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("email")} value="john.doe@example.com"/>

      <Input {...register("password")} value="password123" />

      <Button>Login</Button>
    </form>
  );
};

export default LoginForm;
