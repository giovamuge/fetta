"use client";

import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocale } from "@/components/LocaleProvider";
import { exportCsv, exportTxt } from "@/lib/exporter";
import type { AllocationResult } from "@/lib/solver/types";

interface ResultsDisplayProps {
	result: AllocationResult;
	name?: string;
}

function formatKg(value: number): string {
	return `${Math.round(value * 1000) / 1000} kg`;
}

function formatDelta(delta: number): string {
	const rounded = Math.round(delta * 1000) / 1000;
	return rounded >= 0 ? `+${rounded} kg` : `${rounded} kg`;
}

function formatComposition(breakdown: Map<number, number>): string {
	return Array.from(breakdown.entries())
		.sort(([a], [b]) => b - a)
		.map(([weight, count]) => `${count}×${weight}kg`)
		.join(", ");
}

function formatPercent(weight: number, total: number): string {
	const pct = (weight / total) * 100;
	return `${Math.round(pct * 10) / 10}%`;
}

export function ResultsDisplay({ result, name }: ResultsDisplayProps) {
	const totalProp = result.parts.reduce((s, p) => s + p.proportionWeight, 0);
	const { dict } = useLocale();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{name || dict.resultsTitle}</CardTitle>
				<CardAction>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => exportCsv(result)}
						>
							<Download />
							CSV
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => exportTxt(result)}
						>
							<FileText />
							TXT
						</Button>
					</div>
				</CardAction>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Summary stats */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<Card size="sm">
						<CardContent className="flex flex-col gap-0.5">
							<p className="text-xs text-muted-foreground">
								{dict.totalWeight}
							</p>
							<p className="font-semibold">
								{formatKg(result.totalWeightKg)}
							</p>
						</CardContent>
					</Card>
					<Card size="sm">
						<CardContent className="flex flex-col gap-0.5">
							<p className="text-xs text-muted-foreground">
								{dict.assignedPackages}
							</p>
							<p className="font-semibold">
								{result.totalAssignedPackageCount}
								<span className="text-muted-foreground font-normal">
									/{result.totalInputPackageCount}
								</span>
							</p>
						</CardContent>
					</Card>
					<Card size="sm">
						<CardContent className="flex flex-col gap-0.5">
							<p className="text-xs text-muted-foreground">
								{dict.totalError}
							</p>
							<p className="font-semibold">
								{formatKg(result.totalAbsoluteErrorKg)}
							</p>
						</CardContent>
					</Card>
					<Card size="sm">
						<CardContent className="flex flex-col gap-1">
							<p className="text-xs text-muted-foreground">
								{dict.strategy}
							</p>
							<Badge
								variant={
									result.strategyUsed === "exact"
										? "default"
										: "secondary"
								}
							>
								{result.strategyUsed}
							</Badge>
						</CardContent>
					</Card>
				</div>

				<Separator />

				{/* Table already provides its own scroll container */}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{dict.alias}</TableHead>
							<TableHead className="text-right">
								{dict.proportionHeader}
							</TableHead>
							<TableHead className="text-right">
								{dict.target}
							</TableHead>
							<TableHead className="text-right">
								{dict.assigned}
							</TableHead>
							<TableHead className="text-right">
								{dict.delta}
							</TableHead>
							<TableHead className="text-right">
								{dict.packagesCount}
							</TableHead>
							<TableHead>{dict.composition}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{result.parts.map((part) => {
							const delta =
								part.assignedWeightKg - part.targetWeightKg;
							const deltaNum = Math.round(delta * 1000) / 1000;
							const deltaLabel =
								deltaNum === 0
									? dict.deltaNoError
									: deltaNum > 0
										? dict.deltaOver
										: dict.deltaUnder;
							return (
								<TableRow key={part.partIndex}>
									<TableCell className="font-medium">
										{part.alias}
									</TableCell>
									<TableCell className="text-right text-muted-foreground">
										{formatPercent(
											part.proportionWeight,
											totalProp
										)}
									</TableCell>
									<TableCell className="text-right">
										{formatKg(part.targetWeightKg)}
									</TableCell>
									<TableCell className="text-right">
										{formatKg(part.assignedWeightKg)}
									</TableCell>
									<TableCell
										className={`text-right font-mono text-sm ${
											deltaNum === 0
												? "text-muted-foreground"
												: deltaNum > 0
													? "text-green-600 dark:text-green-400"
													: "text-red-600 dark:text-red-400"
										}`}
									>
										<Tooltip>
											<TooltipTrigger>
												{formatDelta(delta)}
											</TooltipTrigger>
											<TooltipContent>
												{deltaLabel}
											</TooltipContent>
										</Tooltip>
									</TableCell>
									<TableCell className="text-right">
										{part.packageCount}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{formatComposition(
											part.breakdownBySize
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
