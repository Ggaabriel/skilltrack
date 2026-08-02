import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { 
  useAuthIsOpen,
  useAuthMode,
  useCloseAuth,
  useOpenAuth
} from "../model/selectors";

import LoginForm from "./login-form";
import RegisterForm from "./register-form";

export function AuthDialog() {
  const isOpen = useAuthIsOpen();
  const mode = useAuthMode();
  const closeAuth = useCloseAuth();
  const openAuth = useOpenAuth();

  const isLogin = mode === "login";

  return (
    <Dialog open={isOpen} onOpenChange={closeAuth}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLogin ? "Sign in" : "Create account"}
          </DialogTitle>

          <DialogDescription>
            {isLogin
              ? "Welcome back!"
              : "Welcome to SkillTrack!"}
          </DialogDescription>
        </DialogHeader>

        {isLogin ? <LoginForm /> : <RegisterForm />}

        <div className="text-center text-sm">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => openAuth("register")}
              >
                Create one
              </Button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => openAuth("login")}
              >
                Sign in
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}