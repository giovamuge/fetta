"use client";

import { useEffect, useState } from "react";
import { type Resolver, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ErrorAlert";
import { HistorySheet } from "@/components/HistorySheet";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PackageInput } from "@/components/PackageInput";
import { ProportionInput } from "@/components/ProportionInput";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocale } from "@/components/LocaleProvider";
import { useHistory } from "@/hooks/useHistory";
import type { HistoryEntry } from "@/lib/history";
import { fettaSchema, type FettaFormValues } from "@/lib/schema";
import { solve } from "@/lib/solver/solver";
import type { AllocationResult } from "@/lib/solver/types";

const DEFAULT_VALUES: FettaFormValues = {
	packages: [
		{ weightKg: 5, availableCount: 2 },
		{ weightKg: 6, availableCount: 3 },
	],
	proportions: [
		{ alias: "Alice", weight: 2 },
		{ alias: "Bob", weight: 3 },
		{ alias: "Carlo", weight: 5 },
	],
};

export default function Home() {
	const [result, setResult] = useState<AllocationResult | null>(null);
	const [solverError, setSolverError] = useState<string | null>(null);
	const { entries, save, remove, clear } = useHistory();
	const { dict } = useLocale();

	const methods = useForm<FettaFormValues>({
		resolver: zodResolver(fettaSchema) as Resolver<FettaFormValues>,
		defaultValues: DEFAULT_VALUES,
		mode: "onSubmit",
	});

	const { handleSubmit, formState, getValues, reset } = methods;

	function onSubmit(values: FettaFormValues) {
		setSolverError(null);
		try {
			const allocationResult = solve(values.packages, values.proportions);
			setResult(allocationResult);
			save(allocationResult, values.packages, values.proportions);
		} catch (err) {
			setSolverError(err instanceof Error ? err.message : "Errore sconosciuto.");
			setResult(null);
		}
	}

	function handleRestore(entry: HistoryEntry) {
		reset({
			packages: entry.packages,
			proportions: entry.proportions,
		});
		setResult(null);
		setSolverError(null);
	}

	return (
		<main className="flex-1 container mx-auto max-w-5xl px-4 py-8 space-y-8">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-2">
					<h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
						<Calculator className="size-9" />
						{dict.appName}
					</h1>
					<p className="text-muted-foreground text-sm">{dict.appDescription}</p>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<LanguageSwitcher />
					<ThemeToggle />
					<HistorySheet
						entries={entries}
						onRestore={handleRestore}
						onRemove={remove}
						onClear={clear}
					/>
				</div>
			</div>

			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
					{/* Input grid */}
					<div className="grid gap-4 md:grid-cols-2">
						<PackageInput />
						<ProportionInput />
					</div>

					<Button type="submit" size="lg">
						<Calculator />
						{dict.calculate}
					</Button>

					{solverError && <ErrorAlert message={solverError} />}

					{formState.errors.packages?.root && (
						<ErrorAlert message={formState.errors.packages.root.message ?? ""} />
					)}
					{formState.errors.proportions?.root && (
						<ErrorAlert message={formState.errors.proportions.root.message ?? ""} />
					)}
				</form>
			</FormProvider>

			{result && <ResultsDisplay result={result} />}
		</main>
	);
}
