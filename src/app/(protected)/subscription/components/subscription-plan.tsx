"use client";

import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import type React from "react";

import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SubscriptionPlanProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

export function SubscriptionPlan({
  active = false,
  className,
  ...props
}: SubscriptionPlanProps) {
  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: async ({ data }) => {
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe publishable key not found");
      }

      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      );

      if (!stripe) {
        throw new Error("Stripe not found");
      }

      if (!data?.sessionId) {
        throw new Error("Session ID not found");
      }

      await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
    },
  });

  const features = [
    "Cadastro de até 3 médicos",
    "Agendamentos ilimitados",
    "Métricas básicas",
    "Cadastro de pacientes",
    "Confirmação manual",
    "Suporte via e-mail",
  ];

  const handleSubscribeClick = () => {
    createStripeCheckoutAction.execute();
  };

  return (
    <Card className={cn("mx-auto w-full max-w-sm", className)} {...props}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Essential</h3>
          {active && (
            <Badge
              variant="secondary"
              className="text-primary bg-primary/10 border-primary hover:bg-teal-50"
            >
              Atual
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Para profissionais autônomos ou pequenas clínicas
        </p>
      </CardHeader>

      <CardContent className="pb-6">
        <div className="mb-4 flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">R$60</span>
          <span className="ml-1 text-gray-500">/mês</span>
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="bg-primary/10 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                <CheckCircle2 className="text-primary h-5 w-5" />
              </div>
              <span className="text-sm leading-5 text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className={cn(
            "w-full font-medium",
            active
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-900 text-white hover:bg-gray-800",
          )}
          onClick={active ? () => {} : handleSubscribeClick}
          disabled={createStripeCheckoutAction.isExecuting}
        >
          {createStripeCheckoutAction.isExecuting ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : active ? (
            "Gerenciar Assinatura"
          ) : (
            "Fazer assinatura"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
