"use client";

import { AlertCircle } from "lucide-react";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";
import { useLocale } from "@/components/LocaleProvider";

interface ErrorAlertProps {
	message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
	const { dict } = useLocale();
	return (
		<Alert variant="destructive">
			<AlertCircle size={16} />
			<AlertTitle>{dict.errorTitle}</AlertTitle>
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	);
}
