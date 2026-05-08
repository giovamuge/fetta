"use client";

import { Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/LocaleProvider";
import { parseProportions } from "@/lib/importParsers";
import type { FettaFormValues } from "@/lib/schema";

export function ProportionInput() {
	const {
		register,
		formState: { errors },
	} = useFormContext<FettaFormValues>();

	const { fields, append, remove, replace } = useFieldArray<FettaFormValues>({
		name: "proportions",
	});

	const { dict } = useLocale();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [importMsg, setImportMsg] = useState<string | null>(null);

	function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			const content = ev.target?.result as string;
			const { data, errors: parseErrors } = parseProportions(content);
			if (data.length > 0) replace(data);
			const msgs: string[] = [];
			if (data.length > 0) msgs.push(dict.importSuccess(data.length));
			if (parseErrors.length > 0)
				msgs.push(dict.importErrors(parseErrors.length));
			setImportMsg(msgs.join(" — ") || null);
		};
		reader.readAsText(file);
		e.target.value = "";
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{dict.proportionsTitle}</CardTitle>
				<CardDescription>{dict.proportionsDescription}</CardDescription>
				<CardAction>
					<input
						ref={fileInputRef}
						type="file"
						accept=".csv,.txt"
						className="sr-only"
						tabIndex={-1}
						aria-hidden
						onChange={handleImport}
					/>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="gap-1.5 text-muted-foreground"
						title={dict.importFileHintProportions}
						onClick={() => fileInputRef.current?.click()}
					>
						<Upload size={14} />
						{dict.importFile}
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="space-y-4">
				{importMsg && (
					<p className="text-xs text-muted-foreground">{importMsg}</p>
				)}
				{fields.map((field, index) => {
					const errs = errors.proportions?.[index];
					return (
						<div key={field.id} className="flex gap-2 items-start">
							<Field
								data-invalid={errs?.alias ? "true" : undefined}
								className="flex-1"
							>
								<FieldLabel
									htmlFor={`proportions.${index}.alias`}
								>
									{dict.aliasName}
								</FieldLabel>
								<Input
									id={`proportions.${index}.alias`}
									type="text"
									placeholder={`es. Parte ${index + 1}`}
									{...register(`proportions.${index}.alias`)}
								/>
								<FieldError
									errors={errs?.alias ? [errs.alias] : []}
								/>
							</Field>

							<Field
								data-invalid={errs?.weight ? "true" : undefined}
								className="flex-1"
							>
								<FieldLabel
									htmlFor={`proportions.${index}.weight`}
								>
									{dict.proportion}
								</FieldLabel>
								<Input
									id={`proportions.${index}.weight`}
									type="number"
									step="0.1"
									min="0.001"
									placeholder="es. 2"
									{...register(`proportions.${index}.weight`)}
								/>
								<FieldError
									errors={errs?.weight ? [errs.weight] : []}
								/>
							</Field>

							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="mt-6 shrink-0"
								onClick={() => remove(index)}
								disabled={fields.length === 1}
								aria-label={dict.removeProportionAriaLabel}
							>
								<Trash2 />
							</Button>
						</div>
					);
				})}

				<Button
					type="button"
					variant="outline"
					size="sm"
					className="w-full"
					onClick={() => append({ alias: "", weight: NaN })}
				>
					<Plus />
					{dict.addParticipant}
				</Button>
			</CardContent>
		</Card>
	);
}
