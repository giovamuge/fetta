"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/LocaleProvider";
import type { FettaFormValues } from "@/lib/schema";

export function PackageInput() {
	const {
		register,
		formState: { errors },
	} = useFormContext<FettaFormValues>();

	const { fields, append, remove } = useFieldArray<FettaFormValues>({
		name: "packages",
	});

	const { dict } = useLocale();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{dict.packagesTitle}</CardTitle>
				<CardDescription>{dict.packagesDescription}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Column headers */}
				<div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
					<span className="text-xs font-medium text-muted-foreground">
						{dict.weightKg}
					</span>
					<span className="text-xs font-medium text-muted-foreground">
						{dict.quantity}
					</span>
					<span />
				</div>

				{fields.map((field, index) => (
					<div
						key={field.id}
						className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start"
					>
						<div>
							<Input
								type="number"
								step="0.001"
								min="0.001"
								placeholder="es. 5"
								{...register(`packages.${index}.weightKg`)}
								aria-invalid={
									!!errors.packages?.[index]?.weightKg
								}
							/>
							{errors.packages?.[index]?.weightKg && (
								<p className="text-xs text-destructive mt-1">
									{errors.packages[index]?.weightKg?.message}
								</p>
							)}
						</div>
						<div>
							<Input
								type="number"
								step="1"
								min="1"
								placeholder="es. 3"
								{...register(
									`packages.${index}.availableCount`
								)}
								aria-invalid={
									!!errors.packages?.[index]?.availableCount
								}
							/>
							{errors.packages?.[index]?.availableCount && (
								<p className="text-xs text-destructive mt-1">
									{
										errors.packages[index]?.availableCount
											?.message
									}
								</p>
							)}
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-destructive"
							onClick={() => remove(index)}
							disabled={fields.length === 1}
							aria-label={dict.removePackage}
						>
							<Trash2 size={16} />
						</Button>
					</div>
				))}

				<Button
					type="button"
					variant="outline"
					size="sm"
					className="w-full"
					onClick={() =>
						append({ weightKg: NaN, availableCount: NaN })
					}
				>
					<Plus />
					{dict.addPackage}
				</Button>
			</CardContent>
		</Card>
	);
}
