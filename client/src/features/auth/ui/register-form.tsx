import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { registerSchema, type RegisterDto } from "../model/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCloseAuth } from "../model/selectors";
import { useRegister } from "../api/auth.queries";

const RegisterForm = () => {
  const form = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "John Doe",
      email: "john3.doe@example.com",
      password: "password123",
    },
  });
  const closeAuth = useCloseAuth();
  const register = useRegister();
  const onSubmit = async (dto: RegisterDto) => {
    await register.mutateAsync(dto);
    closeAuth();
  };

  return (
    <Form {...form}>
      <form
        id="registerForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="name" className="required">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  id="name"
                  placeholder="Enter a name"
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
        <Button form="registerForm" type="submit" disabled={register.isPending}>
          {register.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
