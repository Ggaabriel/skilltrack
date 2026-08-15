import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginDto } from "../model/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "../api/auth.queries";
import { useCloseAuth } from "../model/selectors";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const LoginForm = () => {
  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "john.doe@example.com",
      password: "password123",
    },
  });

  const closeAuth = useCloseAuth();
  const login = useLogin();
  const onSubmit = async (dto: LoginDto) => {
    await login.mutateAsync(dto);
    closeAuth();
  };

  return (
    <Form {...form}>
      <form
        id="loginForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="email" className="required">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  id="email"
                  placeholder="Enter a email"
                  {...field}
                  className={fieldState.invalid ? "border-red-500" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="password" className="required">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a password"
                  {...field}
                  className={fieldState.invalid ? "border-red-500" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button form="loginForm" type="submit" disabled={login.isPending}>
          {login.isPending ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
